import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import ProtectedRouteWithPermissions from './components/ProtectedRoute';
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
import SuppliersPage from './pages/SuppliersPage';
import ClientsPage from './pages/ClientsPage';

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
              <ProtectedRouteWithPermissions requiredPermission={MODULES.DASHBOARD}>
                <DashboardPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          
          {/* Проекты */}
          <Route 
            path="projects" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.PROJECTS}>
                <ProjectsPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          <Route 
            path="projects/:id" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.PROJECTS}>
                <ProjectDetailPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          
          {/* Сметы */}
          <Route 
            path="estimates" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.ESTIMATES}>
                <EstimatesPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          
          {/* Склад */}
          <Route 
            path="materials" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.MATERIALS}>
                <MaterialsPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          <Route 
            path="tools" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.TOOLS}>
                <ToolsPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          
          {/* Персонал */}
          <Route 
            path="employees" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.EMPLOYEES}>
                <EmployeesPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          
          {/* Поставщики */}
          <Route 
            path="suppliers" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.MATERIALS}>
                <SuppliersPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          
          {/* Заказчики */}
          <Route 
            path="clients" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.PROJECTS}>
                <ClientsPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          
          {/* Финансы */}
          <Route 
            path="finances" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.FINANCES}>
                <FinancesPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          
          {/* Календарь */}
          <Route 
            path="calendar" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.CALENDAR}>
                <CalendarPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          
          {/* Отчеты */}
          <Route 
            path="reports" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.REPORTS}>
                <ReportsPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          
          {/* Настройки и профиль */}
          <Route 
            path="settings" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.SETTINGS}>
                <SettingsPage />
              </ProtectedRouteWithPermissions>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRouteWithPermissions requiredPermission={MODULES.PROFILE}>
                <ProfilePage />
              </ProtectedRouteWithPermissions>
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