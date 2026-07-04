import express from 'express';
import cors from 'cors';
import type { Pupil } from './types.js';
import { pool } from './db.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); 
//главная страница
app.get('/', (req, res) => {
    res.json({ message: 'Привет! Сервер работает! 🎉' });
});

//все ученики
app.get('/pupils', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pupils ORDER BY id');
        
        // Преобразуем snake_case в camelCase
        const pupils = result.rows.map(p => ({
        id: p.id,
        name: p.name,
        grade: p.grade,
        averageScore: Number(p.average_score),
        homeworkCompleted: Number(p.homework_completed),
        }));
        
        res.json(pupils);
    } catch (error) {
        console.error('Ошибка при получении учеников:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
//конкретный ученик
app.get('/pupils/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM pupils WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Ученик не найден' });
        }
        
        // Преобразуем snake_case в camelCase
        const pupil = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        grade: result.rows[0].grade,
        averageScore: Number(result.rows[0].average_score),
        homeworkCompleted: Number(result.rows[0].homework_completed),
        };
        
        res.json(pupil);
    } catch (error) {
        console.error('Ошибка при получении ученика:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
//Эндпоинт для создания нового ученика
app.post('/pupils', async (req, res) => {
    try {
    const { name, grade, averageScore, homeworkCompleted } = req.body;
    
    const result = await pool.query(
      'INSERT INTO pupils (name, grade, average_score, homework_completed) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, grade, averageScore, homeworkCompleted]
    );
    
    res.status(201).json(result.rows[0]);
    } catch (error) {
    console.error('Ошибка при создании ученика:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
    }
});
//Получаем все домашки конкретного ученика
app.get('/pupils/:id/homeworks', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
        'SELECT * FROM homeworks WHERE pupil_id = $1 ORDER BY created_at DESC', 
        [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении ДЗ:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавить новую домашку и оценку
app.post('/pupils/:id/homeworks', async (req, res) => {
    try {
    const { id } = req.params; // ID ученика из URL
    const { subject, description, grade } = req.body; // Данные из формы
    
    const result = await pool.query(
        `INSERT INTO homeworks (pupil_id, subject, description, grade) 
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [id, subject, description, grade]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при создании ДЗ:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
// Получить все уроки
app.get('/lessons', async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT l.*, p.name as pupil_name 
        FROM lessons l
        JOIN pupils p ON l.pupil_id = p.id
        ORDER BY l.date DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении уроков:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
    });

    // Создать новый урок
    app.post('/lessons', async (req, res) => {
    try {
        const { pupil_id, date, duration, price, status } = req.body;
        
        const result = await pool.query(
        `INSERT INTO lessons (pupil_id, date, duration, price, status) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [pupil_id, date, duration, price, status || 'scheduled']
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при создании урока:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
    });

    // Обновить статус урока
    app.patch('/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const result = await pool.query(
        'UPDATE lessons SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
        );
        
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Урок не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при обновлении урока:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
// Получить статистику для дашборда
app.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        // 1. Общее количество учеников
        const totalPupils = await pool.query('SELECT COUNT(*) FROM pupils');
        
        // 2. Новые ученики за этот месяц
        const newPupilsThisMonth = await pool.query(
        'SELECT COUNT(*) FROM pupils WHERE created_at >= $1',
        [firstDayOfMonth]
        );

        // 3. Проведенные уроки за месяц
        const completedLessons = await pool.query(
        'SELECT COUNT(*) FROM lessons WHERE status = $1 AND date >= $2',
        ['completed', firstDayOfMonth]
        );

        // 4. Отмененные уроки за месяц
        const cancelledLessons = await pool.query(
        'SELECT COUNT(*) FROM lessons WHERE status = $1 AND date >= $2',
        ['cancelled', firstDayOfMonth]
        );

        // 5. Заработок за текущий месяц
        const revenueThisMonth = await pool.query(
        'SELECT SUM(price) FROM lessons WHERE status = $1 AND date >= $2',
        ['completed', firstDayOfMonth]
        );

        // 6. Заработок за прошлый месяц (для сравнения)
        const revenueLastMonth = await pool.query(
        'SELECT SUM(price) FROM lessons WHERE status = $1 AND date >= $2 AND date <= $3',
        ['completed', lastMonthStart, lastMonthEnd]
        );

        // 7. Доход по дням за текущий месяц (для графика)
        const dailyRevenue = await pool.query(
        `SELECT DATE(date) as day, SUM(price) as amount 
        FROM lessons 
        WHERE status = 'completed' AND date >= $1 
        GROUP BY DATE(date) 
        ORDER BY day`,
        [firstDayOfMonth]
        );

        const currentRevenue = Number(revenueThisMonth.rows[0].sum) || 0;
        const lastRevenue = Number(revenueLastMonth.rows[0].sum) || 0;
        const growthPercent = lastRevenue > 0 
        ? (((currentRevenue - lastRevenue) / lastRevenue) * 100).toFixed(1)
        : 0;

        res.json({
        totalPupils: Number(totalPupils.rows[0].count),
        newPupilsThisMonth: Number(newPupilsThisMonth.rows[0].count),
        completedLessons: Number(completedLessons.rows[0].count),
        cancelledLessons: Number(cancelledLessons.rows[0].count),
        revenueThisMonth: currentRevenue,
        revenueLastMonth: lastRevenue,
        growthPercent: Number(growthPercent),
        dailyRevenue: dailyRevenue.rows,
        });
    } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
// Удалить ученика
app.delete('/pupils/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM pupils WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Ученик не найден' });
        }
        
        res.json({ message: 'Ученик удален', pupil: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при удалении ученика:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
    });

    // Обновить данные ученика
    app.put('/pupils/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, grade, averageScore, homeworkCompleted } = req.body;
        
        const result = await pool.query(
        `UPDATE pupils 
        SET name = $1, grade = $2, average_score = $3, homework_completed = $4 
        WHERE id = $5 RETURNING *`,
        [name, grade, averageScore, homeworkCompleted, id]
        );
        
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Ученик не найден' });
        }
        
        // Преобразуем в camelCase для фронтенда
        const pupil = result.rows[0];
        res.json({
        id: pupil.id,
        name: pupil.name,
        grade: pupil.grade,
        averageScore: Number(pupil.average_score),
        homeworkCompleted: Number(pupil.homework_completed),
        });
    } catch (error) {
        console.error('Ошибка при обновлении ученика:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
    });
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});