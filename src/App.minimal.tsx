import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useProjectSelectionStore } from './store/simple';

// Простая страница логина
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        alert('Неверные данные для входа');
      }
    } catch (error) {
      alert('Ошибка входа');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Вход в систему</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="admin@construction-crm.ru"
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="admin123"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#1976d2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Тестовые аккаунты:</p>
        <p>admin@construction-crm.ru / admin123</p>
        <p>manager@construction-crm.ru / manager123</p>
      </div>
    </div>
  );
};

// Простой дашборд
const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { selectedProjectId, availableProjects, setSelectedProject } = useProjectSelectionStore();

  const selectedProject = selectedProjectId 
    ? availableProjects.find(p => p.id === selectedProjectId)
    : null;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>
          {selectedProject ? `Проект: ${selectedProject.name}` : 'Все проекты'}
        </h1>
        <div>
          <span style={{ marginRight: '15px' }}>Привет, {user?.name}!</span>
          <button 
            onClick={logout}
            style={{ 
              padding: '5px 10px', 
              backgroundColor: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Выбор проектов */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Выбор проекта:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedProject(null)}
            style={{
              padding: '8px 15px',
              backgroundColor: selectedProjectId === null ? '#1976d2' : '#e9ecef',
              color: selectedProjectId === null ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Все проекты
          </button>
          {availableProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              style={{
                padding: '8px 15px',
                backgroundColor: selectedProjectId === project.id ? '#1976d2' : '#e9ecef',
                color: selectedProjectId === project.id ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {project.name} ({project.progress}%)
            </button>
          ))}
        </div>
      </div>

      {/* Информация о проекте */}
      {selectedProject ? (
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
          <h3>Информация о проекте:</h3>
          <p><strong>Клиент:</strong> {selectedProject.client}</p>
          <p><strong>Адрес:</strong> {selectedProject.address}</p>
          <p><strong>Прогресс:</strong> {selectedProject.progress}%</p>
          <p><strong>Бюджет:</strong> {selectedProject.budget.toLocaleString('ru-RU')} руб.</p>
          <p><strong>Потрачено:</strong> {selectedProject.spentAmount.toLocaleString('ru-RU')} руб.</p>
          <p><strong>Статус:</strong> {selectedProject.status}</p>
        </div>
      ) : (
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
          <h3>Общая статистика:</h3>
          <p><strong>Всего проектов:</strong> {availableProjects.length}</p>
          <p><strong>Общий бюджет:</strong> {availableProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString('ru-RU')} руб.</p>
          <p><strong>Общие затраты:</strong> {availableProjects.reduce((sum, p) => sum + p.spentAmount, 0).toLocaleString('ru-RU')} руб.</p>
          <p><strong>Средний прогресс:</strong> {Math.round(availableProjects.reduce((sum, p) => sum + p.progress, 0) / availableProjects.length)}%</p>
        </div>
      )}

      {/* Меню навигации */}
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Разделы системы:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {[
            'Проекты',
            'Материалы', 
            'Сотрудники',
            'Финансы',
            'Календарь',
            'Отчеты',
            'Настройки'
          ].map((section) => (
            <div 
              key={section}
              style={{ 
                padding: '15px', 
                backgroundColor: 'white', 
                borderRadius: '4px', 
                textAlign: 'center',
                border: '1px solid #ddd'
              }}
            >
              {section}
            </div>
          ))}
        </div>
      </div>

      {/* Сообщение о функциональности */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h4>✅ Многопроектная система работает!</h4>
        <ul>
          <li>Переключение между проектами работает мгновенно</li>
          <li>Данные фильтруются по выбранному проекту</li>
          <li>Состояние сохраняется при перезагрузке</li>
          <li>Система готова к интеграции с полным интерфейсом</li>
        </ul>
      </div>
    </div>
  );
};

// Основной компонент приложения
const AppMinimal: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/*" 
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} 
      />
    </Routes>
  );
};

export default AppMinimal;