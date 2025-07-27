import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Divider from '@mui/material/Divider';
import { useState } from 'react';
import { UsersPage } from './components/users/UsersPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { ProjectsPage } from './components/projects/ProjectsPage';
import { WarehousePage } from './components/warehouse/WarehousePage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#1565c0',
    },
    background: {
      default: '#f6f9fc',
      paper: '#fff',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const drawerWidth = 220;

const menu = [
  { text: 'Дашборд', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Сотрудники', icon: <PeopleIcon />, path: '/users' },
  { text: 'Проекты', icon: <AssignmentIcon />, path: '/projects' },
  { text: 'Склад', icon: <WarehouseIcon />, path: '/warehouse' },
  { text: 'Аналитика', icon: <BarChartIcon />, path: '/analytics' },
  { text: 'Профиль', icon: <AccountCircleIcon />, path: '/profile' },
  { text: 'Настройки', icon: <SettingsIcon />, path: '/settings' },
];

function Placeholder({ title }: { title: string }) {
  return <Box p={4}><Typography variant="h4">{title}</Typography><Typography color="text.secondary">Раздел в разработке</Typography></Box>;
}

function App() {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 2, background: 'linear-gradient(90deg, #1976d2 60%, #2196f3 100%)' }}>
            <Toolbar>
              <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                CRM Строительная компания
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            open={open}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#e3f0ff', borderRight: 0 },
              display: { xs: open ? 'block' : 'none', sm: 'block' },
              transition: 'all 0.2s',
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
              <List>
                {menu.map((item) => (
                  <ListItem button key={item.text} component="a" href={item.path} sx={{ borderRadius: 2, my: 0.5 }}>
                    <ListItemIcon sx={{ color: '#1976d2' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
              <Divider />
            </Box>
          </Drawer>
          <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, mt: 8, transition: 'all 0.2s' }}>
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/warehouse" element={<WarehousePage />} />
              <Route path="/analytics" element={<Placeholder title="Аналитика" />} />
              <Route path="/profile" element={<Placeholder title="Профиль" />} />
              <Route path="/settings" element={<Placeholder title="Настройки" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
