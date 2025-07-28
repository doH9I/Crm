import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useProjectSelectionStore } from './store/simple';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';

// Простой компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Простой компонент для публичных маршрутов
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Простой Dashboard для демонстрации
const SimpleDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { selectedProjectId, availableProjects, setSelectedProject } = useProjectSelectionStore();

  const selectedProject = selectedProjectId 
    ? availableProjects.find(p => p.id === selectedProjectId)
    : null;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #1976d2', paddingBottom: '15px' }}>
        <h1 style={{ color: '#1976d2', margin: 0 }}>
          {selectedProject ? `Проект: ${selectedProject.name}` : 'CRM Система - Все проекты'}
        </h1>
        <div>
          <span style={{ marginRight: '15px', color: '#666' }}>👤 {user?.name}</span>
          <button 
            onClick={logout}
            style={{ 
              padding: '8px 15px', 
              backgroundColor: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Выбор проектов */}
      <div style={{ marginBottom: '30px', padding: '25px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '18px' }}>🏗️ Выбор проекта:</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedProject(null)}
            style={{
              padding: '12px 20px',
              backgroundColor: selectedProjectId === null ? '#1976d2' : 'white',
              color: selectedProjectId === null ? 'white' : '#374151',
              border: selectedProjectId === null ? 'none' : '2px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: selectedProjectId === null ? '0 4px 12px rgba(25, 118, 210, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            📊 Все проекты
          </button>
          {availableProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              style={{
                padding: '12px 20px',
                backgroundColor: selectedProjectId === project.id ? '#1976d2' : 'white',
                color: selectedProjectId === project.id ? 'white' : '#374151',
                border: selectedProjectId === project.id ? 'none' : '2px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                boxShadow: selectedProjectId === project.id ? '0 4px 12px rgba(25, 118, 210, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              🏢 {project.name} ({project.progress}%)
            </button>
          ))}
        </div>
      </div>

      {/* Информация о проекте */}
      {selectedProject ? (
        <div style={{ marginBottom: '30px', padding: '25px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <h3 style={{ color: '#166534', marginBottom: '20px', fontSize: '18px' }}>ℹ️ Информация о проекте:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            <div>
              <p style={{ margin: '8px 0' }}><strong>👥 Клиент:</strong> {selectedProject.client}</p>
              <p style={{ margin: '8px 0' }}><strong>📍 Адрес:</strong> {selectedProject.address}</p>
              <p style={{ margin: '8px 0' }}><strong>📈 Прогресс:</strong> 
                <span style={{ 
                  backgroundColor: selectedProject.progress > 70 ? '#10b981' : selectedProject.progress > 30 ? '#f59e0b' : '#ef4444',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  marginLeft: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {selectedProject.progress}%
                </span>
              </p>
            </div>
            <div>
              <p style={{ margin: '8px 0' }}><strong>💰 Бюджет:</strong> {selectedProject.budget.toLocaleString('ru-RU')} руб.</p>
              <p style={{ margin: '8px 0' }}><strong>💸 Потрачено:</strong> {selectedProject.spentAmount.toLocaleString('ru-RU')} руб.</p>
              <p style={{ margin: '8px 0' }}><strong>⚡ Статус:</strong> 
                <span style={{
                  backgroundColor: selectedProject.status === 'in_progress' ? '#3b82f6' : '#6b7280',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  marginLeft: '8px',
                  fontSize: '12px'
                }}>
                  {selectedProject.status === 'in_progress' ? 'В работе' : selectedProject.status === 'planning' ? 'Планирование' : selectedProject.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '30px', padding: '25px', backgroundColor: '#fef3e8', borderRadius: '12px', border: '1px solid #fed7aa' }}>
          <h3 style={{ color: '#9a3412', marginBottom: '20px', fontSize: '18px' }}>📊 Общая статистика:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div>
              <p style={{ margin: '8px 0' }}><strong>🏗️ Всего проектов:</strong> {availableProjects.length}</p>
              <p style={{ margin: '8px 0' }}><strong>💰 Общий бюджет:</strong> {availableProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString('ru-RU')} руб.</p>
            </div>
            <div>
              <p style={{ margin: '8px 0' }}><strong>💸 Общие затраты:</strong> {availableProjects.reduce((sum, p) => sum + p.spentAmount, 0).toLocaleString('ru-RU')} руб.</p>
              <p style={{ margin: '8px 0' }}><strong>📈 Средний прогресс:</strong> {Math.round(availableProjects.reduce((sum, p) => sum + p.progress, 0) / availableProjects.length)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Меню навигации */}
      <div style={{ padding: '25px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ color: '#374151', marginBottom: '20px', fontSize: '18px' }}>🔧 Разделы системы:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
          {[
            { name: 'Проекты', icon: '🏗️', desc: 'Управление проектами' },
            { name: 'Материалы', icon: '📦', desc: 'Склад и материалы' }, 
            { name: 'Сотрудники', icon: '👥', desc: 'Команда и HR' },
            { name: 'Финансы', icon: '💰', desc: 'Бюджеты и счета' },
            { name: 'Календарь', icon: '📅', desc: 'События и задачи' },
            { name: 'Отчеты', icon: '📊', desc: 'Аналитика и отчеты' },
            { name: 'Настройки', icon: '⚙️', desc: 'Конфигурация' }
          ].map((section) => (
            <div 
              key={section.name}
              style={{ 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{section.icon}</div>
              <div style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>{section.name}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{section.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Сообщение о функциональности */}
      <div style={{ marginTop: '30px', padding: '25px', backgroundColor: '#fef9e7', borderRadius: '12px', border: '1px solid #fef08a' }}>
        <h4 style={{ color: '#92400e', marginBottom: '15px' }}>✅ Многопроектная система работает!</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
          <ul style={{ color: '#451a03', margin: 0, paddingLeft: '20px' }}>
            <li>Переключение между проектами работает мгновенно</li>
            <li>Данные фильтруются по выбранному проекту</li>
          </ul>
          <ul style={{ color: '#451a03', margin: 0, paddingLeft: '20px' }}>
            <li>Состояние сохраняется при перезагрузке</li>
            <li>Система готова к интеграции с полным интерфейсом</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const AppFixed: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        {/* Публичные маршруты */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Защищенные маршруты */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <SimpleDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default AppFixed;