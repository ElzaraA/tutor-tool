import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaPen, FaTrash } from 'react-icons/fa';
import ScoreCircle from './ScoreCircle';
interface Pupil {
  id: number;
  name: string;
  grade: string;
  averageScore: number;
  homeworkCompleted: number;
}
interface Homework {
  id: number;
  pupil_id: number;
  subject: string;
  description: string;
  grade: number | null;  
  created_at: string;
}
const linkStyle = {
  textDecoration: 'none',
  color: '#9A9C8F',
  padding: '8px 16px',
  borderRadius: '8px',
  marginRight: '10px',
  display: 'inline-block', // добавляем для правильного отображения
};

const activeStyle = {
  textDecoration: 'none',
  color: '#ffffff',
  padding: '8px 16px',
  borderRadius: '20px',
  marginRight: '10px',
  backgroundColor: '#2a2d3e',
  display: 'inline-block',
};

function App() {

  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: '20px', borderBottom: '1px solid #262930', textAlign: 'right' }}>
  
  <NavLink 
    to="/pupils" 
    style={({ isActive }) => isActive ? activeStyle : linkStyle}
  >
    Список учеников
  </NavLink>
  
  <NavLink 
    to="/lessons" 
    style={({ isActive }) => isActive ? activeStyle : linkStyle}
  >
    Уроки
  </NavLink>
  <NavLink to="/" end style={({ isActive }) => isActive ? activeStyle : linkStyle}>
    Главная
  </NavLink>
</nav>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pupils" element={<PupilsPage />} />
          <Route path="pupils/:id" element={<PupilDetail />}/>
          <Route path="/pupils/new" element={<AddPupilPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function HomePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Добро пожаловать в Pupils Management System! 🎓</h1>
      <p>Это CRM-система для репетиторов и их учеников.</p>
    </div>
  );
}

function PupilsPage() {
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null); // ID редактируемого ученика
  const [editData, setEditData] = useState({ name: '', grade: '' });
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    fetch('http://localhost:3000/pupils')
      .then(response => response.json()) 
      .then(data => {
        setPupils(data); 
        setLoading(false); 
      })
      .catch(error => {
        console.error('Ошибка при получении учеников:', error);
        setLoading(false);
      });
  }, []); 

  if (loading) {
    return <div style={{ padding: '20px' }}>Загрузка данных...</div>;
  }
  // Функция удаления
