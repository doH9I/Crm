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
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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

import { useDashboardStore, useProjectStore } from '../store';
import { formatCurrency } from '../utils';
import WeatherWidget from '../components/Advanced/WeatherWidget';
import QRCodeScanner from '../components/Advanced/QRCodeScanner';
import { useProjectFilter } from '../hooks/useProjectFilter';

const DashboardPage: React.FC = () => {
  const { stats, loading, fetchStats } = useDashboardStore();
  const { selectedProject, showAllProjects } = useProjectStore();
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Данные для графиков в зависимости от выбранного проекта
  const getFinancialData = () => {
    if (selectedProject) {
      // Данные для конкретного проекта
      return [
        { name: 'Янв', income: selectedProject.spentAmount * 0.2, expenses: selectedProject.spentAmount * 0.15, month: 'january' },
        { name: 'Фев', income: selectedProject.spentAmount * 0.3, expenses: selectedProject.spentAmount * 0.25, month: 'february' },
        { name: 'Мар', income: selectedProject.spentAmount * 0.4, expenses: selectedProject.spentAmount * 0.35, month: 'march' },
        { name: 'Апр', income: selectedProject.spentAmount * 0.5, expenses: selectedProject.spentAmount * 0.45, month: 'april' },
        { name: 'Май', income: selectedProject.spentAmount * 0.6, expenses: selectedProject.spentAmount * 0.55, month: 'may' },
        { name: 'Июн', income: selectedProject.spentAmount * 0.7, expenses: selectedProject.spentAmount * 0.65, month: 'june' },
      ];
    }
    // Общие данные для всех проектов
    return [
      { name: 'Янв', income: 2400000, expenses: 1800000, month: 'january' },
      { name: 'Фев', income: 1398000, expenses: 1200000, month: 'february' },
      { name: 'Мар', income: 9800000, expenses: 2800000, month: 'march' },
      { name: 'Апр', income: 3908000, expenses: 2400000, month: 'april' },
      { name: 'Май', income: 4800000, expenses: 3200000, month: 'may' },
      { name: 'Июн', income: 3800000, expenses: 2900000, month: 'june' },
    ];
  };

  const getBudgetDistribution = () => {
    if (selectedProject) {
      // Распределение бюджета для конкретного проекта
      return [
        { name: 'Материалы', value: 50, color: '#1976d2', category: 'materials' },
        { name: 'Зарплата', value: 25, color: '#388e3c', category: 'salary' },
        { name: 'Оборудование', value: 15, color: '#f57c00', category: 'equipment' },
        { name: 'Прочее', value: 10, color: '#7b1fa2', category: 'other' },
      ];
    }
    // Общее распределение бюджета
    return [
      { name: 'Материалы', value: 45, color: '#1976d2', category: 'materials' },
      { name: 'Зарплата', value: 30, color: '#388e3c', category: 'salary' },
      { name: 'Оборудование', value: 15, color: '#f57c00', category: 'equipment' },
      { name: 'Прочее', value: 10, color: '#7b1fa2', category: 'other' },
    ];
  };

  const getProjectActivity = () => {
    if (selectedProject) {
      // Активность для конкретного проекта
      return [
        { name: 'Пн', tasks: Math.floor(selectedProject.progress / 10), day: 'monday' },
        { name: 'Вт', tasks: Math.floor(selectedProject.progress / 8), day: 'tuesday' },
        { name: 'Ср', tasks: Math.floor(selectedProject.progress / 12), day: 'wednesday' },
        { name: 'Чт', tasks: Math.floor(selectedProject.progress / 6), day: 'thursday' },
        { name: 'Пт', tasks: Math.floor(selectedProject.progress / 9), day: 'friday' },
        { name: 'Сб', tasks: Math.floor(selectedProject.progress / 15), day: 'saturday' },
        { name: 'Вс', tasks: Math.floor(selectedProject.progress / 20), day: 'sunday' },
      ];
    }
    // Общая активность
    return [
      { name: 'Пн', tasks: 12, day: 'monday' },
      { name: 'Вт', tasks: 19, day: 'tuesday' },
      { name: 'Ср', tasks: 15, day: 'wednesday' },
      { name: 'Чт', tasks: 22, day: 'thursday' },
      { name: 'Пт', tasks: 18, day: 'friday' },
      { name: 'Сб', tasks: 8, day: 'saturday' },
      { name: 'Вс', tasks: 5, day: 'sunday' },
    ];
  };

  const getCurrentTasks = () => {
    if (selectedProject) {
      // Задачи для конкретного проекта
      return [
        { id: 1, name: `${selectedProject.name} - Фундамент`, progress: selectedProject.progress * 0.8, assignee: 'И. Иванов', priority: 'high' },
        { id: 2, name: `${selectedProject.name} - Стены`, progress: selectedProject.progress * 0.6, assignee: 'П. Петров', priority: 'medium' },
        { id: 3, name: `${selectedProject.name} - Кровля`, progress: selectedProject.progress * 0.4, assignee: 'С. Сидоров', priority: 'low' },
        { id: 4, name: `${selectedProject.name} - Отделка`, progress: selectedProject.progress * 0.2, assignee: 'К. Козлов', priority: 'high' },
      ];
    }
    // Общие задачи
    return [
      { id: 1, name: 'Заливка фундамента', progress: 75, assignee: 'И. Иванов', priority: 'high' },
      { id: 2, name: 'Монтаж кровли', progress: 45, assignee: 'П. Петров', priority: 'medium' },
      { id: 3, name: 'Отделочные работы', progress: 20, assignee: 'С. Сидоров', priority: 'low' },
      { id: 4, name: 'Электромонтаж', progress: 90, assignee: 'К. Козлов', priority: 'high' },
    ];
  };

  const getRecentActivities = () => {
    if (selectedProject) {
      // Активности для конкретного проекта
      return [
        { id: 1, type: 'task_completed', message: `Завершена задача в проекте "${selectedProject.name}"`, time: '2 часа назад', user: 'И. Иванов' },
        { id: 2, type: 'material_delivered', message: `Поставлены материалы для "${selectedProject.name}"`, time: '4 часа назад', user: 'Склад' },
        { id: 3, type: 'safety_incident', message: `Проверка безопасности на "${selectedProject.name}"`, time: '6 часов назад', user: 'Отдел ТБ' },
        { id: 4, type: 'quality_check', message: `Проверка качества "${selectedProject.name}"`, time: '1 день назад', user: 'К. Петров' },
      ];
    }
    // Общие активности
    return [
      { id: 1, type: 'task_completed', message: 'Завершена задача "Подготовка котлована"', time: '2 часа назад', user: 'И. Иванов' },
      { id: 2, type: 'material_delivered', message: 'Поставлен цемент М400 - 50 мешков', time: '4 часа назад', user: 'Склад' },
      { id: 3, type: 'safety_incident', message: 'Зарегистрирован инцидент на объекте №2', time: '6 часов назад', user: 'Отдел ТБ' },
      { id: 4, type: 'quality_check', message: 'Проведена проверка качества фундамента', time: '1 день назад', user: 'К. Петров' },
    ];
  };

  const financialData = getFinancialData();
  const budgetDistribution = getBudgetDistribution();
  const projectActivity = getProjectActivity();
  const currentTasks = getCurrentTasks();
  const recentActivities = getRecentActivities();

  // Обработчики кликов по графикам
  const handleBudgetClick = (data: any) => {
    if (data && data.category) {
      navigate(`/reports/budget-analysis?category=${data.category}`);
    }
  };

  const handleProjectActivityClick = (data: any) => {
    if (data && data.day) {
      navigate(`/reports/project-activity?day=${data.day}`);
    }
  };

  const handleFinancialChartClick = (data: any) => {
    if (data && data.month) {
      navigate(`/reports/monthly-financial?month=${data.month}`);
    }
  };

  const handleAllTasksClick = () => {
    navigate('/tasks');
  };

  const handleSafetyClick = () => {
    navigate('/safety');
  };

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
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => navigate('/reports/financial-overview')}
          >
            Подробнее
          </Button>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={financialData} onClick={handleFinancialChartClick}>
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
              style={{ cursor: 'pointer' }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#d32f2f"
              strokeWidth={3}
              fill="url(#expensesGradient)"
              name="Расходы"
              style={{ cursor: 'pointer' }}
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
              style={{ cursor: 'pointer' }}
              onClick={handleBudgetClick}
            >
              {budgetDistribution.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{ cursor: 'pointer' }}
                />
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
          <BarChart data={projectActivity} onClick={handleProjectActivityClick}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey="tasks" 
              fill="#1976d2" 
              radius={[4, 4, 0, 0]} 
              style={{ cursor: 'pointer' }}
            />
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
          <Button 
            size="small" 
            variant="outlined"
            onClick={handleAllTasksClick}
          >
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

  const ProjectInfoCard: React.FC = () => {
    if (showAllProjects) {
      return (
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Все проекты
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
              Отображаются данные по всем проектам
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip 
                label="Общий обзор" 
                size="small" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
              />
            </Box>
          </CardContent>
        </Card>
      );
    }

    if (!selectedProject) {
      return (
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              Проект не выбран
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
              Выберите проект в меню для отображения данных
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip 
                label="Требуется выбор" 
                size="small" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
              />
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
            {selectedProject.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, mb: 2 }}>
            {selectedProject.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                Прогресс
              </Typography>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {selectedProject.progress}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
                Бюджет
              </Typography>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {formatCurrency(selectedProject.spentAmount)} / {formatCurrency(selectedProject.budget)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={selectedProject.status === 'in_progress' ? 'В работе' : 
                     selectedProject.status === 'planning' ? 'Планирование' : 
                     selectedProject.status === 'completed' ? 'Завершен' : selectedProject.status} 
              size="small" 
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
            <Chip 
              label={selectedProject.priority === 'high' ? 'Высокий' : 
                     selectedProject.priority === 'medium' ? 'Средний' : 'Низкий'} 
              size="small" 
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

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
              onClick={() => navigate('/projects')}
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
              onClick={handleSafetyClick}
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
              onClick={() => navigate('/materials')}
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
            title={selectedProject ? "Прогресс проекта" : "Активные проекты"}
            value={selectedProject ? `${selectedProject.progress}%` : (stats?.activeProjects || 0)}
            change={selectedProject ? selectedProject.progress - 10 : 12}
            icon={<BusinessIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={selectedProject ? "Бюджет проекта" : "Месячная выручка"}
            value={selectedProject ? formatCurrency(selectedProject.spentAmount) : formatCurrency(stats?.monthlyRevenue || 0)}
            change={selectedProject ? 8.2 : 8.2}
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
          <ProjectInfoCard />
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