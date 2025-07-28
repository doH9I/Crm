import React from 'react';
import {
  Box,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  NotificationsNone as NoNotificationsIcon,
} from '@mui/icons-material';
import { formatRelativeDate } from '../../utils';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  category: 'project' | 'inventory' | 'system' | 'deadline';
}

interface NotificationPanelProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

// Моковые данные уведомлений
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Низкий остаток материалов',
    message: 'Цемент М400: остаток 450 кг (мин. 500 кг)',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 минут назад
    isRead: false,
    category: 'inventory',
  },
  {
    id: '2',
    type: 'info',
    title: 'Новая задача назначена',
    message: 'Вам назначена задача "Укладка фундамента" в проекте "Солнечный"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
    isRead: false,
    category: 'project',
  },
  {
    id: '3',
    type: 'error',
    title: 'Превышен бюджет проекта',
    message: 'Проект "Бизнес-Центр": превышение на 150,000 ₽',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 часа назад
    isRead: true,
    category: 'project',
  },
  {
    id: '4',
    type: 'success',
    title: 'Проект завершен',
    message: 'Проект "Коттедж на Рублевке" успешно завершен',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 день назад
    isRead: true,
    category: 'project',
  },
  {
    id: '5',
    type: 'warning',
    title: 'Приближается дедлайн',
    message: 'До завершения проекта "Солнечный" осталось 3 дня',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 дня назад
    isRead: false,
    category: 'deadline',
  },
];

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string, category: string) => {
    const iconProps = { fontSize: 'small' as const };
    
    if (category === 'inventory') return <InventoryIcon {...iconProps} />;
    if (category === 'project') return <AssignmentIcon {...iconProps} />;
    if (category === 'deadline') return <ScheduleIcon {...iconProps} />;
    
    switch (type) {
      case 'warning':
        return <WarningIcon {...iconProps} />;
      case 'error':
        return <ErrorIcon {...iconProps} />;
      case 'success':
        return <SuccessIcon {...iconProps} />;
      default:
        return <InfoIcon {...iconProps} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      case 'success':
        return 'success.main';
      default:
        return 'info.main';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'inventory':
        return 'Склад';
      case 'project':
        return 'Проект';
      case 'deadline':
        return 'Срок';
      case 'system':
        return 'Система';
      default:
        return 'Общее';
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: '80vh',
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Уведомления
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                height: 20,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            />
          )}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'white', ml: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {mockNotifications.length === 0 ? (
          // Empty state
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              px: 3,
              textAlign: 'center',
            }}
          >
            <NoNotificationsIcon
              sx={{
                fontSize: 48,
                color: 'text.secondary',
                mb: 2,
                opacity: 0.5,
              }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Нет уведомлений
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Все уведомления будут отображаться здесь
            </Typography>
          </Box>
        ) : (
          // Notifications list
          <List sx={{ p: 0 }}>
            {mockNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.02)',
                    borderLeft: notification.isRead ? 'none' : '3px solid',
                    borderLeftColor: getNotificationColor(notification.type),
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: notification.isRead ? 'grey.200' : `${getNotificationColor(notification.type)}`,
                        color: notification.isRead ? 'text.secondary' : 'white',
                      }}
                    >
                      {getNotificationIcon(notification.type, notification.category)}
                    </Avatar>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.isRead ? 500 : 600,
                            color: notification.isRead ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={getCategoryLabel(notification.category)}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            fontWeight: 500,
                            borderColor: getNotificationColor(notification.type),
                            color: getNotificationColor(notification.type),
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontStyle: 'italic' }}
                        >
                          {formatRelativeDate(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>

                {index < mockNotifications.length - 1 && (
                  <Divider sx={{ ml: 7, mr: 2 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      {mockNotifications.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ borderRadius: 1.5 }}
                onClick={() => {
                  // Логика отметки всех как прочитанные
                  console.log('Отметить все как прочитанные');
                }}
              >
                Отметить как прочитанные
              </Button>
              <Button
                variant="contained"
                size="small"
                fullWidth
                sx={{ borderRadius: 1.5 }}
                onClick={() => {
                  // Логика перехода к полному списку уведомлений
                  console.log('Показать все уведомления');
                  window.location.href = '/notifications';
                }}
              >
                Показать все
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Popover>
  );
};

export default NotificationPanel;