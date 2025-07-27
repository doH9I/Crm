import React, { useEffect, useState } from 'react';
import { Badge, IconButton, Menu, MenuItem, ListItemText, ListItemIcon, Typography, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';

export const NotificationsBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await axios.get('/api/analytics/notifications/');
      setNotifications(res.data);
      setUnread(res.data.filter((n: any) => !n.read).length);
    };
    fetchNotifications();
  }, []);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const markRead = async (id: number) => {
    await axios.post(`/api/analytics/notifications/${id}/mark_read/`);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    setUnread(unread - 1);
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} size="large">
        <Badge badgeContent={unread} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {notifications.length === 0 && <MenuItem disabled>Нет уведомлений</MenuItem>}
        {notifications.slice(0, 10).map(n => (
          <MenuItem key={n.id} selected={!n.read} onClick={() => markRead(n.id)}>
            <ListItemIcon>{n.read ? <CheckIcon color="success" /> : <NotificationsIcon color="primary" />}</ListItemIcon>
            <ListItemText
              primary={<Box display="flex" alignItems="center"><Typography fontWeight={n.read ? 400 : 700}>{n.title}</Typography></Box>}
              secondary={<Typography variant="caption">{n.message}</Typography>}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};