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
    res.json(result.rows);
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
    
    res.json(result.rows[0]);
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
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});