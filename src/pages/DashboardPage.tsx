import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Skeleton,
  Fade,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as ProjectIcon,
  People as PeopleIcon,
  AccountBalance as MoneyIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { useDashboardStore } from '../store';
import { formatCurrency, formatNumber, generateColors } from '../utils';

// Компонент для статистической карточки
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  subtitle,
}) => {
  const getColorClasses = (color: string) => {
    const colors = {
      primary: {
        bg: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.05))',
        border: 'rgba(25, 118, 210, 0.2)',
        icon: '#1976d2',
      },
      success: {
        bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05))',
        border: 'rgba(16, 185, 129, 0.2)',
        icon: '#10b981',
      },
      warning: {
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05))',
        border: 'rgba(245, 158, 11, 0.2)',
        icon: '#f59e0b',
      },
      error: {
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.05))',
        border: 'rgba(239, 68, 68, 0.2)',
        icon: '#ef4444',
      },
      info: {
        bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.05))',
        border: 'rgba(59, 130, 246, 0.2)',
        icon: '#3b82f6',
      },
    };
    return colors[color as keyof typeof colors];
  };

  const colorConfig = getColorClasses(color);

  return (
    <Card
      sx={{
        height: '100%',
        background: colorConfig.bg,
        border: `1px solid ${colorConfig.border}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colorConfig.icon, mb: 1 }}>
              {typeof value === 'number' ? formatNumber(value) : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {change >= 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: change >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  за месяц
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: colorConfig.icon,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: `0 4px 20px ${colorConfig.border}`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Компонент для активности проектов
const ProjectActivityCard: React.FC = () => {
  const activityData = [
    { name: 'Пн', active: 4, completed: 2 },
    { name: 'Вт', active: 6, completed: 3 },
    { name: 'Ср', active: 5, completed: 1 },
    { name: 'Чт', active: 8, completed: 4 },
    { name: 'Пт', active: 7, completed: 2 },
    { name: 'Сб', active: 3, completed: 1 },
    { name: 'Вс', active: 2, completed: 0 },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Активность проектов
          </Typography>
          <IconButton size="small">
            <RefreshIcon />
          </IconButton>
        </Box>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="active" fill="#1976d2" name="Активные" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#10b981" name="Завершенные" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

// Компонент для распределения бюджета
const BudgetDistributionCard: React.FC = () => {
  const budgetData = [
    { name: 'Материалы', value: 45, color: '#1976d2' },
    { name: 'Труд', value: 30, color: '#42a5f5' },
    { name: 'Техника', value: 15, color: '#90caf9' },
    { name: 'Прочее', value: 10, color: '#bbdefb' },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Распределение бюджета
        </Typography>
        <Box sx={{ height: 250, display: 'flex', alignItems: 'center' }}>
          <ResponsiveContainer width="60%" height="100%">
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ flex: 1, pl: 2 }}>
            {budgetData.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    mr: 1,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.value}%
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Компонент для доходов и расходов
const FinancialChart: React.FC = () => {
  const financialData = [
    { month: 'Янв', income: 2400000, expense: 1800000 },
    { month: 'Фев', income: 1800000, expense: 1600000 },
    { month: 'Мар', income: 3200000, expense: 2200000 },
    { month: 'Апр', income: 2800000, expense: 2000000 },
    { month: 'Май', income: 3600000, expense: 2400000 },
    { month: 'Июн', income: 3200000, expense: 2600000 },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Доходы и расходы
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              size="small"
              label="Доходы"
              sx={{ backgroundColor: '#1976d2', color: 'white' }}
            />
            <Chip
              size="small"
              label="Расходы"
              sx={{ backgroundColor: '#f59e0b', color: 'white' }}
            />
          </Box>
        </Box>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), '']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#1976d2"
                fill="url(#incomeGradient)"
                name="Доходы"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stackId="2"
                stroke="#f59e0b"
                fill="url(#expenseGradient)"
                name="Расходы"
              />
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

// Компонент для текущих задач
const CurrentTasksCard: React.FC = () => {
  const tasks = [
    { id: 1, title: 'Укладка фундамента', project: 'Солнечный', progress: 75, priority: 'high' },
    { id: 2, title: 'Монтаж кровли', project: 'Бизнес-Центр', progress: 45, priority: 'medium' },
    { id: 3, title: 'Отделочные работы', project: 'Коттедж', progress: 90, priority: 'low' },
    { id: 4, title: 'Электромонтаж', project: 'Солнечный', progress: 30, priority: 'high' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Обычный';
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Текущие задачи
          </Typography>
          <Button size="small" variant="outlined">
            Все задачи
          </Button>
        </Box>
        <Box sx={{ space: 2 }}>
          {tasks.map((task) => (
            <Box key={task.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {task.title}
                </Typography>
                <Chip
                  size="small"
                  label={getPriorityText(task.priority)}
                  color={getPriorityColor(task.priority) as any}
                  variant="outlined"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Проект: {task.project}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={task.progress}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: task.progress >= 80 ? '#10b981' : task.progress >= 50 ? '#f59e0b' : '#1976d2',
                    },
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '40px', textAlign: 'right' }}>
                  {task.progress}%
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const { stats, isLoading, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading || !stats) {
    return (
      <Box>
        {/* Skeleton for stats cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="80%" height={40} />
                  <Skeleton variant="text" width="40%" height={16} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Skeleton for charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={300} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={300} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={600}>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Добро пожаловать в Construction CRM
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Обзор ключевых показателей и текущего состояния проектов
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Активные проекты"
              value={stats.activeProjects}
              change={12.5}
              icon={<ProjectIcon />}
              color="primary"
              subtitle={`Всего: ${stats.totalProjects}`}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Доход за месяц"
              value={formatCurrency(stats.monthlyRevenue)}
              change={8.2}
              icon={<MoneyIcon />}
              color="success"
              subtitle="Прибыль растет"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Сотрудники"
              value={`${stats.activeEmployees}/${stats.employeeCount}`}
              change={-2.1}
              icon={<PeopleIcon />}
              color="info"
              subtitle="Активные сотрудники"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Склад"
              value={stats.materialCount}
              icon={<InventoryIcon />}
              color="warning"
              subtitle={`${stats.lowStockMaterials} на исходе`}
            />
          </Grid>
        </Grid>

        {/* Charts Row 1 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <FinancialChart />
          </Grid>
          <Grid item xs={12} lg={4}>
            <BudgetDistributionCard />
          </Grid>
        </Grid>

        {/* Charts Row 2 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <ProjectActivityCard />
          </Grid>
          <Grid item xs={12} lg={4}>
            <CurrentTasksCard />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Быстрые действия
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ProjectIcon />}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Новый проект
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PeopleIcon />}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Добавить сотрудника
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<InventoryIcon />}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Заказ материалов
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  Планировщик
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default DashboardPage;