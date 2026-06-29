import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
  grade: number | null;  // Оценка может быть null (если еще не поставлена)
  created_at: string;
}
function App() {
  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
          <Link to="/" style={{ marginRight: '15px' }}>Главная</Link>
          <Link to="/pupils">Список учеников</Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pupils" element={<PupilsPage />} />
          <Route path="pupils/:id" element={<PupilDetail />}/>
          <Route path="/pupils/new" element={<AddPupilPage />} />
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

  return (
    <div style={{ padding: '20px' }}>
      <h1>Список учеников</h1>
      <Link to="/">На главную</Link>
      
      {/* Превращаем массив данных в HTML-список */}
      <ul>
        {pupils.map(pupil => (
          <li key={pupil.id} style={{ marginBottom: '10px' }}>
            <Link to={`/pupils/${pupil.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <strong>{pupil.name}</strong> ({pupil.grade})
              <br />
              Средний балл: {pupil.averageScore} | ДЗ выполнено: {pupil.homeworkCompleted}
            </Link>
          </li>
        ))}
      </ul>
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/pupils">← Назад к списку</Link>
      /* Карточка ученика */
      <div style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
        <h1>{pupil.name}</h1>
        <p><strong>Класс:</strong> {pupil.grade}</p>
        <p><strong>Средний балл:</strong> {pupil.averageScore}</p>
      </div>

      <h2 style={{ marginTop: '40px' }}>Домашние задания и оценки</h2>
      
      <form onSubmit={handleAddHomework} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Добавить новое задание</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            name="subject"
            placeholder="Предмет (например, Математика)"
            value={newHomework.subject}
            onChange={handleHwChange}
            required
            style={{ flex: 1, padding: '8px' }}
          />
          <input
            name="grade"
            type="number"
            placeholder="Оценка (1-5)"
            value={newHomework.grade}
            onChange={handleHwChange}
            min="1"
            max="5"
            style={{ width: '100px', padding: '8px' }}
          />
        </div>
        <textarea
          name="description"
          placeholder="Описание задания..."
          value={newHomework.description}
          onChange={handleHwChange}
          required
          style={{ width: '100%', padding: '8px', minHeight: '60px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Сохранить
        </button>
      </form>

      /* Список ДЗ*/
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
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    
    try {
      const response = await fetch('http://localhost:3000/pupils', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Ученик добавлен!');
        // Перенаправляем на список учеников
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

export default App;