const handleDelete = async (id: number) => {
  // Спрашиваем подтверждение
  const isConfirmed = window.confirm('Ты точно хочешь удалить этого ученика? Это действие нельзя отменить.');
  
  if (!isConfirmed) return;

  try {
    const res = await fetch(`http://localhost:3000/pupils/${id}`, {
      method: 'DELETE',
    });
    
    if (res.ok) {
      // Удаляем ученика из списка на фронтенде
      setPupils(pupils.filter(p => p.id !== id));
    } else {
      alert('Ошибка при удалении');
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
};

// Функция редактирования (пока простая, через prompt)
// const handleEdit = async (pupil: Pupil) => {
//   const newName = window.prompt('Новое имя:', pupil.name);
//   if (newName === null) return; // Нажали отмену

//   const newGrade = window.prompt('Новый класс:', pupil.grade);
//   if (newGrade === null) return;

//   try {
//     const res = await fetch(`http://localhost:3000/pupils/${pupil.id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name: newName,
//         grade: newGrade,
//         averageScore: pupil.averageScore,
//         homeworkCompleted: pupil.homeworkCompleted,
//       }),
//     });

//     if (res.ok) {
//       const updatedPupil = await res.json();
//       // Обновляем список
//       setPupils(pupils.map(p => p.id === updatedPupil.id ? updatedPupil : p));
//     } else {
//       alert('Ошибка при обновлении');
//     }
//   } catch (error) {
//     console.error('Ошибка:', error);
//   }
// };
  // Начать редактирование
const startEdit = (pupil: Pupil) => {
  setEditingId(pupil.id);
  setEditData({ name: pupil.name, grade: pupil.grade });
};

// Отменить редактирование
const cancelEdit = () => {
  setEditingId(null);
  setEditData({ name: '', grade: '' });
};
const saveEdit = async (id: number) => {
  try {
    const pupil = pupils.find(p => p.id === id);
    if (!pupil) return;

    const res = await fetch(`http://localhost:3000/pupils/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editData.name,
        grade: editData.grade.includes('класс') ? editData.grade : `${editData.grade} класс`,
        averageScore: pupil.averageScore,
        homeworkCompleted: pupil.homeworkCompleted,
      }),
    });

    if (res.ok) {
      const updatedPupil = await res.json();
      setPupils(pupils.map(p => p.id === updatedPupil.id ? updatedPupil : p));
      setEditingId(null);
    } else {
      alert('Ошибка при сохранении');
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
};
  return (
  <div style={{ padding: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
      <div style = {{ marginLeft: 'center'}}>
        <h1 style = {{fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600', fontSize: '30px'}}>Список учеников</h1>
        <p style = {{fontSize: '16px', color: 'gray', textAlign: 'left'}}>Количество учеников: {pupils.length}</p>
        {/* <Link to="/">На главную</Link> */}
      </div>
      <Link 
        to="/pupils/new" 
        style={{
          padding: '12px 24px', 
          background: isHovered ? '#6d5ce0' : '#8C7CF0',
          color: '#14171F', 
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
          
        + Добавить ученика
      </Link>
    </div>
    
    {pupils.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
        <p style={{ fontSize: '18px', marginBottom: '15px' }}>Учеников пока нет 📚</p>
      </div>
    ) : (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {pupils.map(pupil => (
          <li key={pupil.id} style={{ 
            marginBottom: '10px', 
            padding: '15px', 
            background: '#1E222C', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            //alignItems: 'center'
            textAlign: 'left',
            color: 'white'
          }}>
            <div style={{ flex: 1 }}>
              {editingId === pupil.id ? (
                // РЕЖИМ РЕДАКТИРОВАНИЯ
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    style={{ padding: '6px', fontSize: '16px', border: '2px solid #007bff', borderRadius: '4px' }}
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editData.grade}
                    onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
                    style={{ padding: '6px', fontSize: '14px', border: '2px solid #007bff', borderRadius: '4px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => saveEdit(pupil.id)}
                      style={{ 
                        padding: '6px 12px', 
                        background: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Сохранить
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{ 
                        padding: '6px 12px', 
                        background: '#6c757d', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✗ Отмена
                    </button>
                  </div>
                </div>
              ) : (
                // РЕЖИМ ПРОСМОТРА
                <Link to={`/pupils/${pupil.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <strong style={{ fontSize: '16px' }}>{pupil.name}</strong> ({pupil.grade})
                  <br />
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    ДЗ выполнено: {pupil.homeworkCompleted}
                  </span>
                </Link>
              )}
              
            </div>
              
            {editingId !== pupil.id && (
              <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                <ScoreCircle score={pupil.averageScore} />
                <button
                  onClick={() => startEdit(pupil)}
                  style={{ 
                    backgroundColor: 'transparent',  
                    border: 'none',                   
                    borderRadius: '0',
                    padding: '6px 12px',
                    cursor: 'pointer'
                  }}>
                  <FaPen color="#999" size={14} />
                </button>
                <button
                  onClick={() => handleDelete(pupil.id)}
                  style={{ 
                    backgroundColor: 'transparent',  
                    border: 'none',                  
                    borderRadius: '0',
                    padding: '6px 12px',
                    cursor: 'pointer'
                  }}
                >
                    <FaTrash color="#999" size={14} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);
}
function PupilDetail() {
  const { id } = useParams<{ id: string }>();
  
  const [pupil, setPupil] = useState<Pupil | null>(null);
  const [loading, setLoading] = useState(true);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [newHomework, setNewHomework] = useState({ subject: '', description: '', grade: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pupilRes = await fetch(`http://localhost:3000/pupils/${id}`);
        const pupilData = await pupilRes.json();
        setPupil(pupilData);

        const hwRes = await fetch(`http://localhost:3000/pupils/${id}/homeworks`);
        const hwData = await hwRes.json();
        setHomeworks(hwData);
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Обработчик изменения полей формы
  const handleHwChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewHomework(prev => ({ ...prev, [name]: value }));
  };

  // Отправка новой домашки
  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/pupils/${id}/homeworks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newHomework,
          grade: newHomework.grade ? Number(newHomework.grade) : null
        }),
      });
      
      if (res.ok) {
        const createdHw = await res.json();
        setHomeworks([createdHw, ...homeworks]); 
        setNewHomework({ subject: '', description: '', grade: '' }); // Очиcтка формы
      }
    } catch (error) {
      console.error('Ошибка при добавлении ДЗ:', error);
    }
  };
  if (loading) return <div style={{ padding: '20px' }}>Загрузка</div>;
  if (!pupil) return <div style={{ padding: '20px' }}>Ученик не найден</div>;
  return (
    <div style={{ padding: '5px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/pupils">← Назад к списку</Link>
      <h3 style={{color:'white'}}>Карточка ученика</h3>
      <div style={{ marginTop: '20px', padding: '5px', background: '#850F50', borderRadius: '8px',color:'white',overflow: 'hidden', }}>
        <h1 style={{fontSize: '30px'}}>{pupil.name}</h1>
        <p><strong>Класс:</strong> {pupil.grade}</p>
        <p style= {{padding: '5px'}}><strong>Средний балл:</strong> {pupil.averageScore}</p>
      </div>

      <h2 style={{ marginTop: '40px' }}>Домашние задания и оценки</h2>
      
      <form onSubmit={handleAddHomework} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Добавить новое задание</h3>
        <div style={{ width: '96%', display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            name="subject"
            placeholder="Тема домашнего задания"
            value={newHomework.subject}
            onChange={handleHwChange}
            required
            style={{ marginLeft: '30px', flex: 1, padding: '8px' }}
          />
          {/* <input
            name="grade"
            type="number"
            placeholder="Оценка (1-5)"
            value={newHomework.grade}
            onChange={handleHwChange}
            min="1"
            max="5"
            style={{ width: '100px', padding: '8px' }}
          /> */}
        </div>
        <textarea
          name="description"
          placeholder="Описание задания..."
          value={newHomework.description}
          onChange={handleHwChange}
          required
          style={{ width: '90%', padding: '8px', minHeight: '60px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Сохранить
        </button>
      </form>

      <h1 style={{color:'white',fontSize:'30px'}}>Список ДЗ</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {homeworks.length === 0 ? (
          <p>Домашних заданий пока нет.</p>
        ) : (
          homeworks.map(hw => (
            <li key={hw.id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{hw.subject}</strong>
                {hw.grade && <span style={{ background: '#007bff', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '14px' }}>Оценка: {hw.grade}</span>}
              </div>
              <p style={{ margin: '5px 0', color: '#555' }}>{hw.description}</p>
              <small style={{ color: '#999' }}>
                {new Date(hw.created_at).toLocaleDateString('ru-RU')}
              </small>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
function AddPupilPage() {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    averageScore: 0,
    homeworkCompleted: 0,
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: name === 'averageScore' || name === 'homeworkCompleted' 
      ? value  // Сохраняем как строку
      : value
  }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch('http://localhost:3000/pupils', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        // Добавляем "класс" если его нет
        grade: formData.grade.includes('класс') ? formData.grade : `${formData.grade} класс`,
      }),
    });
    
    if (response.ok) {
      alert('Ученик добавлен!');
      window.location.href = '/pupils';
    } else {
      alert('Ошибка при добавлении ученика');
    }
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Ошибка при добавлении ученика');
  }
};

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Добавить нового ученика</h1>
      <Link to="/pupils">← Назад к списку</Link>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Имя:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Класс:</label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Средний балл:</label>
          <input
            type="number"
            name="averageScore"
            value={formData.averageScore}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.1"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Выполнено ДЗ:</label>
          <input
            type="number"
            name="homeworkCompleted"
            value={formData.homeworkCompleted}
            onChange={handleChange}
            min="0"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        
        <button 
          type="submit"
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Добавить ученика
        </button>
      </form>
    </div>
  );
}
interface DailyRevenue {
  day: string;
  amount: string;
}

function DashboardPage() {
  const [stats, setStats] = useState({
    totalPupils: 0,
    newPupilsThisMonth: 0,
    completedLessons: 0,
    cancelledLessons: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
    growthPercent: 0,
    dailyRevenue: [] as DailyRevenue[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка загрузки статистики:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Загрузка...</div>;

  // Находим максимальный доход для масштабирования графика
  const maxRevenue = Math.max(...stats.dailyRevenue.map(d => Number(d.amount)), 1000);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Дашборд репетитора</h1>
      
      {/* Основные метрики */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '30px' }}>
        {/* Ученики */}
        <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #90caf9' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>👥 Всего учеников</h3>
          <p style={{ fontSize: '36px', margin: 0, fontWeight: 'bold' }}>{stats.totalPupils}</p>
          <small style={{ color: '#1976d2' }}>+{stats.newPupilsThisMonth} новых за месяц</small>
        </div>

        {/* Уроки */}
        <div style={{ padding: '20px', background: '#fff3e0', borderRadius: '8px', border: '1px solid #ffcc80' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ef6c00' }}>📚 Проведено уроков</h3>
          <p style={{ fontSize: '36px', margin: 0, fontWeight: 'bold' }}>{stats.completedLessons}</p>
          <small style={{ color: '#f57c00' }}>Отменено: {stats.cancelledLessons}</small>
        </div>

        {/* Доход */}
        <div style={{ padding: '20px', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #a5d6a7' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>💰 Доход за месяц</h3>
          <p style={{ fontSize: '36px', margin: 0, fontWeight: 'bold' }}>{stats.revenueThisMonth.toLocaleString('ru-RU')} ₽</p>
          <small style={{ color: stats.growthPercent >= 0 ? '#4caf50' : '#f44336' }}>
            {stats.growthPercent >= 0 ? '↑' : '↓'} {Math.abs(stats.growthPercent)}% к прошлому месяцу
          </small>
        </div>

        {/* Средний чек */}
        <div style={{ padding: '20px', background: '#f3e5f5', borderRadius: '8px', border: '1px solid #ce93d8' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#7b1fa2' }}>📈 Средний чек</h3>
          <p style={{ fontSize: '36px', margin: 0, fontWeight: 'bold' }}>
            {stats.completedLessons > 0 
              ? Math.round(stats.revenueThisMonth / stats.completedLessons).toLocaleString('ru-RU')
              : 0} ₽
          </p>
          <small style={{ color: '#8e24aa' }}>за урок</small>
        </div>
      </div>

      {/* График дохода */}
      <div style={{ marginTop: '40px', padding: '20px', background: '#fafafa', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>📈 График дохода по дням</h2>
        
        {stats.dailyRevenue.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
            Нет данных о проведенных уроках за этот месяц
          </p>
        ) : (
          <div style={{ marginTop: '20px' }}>
            {/* Ось Y и столбцы */}
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '8px', marginBottom: '10px' }}>
              {stats.dailyRevenue.map((day, index) => {
                const amount = Number(day.amount);
                const height = (amount / maxRevenue) * 100;
                const date = new Date(day.day);
                const dayOfMonth = date.getDate();
                
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div 
                      style={{ 
                        width: '100%', 
                        height: `${height}%`, 
                        background: '#4caf50',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                        position: 'relative'
                      }}
                      title={`${dayOfMonth} дек: ${amount.toLocaleString('ru-RU')} ₽`}
                    >
                      {amount > 0 && (
                        <span style={{ 
                          position: 'absolute', 
                          top: '-20px', 
                          left: '50%', 
                          transform: 'translateX(-50%)',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {amount > 0 ? `${amount/1000}к` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Дни месяца */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #333', paddingTop: '5px' }}>
              {stats.dailyRevenue.map((day, index) => {
                const date = new Date(day.day);
                return (
                  <div key={index} style={{ flex: 1, textAlign: 'center', fontSize: '12px', color: '#666' }}>
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Пояснения */}
      <div style={{ marginTop: '30px', padding: '15px', background: '#fffde7', borderRadius: '8px', border: '1px solid #fff59d' }}>
        <h3 style={{ marginTop: 0 }}>💡 Как читать дашборд:</h3>
        <ul style={{ margin: 0 }}>
          <li><strong>Всего учеников</strong> — общее количество + сколько новых за этот месяц</li>
          <li><strong>Проведено уроков</strong> — сколько уроков состоялось (отмененные не считаются)</li>
          <li><strong>Доход за месяц</strong> — сумма за все проведенные уроки + рост/падение к прошлому месяцу</li>
          <li><strong>График</strong> — показывает доход по дням, чтобы видеть пики и спады</li>
        </ul>
      </div>
    </div>
  );
}
interface Lesson {
  id: number;
  pupil_id: number;
  pupil_name: string;
  date: string;
  duration: number;
  price: number;
  status: string;
  created_at: string;
}

interface Pupil {
  id: number;
  name: string;
}
function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    pupil_id: '',
    date: '',
    duration: 60,
    price: 1500,
  });

  // Загружаем уроки и учеников
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, pupilsRes] = await Promise.all([
          fetch('http://localhost:3000/lessons'),
          fetch('http://localhost:3000/pupils'),
        ]);
        
        const lessonsData = await lessonsRes.json();
        const pupilsData = await pupilsRes.json();
        
        setLessons(lessonsData);
        setPupils(pupilsData);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Обработчик изменения формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewLesson(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' ? Number(value) : value
    }));
  };

  // Добавление урока
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLesson),
      });
      
      if (res.ok) {
        const createdLesson = await res.json();
        // Находим имя ученика
        const pupil = pupils.find(p => p.id === createdLesson.pupil_id);
        setLessons([{ ...createdLesson, pupil_name: pupil?.name || '' }, ...lessons]);
        setShowForm(false);
        setNewLesson({ pupil_id: '', date: '', duration: 60, price: 1500 });
      }
    } catch (error) {
      console.error('Ошибка при добавлении урока:', error);
    }
  };

  // Изменение статуса урока
  const handleStatusChange = async (lessonId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3000/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        setLessons(lessons.map(l => 
          l.id === lessonId ? { ...l, status: newStatus } : l
        ));
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    }
  };

  // Форматирование даты
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Цвет статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#ff9800';
    }
  };

  // Текст статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Проведен';
      case 'cancelled': return 'Отменен';
      default: return 'Запланирован';
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Загрузка...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>📚 Уроки</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ 
            padding: '10px 20px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Отмена' : '+ Добавить урок'}
        </button>
      </div>

      {/* Форма добавления урока */}
      {showForm && (
        <form onSubmit={handleAddLesson} style={{ 
          padding: '20px', 
          background: '#f9f9f9', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ marginTop: 0 }}>Новый урок</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Ученик:</label>
              <select
                name="pupil_id"
                value={newLesson.pupil_id}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="">Выберите ученика</option>
                {pupils.map(pupil => (
                  <option key={pupil.id} value={pupil.id}>{pupil.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Дата:</label>
              <input
                type="date"
                name="date"
                value={newLesson.date}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Длительность (мин):</label>
              <input
                type="number"
                name="duration"
                value={newLesson.duration}
                onChange={handleChange}
                min="30"
                step="15"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Стоимость (₽):</label>
              <input
                type="number"
                name="price"
                value={newLesson.price}
                onChange={handleChange}
                min="0"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <button 
            type="submit"
            style={{ 
              padding: '10px 20px', 
              background: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Создать урок
          </button>
        </form>
      )}

      {/* Список уроков */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
        {lessons.length === 0 ? (
          <p style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            Уроков пока нет. Добавьте первый урок!
          </p>
        ) : (
          <div>
            {lessons.map(lesson => (
              <div 
                key={lesson.id} 
                style={{ 
                  padding: '15px 20px', 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <strong style={{ fontSize: '16px' }}>{lesson.pupil_name}</strong>
                    <span style={{ 
                      padding: '3px 10px', 
                      background: getStatusColor(lesson.status),
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {getStatusText(lesson.status)}
                    </span>
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {formatDate(lesson.date)} |  {lesson.duration} мин | {lesson.price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {lesson.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(lesson.id, 'completed')}
                        style={{ 
                          padding: '6px 12px', 
                          background: '#4caf50', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✓ Проведен
                      </button>
                      <button
                        onClick={() => handleStatusChange(lesson.id, 'cancelled')}
                        style={{ 
                          padding: '6px 12px', 
                          background: '#f44336', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✗ Отменен
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default App;
