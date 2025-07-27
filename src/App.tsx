import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import { MODULES } from './hooks/usePermissions';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import MaterialsPage from './pages/MaterialsPage';
import ToolsPage from './pages/ToolsPage';
import EmployeesPage from './pages/EmployeesPage';
import EstimatesPage from './pages/EstimatesPage';
import FinancesPage from './pages/FinancesPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Компонент для публичных маршрутов (только для неавторизованных)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // Инициализация PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        console.log('SW registration failed');
      });
    }
  }, []);

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
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute requiredPermission={MODULES.DASHBOARD}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Проекты */}
          <Route 
            path="projects" 
            element={
              <ProtectedRoute requiredPermission={MODULES.PROJECTS}>
                <ProjectsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="projects/:id" 
            element={
              <ProtectedRoute requiredPermission={MODULES.PROJECTS}>
                <ProjectDetailPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Сметы */}
          <Route 
            path="estimates" 
            element={
              <ProtectedRoute requiredPermission={MODULES.ESTIMATES}>
                <EstimatesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Склад */}
          <Route 
            path="materials" 
            element={
              <ProtectedRoute requiredPermission={MODULES.MATERIALS}>
                <MaterialsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="tools" 
            element={
              <ProtectedRoute requiredPermission={MODULES.TOOLS}>
                <ToolsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Персонал */}
          <Route 
            path="employees" 
            element={
              <ProtectedRoute requiredPermission={MODULES.EMPLOYEES}>
                <EmployeesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Финансы */}
          <Route 
            path="finances" 
            element={
              <ProtectedRoute requiredPermission={MODULES.FINANCES}>
                <FinancesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Календарь */}
          <Route 
            path="calendar" 
            element={
              <ProtectedRoute requiredPermission={MODULES.CALENDAR}>
                <CalendarPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Отчеты */}
          <Route 
            path="reports" 
            element={
              <ProtectedRoute requiredPermission={MODULES.REPORTS}>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Настройки и профиль */}
          <Route 
            path="settings" 
            element={
              <ProtectedRoute requiredPermission={MODULES.SETTINGS}>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute requiredPermission={MODULES.PROFILE}>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Обработка несуществующих маршрутов */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </div>
  );
};

export default App;