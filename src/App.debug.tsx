import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Простая отладочная страница
const DebugPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Отладочная страница</h1>
      <p>Если вы видите это сообщение, значит React работает.</p>
      <p>Сейчас мы проверим каждый компонент...</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Проверка store:</h2>
        <TestStore />
      </div>
    </div>
  );
};

const TestStore: React.FC = () => {
  try {
    // Импортируем простой store
    const { useAuthStore, useProjectSelectionStore } = require('./store/simple');
    const { isAuthenticated, user } = useAuthStore();
    const { selectedProjectId, availableProjects } = useProjectSelectionStore();
    
    return (
      <div>
        <p>✅ Store загружен успешно</p>
        <p>Статус аутентификации: {isAuthenticated ? 'Авторизован' : 'Не авторизован'}</p>
        {user && <p>Пользователь: {user.name}</p>}
        <p>Доступно проектов: {availableProjects.length}</p>
        <p>Выбранный проект: {selectedProjectId || 'Все проекты'}</p>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <p>❌ Ошибка в store: {(error as Error).message}</p>
        <pre style={{ background: '#f0f0f0', padding: '10px', fontSize: '12px' }}>
          {error.stack}
        </pre>
      </div>
    );
  }
};

const AppDebug: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route path="*" element={<DebugPage />} />
      </Routes>
    </div>
  );
};

export default AppDebug;