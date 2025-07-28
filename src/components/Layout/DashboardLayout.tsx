import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Tooltip,
  Fade,
  IconButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuthStore, useAppStore } from '../../store';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';

const DRAWER_WIDTH = 280;

const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout } = useAuthStore();
  const { sidebar, toggleSidebar } = useAppStore();
  
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  // Получение заголовка страницы
  const getPageTitle = () => {
    const pathMap: Record<string, string> = {
      '/dashboard': 'Главная панель',
      '/projects': 'Проекты',
      '/estimates': 'Сметы',
      '/materials': 'Материалы',
      '/tools': 'Инструменты',
      '/employees': 'Сотрудники',
      '/finances': 'Финансы',
      '/calendar': 'Календарь',
      '/reports': 'Отчеты',
      '/settings': 'Настройки',
      '/profile': 'Профиль',
    };
    
    const currentPath = location.pathname;
    if (currentPath.startsWith('/projects/') && currentPath !== '/projects') {
      return 'Детали проекта';
    }
    
    return pathMap[currentPath] || 'Страница';
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleAccountMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleAccountMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleAccountMenuClose();
    toast.success('Вы успешно вышли из системы');
  };

  const handleDrawerToggle = () => {
    toggleSidebar();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(isMobile && {
            marginLeft: 0,
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar sx={{ pr: '24px' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            sx={{ mr: '36px' }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            {getPageTitle()}
          </Typography>

          {/* Уведомления */}
          <Tooltip title="Уведомления">
            <IconButton
              color="inherit"
              onClick={handleNotificationOpen}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Меню профиля */}
          <Tooltip title="Профиль">
            <IconButton
              onClick={handleAccountMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                }}
              >
                {user?.name?.charAt(0) || 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={isMobile ? sidebar.isOpen : sidebar.isOpen || !sidebar.isPinned}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          },
        }}
      >
        {/* Sidebar Header */}
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="rgba(255,255,255,0.05)" fill-rule="evenodd"%3E%3Cpath d="m0 40l40-40v40z"/%3E%3Cpath d="m0 40l40-40v40z" transform="translate(0 -40)"/%3E%3C/g%3E%3C/svg%3E")',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                mr: 2,
              }}
            >
              <BusinessIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" noWrap sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                Construction
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                CRM System
              </Typography>
            </Box>
          </Box>
          
          {!isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{ color: 'white', zIndex: 1 }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Toolbar>

        <Divider />

        {/* Sidebar Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Sidebar />
        </Box>

        {/* Sidebar Footer */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.05))',
              border: '1px solid rgba(25, 118, 210, 0.1)',
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
              }}
            >
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                {user?.name || 'Пользователь'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          minHeight: '100vh',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(isMobile && {
            marginLeft: 0,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
          <Fade in={true} timeout={300}>
            <Box>
              <Outlet />
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* Меню профиля */}
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={handleAccountMenuClose}
        onClick={handleAccountMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Информация о пользователе */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.name || 'Пользователь'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.role === 'admin' ? 'Администратор' :
             user?.role === 'manager' ? 'Менеджер проектов' :
             user?.role === 'foreman' ? 'Мастер' :
             user?.role === 'accountant' ? 'Бухгалтер' :
             user?.role || 'Роль не определена'}
          </Typography>
          {user?.department && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {user.department}
            </Typography>
          )}
        </Box>
        
        <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
          <AccountCircleIcon sx={{ mr: 2, color: 'primary.main' }} />
          Мой профиль
        </MenuItem>
        <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
          <SettingsIcon sx={{ mr: 2, color: 'text.secondary' }} />
          Настройки
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2 }} />
          Выйти
        </MenuItem>
      </Menu>

      {/* Панель уведомлений */}
      <NotificationPanel
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
      />
    </Box>
  );
};

export default DashboardLayout;