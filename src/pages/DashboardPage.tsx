import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  QrCodeScanner as QrScannerIcon,
  WbSunny as WeatherIcon,
} from '@mui/icons-material';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useDashboardStore } from '../store';
import { formatCurrency, generateColors } from '../utils';
import WeatherWidget from '../components/Advanced/WeatherWidget';
import QRCodeScanner from '../components/Advanced/QRCodeScanner';

const DashboardPage: React.FC = () => {
  const { stats, loading, fetchStats } = useDashboardStore();
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Данные для графиков
  const financialData = [
    { name: 'Янв', income: 2400000, expenses: 1800000 },
    { name: 'Фев', income: 1398000, expenses: 1200000 },
    { name: 'Мар', income: 9800000, expenses: 2800000 },
    { name: 'Апр', income: 3908000, expenses: 2400000 },
    { name: 'Май', income: 4800000, expenses: 3200000 },
    { name: 'Июн', income: 3800000, expenses: 2900000 },
  ];

  const budgetDistribution = [
    { name: 'Материалы', value: 45, color: '#1976d2' },
    { name: 'Зарплата', value: 30, color: '#388e3c' },
    { name: 'Оборудование', value: 15, color: '#f57c00' },
    { name: 'Прочее', value: 10, color: '#7b1fa2' },
  ];

  const projectActivity = [
    { name: 'Пн', tasks: 12 },
    { name: 'Вт', tasks: 19 },
    { name: 'Ср', tasks: 15 },
    { name: 'Чт', tasks: 22 },
    { name: 'Пт', tasks: 18 },
    { name: 'Сб', tasks: 8 },
    { name: 'Вс', tasks: 5 },
  ];

  const currentTasks = [
    { id: 1, name: 'Заливка фундамента', progress: 75, assignee: 'И. Иванов', priority: 'high' },
    { id: 2, name: 'Монтаж кровли', progress: 45, assignee: 'П. Петров', priority: 'medium' },
    { id: 3, name: 'Отделочные работы', progress: 20, assignee: 'С. Сидоров', priority: 'low' },
    { id: 4, name: 'Электромонтаж', progress: 90, assignee: 'К. Козлов', priority: 'high' },
  ];

  const recentActivities = [
    { id: 1, type: 'task_completed', message: 'Завершена задача "Подготовка котлована"', time: '2 часа назад', user: 'И. Иванов' },
    { id: 2, type: 'material_delivered', message: 'Поставлен цемент М400 - 50 мешков', time: '4 часа назад', user: 'Склад' },
    { id: 3, type: 'safety_incident', message: 'Зарегистрирован инцидент на объекте №2', time: '6 часов назад', user: 'Отдел ТБ' },
    { id: 4, type: 'quality_check', message: 'Проведена проверка качества фундамента', time: '1 день назад', user: 'К. Петров' },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {value}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {change >= 0 ? (
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 18 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', fontSize: 18 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: change >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {Math.abs(change)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const FinancialChart: React.FC = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Финансовая динамика
          </Typography>
          <Button size="small" variant="outlined">
            Подробнее
          </Button>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={financialData}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d32f2f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#1976d2"
              strokeWidth={3}
              fill="url(#incomeGradient)"
              name="Доходы"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#d32f2f"
              strokeWidth={3}
              fill="url(#expensesGradient)"
              name="Расходы"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const BudgetDistributionCard: React.FC = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Распределение бюджета
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={budgetDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {budgetDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const ProjectActivityCard: React.FC = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Активность по проектам
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={projectActivity}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tasks" fill="#1976d2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const CurrentTasksCard: React.FC = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Текущие задачи
          </Typography>
          <Button size="small" variant="outlined">
            Все задачи
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentTasks.map((task) => (
            <Box key={task.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {task.name}
                </Typography>
                <Chip
                  size="small"
                  label={task.priority}
                  color={
                    task.priority === 'high'
                      ? 'error'
                      : task.priority === 'medium'
                      ? 'warning'
                      : 'success'
                  }
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {task.assignee}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {task.progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={task.progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const RecentActivitiesCard: React.FC = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Последние события
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recentActivities.map((activity) => (
            <Box key={activity.id} sx={{ display: 'flex', gap: 2, p: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor:
                    activity.type === 'task_completed'
                      ? 'success.main'
                      : activity.type === 'material_delivered'
                      ? 'info.main'
                      : activity.type === 'safety_incident'
                      ? 'error.main'
                      : 'warning.main',
                }}
              >
                {activity.type === 'task_completed' ? '✓' : 
                 activity.type === 'material_delivered' ? '📦' :
                 activity.type === 'safety_incident' ? '⚠️' : '🔍'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {activity.message}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {activity.user}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    •
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActionsCard: React.FC = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Быстрые действия
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mb: 1 }}
            >
              Новый проект
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<QrScannerIcon />}
              onClick={() => setQrScannerOpen(true)}
              sx={{ mb: 1 }}
            >
              QR Сканер
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SecurityIcon />}
              sx={{ mb: 1 }}
            >
              Инцидент ТБ
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<InventoryIcon />}
              sx={{ mb: 1 }}
            >
              Инвентарь
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Дашборд управления
      </Typography>

      {/* Основные показатели */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Активные проекты"
            value={stats?.activeProjects || 0}
            change={12}
            icon={<BusinessIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Месячная выручка"
            value={formatCurrency(stats?.monthlyRevenue || 0)}
            change={8.2}
            icon={<MoneyIcon />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Сотрудники"
            value={stats?.employeeCount || 0}
            change={-2.1}
            icon={<PeopleIcon />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Склад"
            value={`${stats?.materialCount || 0} единиц`}
            change={5.4}
            icon={<InventoryIcon />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      {/* Дополнительные показатели */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BuildIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {stats?.brokenTools || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Неисправных инструментов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {stats?.safetyIncidentsThisMonth || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Инцидентов за месяц
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MoneyIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {stats?.overdueInvoices || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Просроченных счетов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {Math.round(stats?.utilizationRate || 0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Загрузка персонала
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Графики и виджеты */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <FinancialChart />
        </Grid>
        <Grid item xs={12} lg={4}>
          <WeatherWidget compact />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <BudgetDistributionCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <ProjectActivityCard />
        </Grid>
      </Grid>

      {/* Детальная информация */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <CurrentTasksCard />
        </Grid>
        <Grid item xs={12} md={4}>
          <RecentActivitiesCard />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickActionsCard />
        </Grid>
      </Grid>

      {/* QR Сканер */}
      <QRCodeScanner
        open={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScan={(data) => {
          console.log('QR scanned:', data);
          // Здесь можно добавить логику обработки сканированного QR кода
        }}
      />
    </Box>
  );
};

export default DashboardPage;