import React from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import AssignmentIcon from '@mui/icons-material/Assignment';

export type DashboardStats = {
  projects: number;
  users: number;
  tools: number;
  materials: number;
  loading?: boolean;
};

const widgetData = [
  { label: 'Проекты', icon: <AssignmentIcon fontSize="large" color="primary" />, key: 'projects', color: '#1976d2' },
  { label: 'Сотрудники', icon: <PeopleIcon fontSize="large" color="primary" />, key: 'users', color: '#1976d2' },
  { label: 'Инструменты', icon: <WarehouseIcon fontSize="large" color="primary" />, key: 'tools', color: '#1976d2' },
  { label: 'Материалы', icon: <DashboardIcon fontSize="large" color="primary" />, key: 'materials', color: '#1976d2' },
];

export const DashboardWidgets: React.FC<{ stats: DashboardStats }> = ({ stats }) => (
  <Grid container spacing={2} mb={2}>
    {widgetData.map((w) => (
      <Grid item xs={12} sm={6} md={3} key={w.key}>
        <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 3, minHeight: 100 }}>
          <Box mr={2}>{w.icon}</Box>
          <Box>
            <Typography variant="h6" color="text.secondary">{w.label}</Typography>
            {stats.loading ? <CircularProgress size={24} /> : <Typography variant="h4" color={w.color}>{(stats as any)[w.key]}</Typography>}
          </Box>
        </Paper>
      </Grid>
    ))}
  </Grid>
);