import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DashboardWidgets, DashboardStats } from './DashboardWidgets';
import { DashboardCharts } from './DashboardCharts';
import axios from 'axios';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({ projects: 0, users: 0, tools: 0, materials: 0, loading: true });
  const [charts, setCharts] = useState({
    projectsByStatus: [] as { name: string; value: number }[],
    budgetByMonth: [] as { month: string; budget: number }[],
    employeeEfficiency: [] as { name: string; value: number }[],
    warehouseStock: [] as { name: string; value: number }[],
  });

  useEffect(() => {
    // Пример загрузки данных, заменить на реальные эндпоинты
    const fetchData = async () => {
      setStats((s) => ({ ...s, loading: true }));
      try {
        // Можно объединить в один запрос на бэкенде для оптимизации
        const [projects, users, tools, materials] = await Promise.all([
          axios.get('/api/projects/projects/'),
          axios.get('/api/users/users/'),
          axios.get('/api/warehouse/tools/'),
          axios.get('/api/warehouse/materials/'),
        ]);
        setStats({
          projects: projects.data.length,
          users: users.data.length,
          tools: tools.data.length,
          materials: materials.data.length,
          loading: false,
        });
        // Примерные данные для графиков (заменить на реальные)
        setCharts({
          projectsByStatus: [
            { name: 'В работе', value: projects.data.filter((p:any) => p.status === 'В работе').length },
            { name: 'Завершён', value: projects.data.filter((p:any) => p.status === 'Завершён').length },
            { name: 'Пауза', value: projects.data.filter((p:any) => p.status === 'Пауза').length },
          ],
          budgetByMonth: [
            { month: 'Янв', budget: 120000 },
            { month: 'Фев', budget: 90000 },
            { month: 'Мар', budget: 150000 },
            { month: 'Апр', budget: 110000 },
          ],
          employeeEfficiency: users.data.slice(0, 5).map((u:any) => ({ name: u.username, value: Math.round(Math.random() * 100) })),
          warehouseStock: tools.data.slice(0, 5).map((t:any) => ({ name: t.name, value: t.quantity })),
        });
      } catch (e) {
        setStats((s) => ({ ...s, loading: false }));
      }
    };
    fetchData();
  }, []);

  return (
    <Box>
      <Typography variant="h4" mb={2}>Дашборд</Typography>
      <DashboardWidgets stats={stats} />
      <DashboardCharts {...charts} />
    </Box>
  );
};