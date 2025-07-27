import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

const COLORS = ['#1976d2', '#64b5f6', '#90caf9', '#1565c0', '#42a5f5'];

export const DashboardCharts: React.FC<{
  projectsByStatus: { name: string; value: number }[];
  budgetByMonth: { month: string; budget: number }[];
  employeeEfficiency: { name: string; value: number }[];
  warehouseStock: { name: string; value: number }[];
}> = ({ projectsByStatus, budgetByMonth, employeeEfficiency, warehouseStock }) => (
  <Grid container spacing={2}>
    <Grid item xs={12} md={3}>
      <Paper sx={{ p: 2, borderRadius: 3, height: 320 }}>
        <Typography variant="subtitle1" mb={1}>Проекты по статусу</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={projectsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
              {projectsByStatus.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
    <Grid item xs={12} md={5}>
      <Paper sx={{ p: 2, borderRadius: 3, height: 320 }}>
        <Typography variant="subtitle1" mb={1}>Бюджет по месяцам</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={budgetByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="budget" fill="#1976d2" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
    <Grid item xs={12} md={4}>
      <Paper sx={{ p: 2, borderRadius: 3, height: 320 }}>
        <Typography variant="subtitle1" mb={1}>Эффективность сотрудников</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={employeeEfficiency}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
    <Grid item xs={12} md={6}>
      <Paper sx={{ p: 2, borderRadius: 3, height: 320 }}>
        <Typography variant="subtitle1" mb={1}>Остатки склада</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={warehouseStock} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="value" fill="#64b5f6" radius={[0,8,8,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  </Grid>
);