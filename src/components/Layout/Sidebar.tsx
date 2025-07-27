import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Chip,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as ProjectIcon,
  Assignment as EstimateIcon,
  Inventory as MaterialIcon,
  Build as ToolIcon,
  People as EmployeeIcon,
  AccountBalance as FinanceIcon,
  Calendar as CalendarIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Folder as FolderIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Главная панель',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    id: 'projects',
    label: 'Проекты',
    path: '/projects',
    icon: <ProjectIcon />,
    badge: 8,
    badgeColor: 'primary',
    children: [
      {
        id: 'active-projects',
        label: 'Активные проекты',
        path: '/projects?status=active',
        icon: <TrendingUpIcon />,
        badge: 5,
        badgeColor: 'success',
      },
      {
        id: 'planning-projects',
        label: 'В планировании',
        path: '/projects?status=planning',
        icon: <FolderIcon />,
        badge: 3,
        badgeColor: 'warning',
      },
    ],
  },
  {
    id: 'estimates',
    label: 'Сметы',
    path: '/estimates',
    icon: <EstimateIcon />,
    badge: 12,
    badgeColor: 'info',
  },
  {
    id: 'warehouse',
    label: 'Склад',
    path: '#',
    icon: <MaterialIcon />,
    children: [
      {
        id: 'materials',
        label: 'Материалы',
        path: '/materials',
        icon: <MaterialIcon />,
        badge: 156,
        badgeColor: 'primary',
      },
      {
        id: 'tools',
        label: 'Инструменты',
        path: '/tools',
        icon: <ToolIcon />,
        badge: '!',
        badgeColor: 'warning',
      },
    ],
  },
  {
    id: 'employees',
    label: 'Сотрудники',
    path: '/employees',
    icon: <EmployeeIcon />,
    badge: 24,
    badgeColor: 'success',
  },
  {
    id: 'finances',
    label: 'Финансы',
    path: '/finances',
    icon: <FinanceIcon />,
  },
  {
    id: 'calendar',
    label: 'Календарь',
    path: '/calendar',
    icon: <CalendarIcon />,
  },
  {
    id: 'reports',
    label: 'Отчеты',
    path: '/reports',
    icon: <ReportIcon />,
  },
  {
    id: 'settings',
    label: 'Настройки',
    path: '/settings',
    icon: <SettingsIcon />,
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = React.useState<string[]>(['projects', 'warehouse']);

  const handleNavigation = (path: string) => {
    if (path !== '#') {
      navigate(path);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActiveItem = (path: string) => {
    if (path === '#') return false;
    
    // Точное совпадение для главной страницы
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    
    // Для остальных страниц - начало пути
    return location.pathname.startsWith(path);
  };

  const renderNavigationItem = (item: NavigationItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSections.includes(item.id);
    const isActive = isActiveItem(item.path);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleSectionToggle(item.id);
              } else {
                handleNavigation(item.path);
              }
            }}
            sx={{
              minHeight: 48,
              justifyContent: 'initial',
              px: 2.5,
              py: 1,
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              pl: depth > 0 ? 4 : 2.5,
              background: isActive ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.05))' : 'transparent',
              border: isActive ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid transparent',
              '&:hover': {
                backgroundColor: isActive ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2,
                justifyContent: 'center',
                color: isActive ? 'primary.main' : 'text.secondary',
                '& .MuiSvgIcon-root': {
                  fontSize: 22,
                },
              }}
            >
              {item.icon}
            </ListItemIcon>
            
            <ListItemText 
              primary={item.label} 
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  color: isActive ? 'primary.main' : 'text.primary',
                },
              }}
            />
            
            {/* Badge */}
            {item.badge && (
              <Chip
                label={item.badge}
                size="small"
                color={item.badgeColor || 'primary'}
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  mr: hasChildren ? 1 : 0,
                  '& .MuiChip-label': {
                    px: 0.75,
                  },
                }}
              />
            )}
            
            {/* Expand/Collapse Icon */}
            {hasChildren && (
              isOpen ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>

        {/* Children */}
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderNavigationItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Quick Stats */}
      <Box sx={{ p: 2, mx: 2, my: 1 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            СТАТИСТИКА
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Box textAlign="center">
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                8
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Проекты
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                24
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Сотрудники
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="warning.main" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                3
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Задачи
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            px: 3, 
            py: 1, 
            display: 'block',
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          НАВИГАЦИЯ
        </Typography>
        
        <List>
          {navigationItems.map(item => renderNavigationItem(item))}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        
        {/* System Status */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
                mr: 1,
                animation: 'pulse 2s infinite',
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              СИСТЕМА ОНЛАЙН
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Все сервисы работают нормально
          </Typography>
        </Box>
      </Box>

      {/* Pulse Animation */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default Sidebar;