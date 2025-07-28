import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Alert, Typography, Button } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { usePermissions } from '../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/dashboard',
  showAccessDenied = true,
}) => {
  const { canAccess, isAdmin, user } = usePermissions();

  // Если пользователь не авторизован
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Если не требуется специальных прав или пользователь админ
  if (!requiredPermission || isAdmin()) {
    return <>{children}</>;
  }

  // Проверяем права доступа
  if (!canAccess(requiredPermission)) {
    if (showAccessDenied) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            p: 4,
          }}
        >
          <LockIcon
            sx={{
              fontSize: 64,
              color: 'text.secondary',
              mb: 2,
            }}
          />
          
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Доступ ограничен
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            У вас недостаточно прав для просмотра этой страницы. 
            Обратитесь к администратору для получения доступа.
          </Typography>

          <Alert severity="info" sx={{ mb: 3, maxWidth: 500 }}>
            <Typography variant="body2">
              <strong>Ваша роль:</strong> {user.role}<br />
              <strong>Требуемое разрешение:</strong> {requiredPermission}
            </Typography>
          </Alert>

          <Button
            variant="contained"
            onClick={() => window.history.back()}
            sx={{ mr: 2 }}
          >
            Назад
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => window.location.href = fallbackPath}
          >
            На главную
          </Button>
        </Box>
      );
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;