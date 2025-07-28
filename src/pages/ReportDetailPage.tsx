import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Breadcrumbs,
  Link,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as ReportIcon,
  ArrowBack as BackIcon,
  FileDownload as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Моковые данные для отчётов
const reportData = {
  'financial-overview': {
    title: 'Финансовый обзор',
    data: {
      summary: {
        totalRevenue: 15000000,
        totalExpenses: 12000000,
        profit: 3000000,
        profitMargin: 20,
        trend: 'up',
        monthlyRevenue: [
          { month: 'Янв', revenue: 2000000, expenses: 1600000 },
          { month: 'Фев', revenue: 2200000, expenses: 1700000 },
          { month: 'Мар', revenue: 2400000, expenses: 1800000 },
          { month: 'Апр', revenue: 2500000, expenses: 1900000 },
          { month: 'Май', revenue: 2800000, expenses: 2000000 },
          { month: 'Июн', revenue: 3100000, expenses: 2000000 },
        ],
        categories: [
          { name: 'Материалы', amount: 5000000, percentage: 41.7 },
          { name: 'Зарплата', amount: 4000000, percentage: 33.3 },
          { name: 'Оборудование', amount: 2000000, percentage: 16.7 },
          { name: 'Прочее', amount: 1000000, percentage: 8.3 },
        ]
      }
    }
  },
  'budget-analysis': {
    title: 'Анализ бюджета',
    data: {
      materials: {
        allocated: 1000000,
        spent: 650000,
        remaining: 350000,
        percentage: 65,
        trend: 'up',
        transactions: [
          { date: '2024-01-15', description: 'Цемент М400', amount: -150000, supplier: 'ООО СтройМат' },
          { date: '2024-01-18', description: 'Арматура d12', amount: -85000, supplier: 'МеталлТорг' },
          { date: '2024-01-20', description: 'Кирпич облицовочный', amount: -120000, supplier: 'КирпичСтрой' },
          { date: '2024-01-22', description: 'Возврат бракованного товара', amount: 35000, supplier: 'ООО СтройМат' },
        ]
      },
      salary: {
        allocated: 800000,
        spent: 450000,
        remaining: 350000,
        percentage: 56.25,
        trend: 'stable',
        transactions: [
          { date: '2024-01-31', description: 'Зарплата строителей', amount: -280000, department: 'Строительство' },
          { date: '2024-01-31', description: 'Зарплата инженеров', amount: -170000, department: 'Инженерия' },
        ]
      },
      equipment: {
        allocated: 300000,
        spent: 180000,
        remaining: 120000,
        percentage: 60,
        trend: 'down',
        transactions: [
          { date: '2024-01-10', description: 'Аренда экскаватора', amount: -45000, vendor: 'СтройТехника' },
          { date: '2024-01-15', description: 'Топливо для техники', amount: -25000, vendor: 'АЗС Лукойл' },
          { date: '2024-01-20', description: 'Ремонт бетономешалки', amount: -15000, vendor: 'ТехСервис' },
        ]
      },
      other: {
        allocated: 200000,
        spent: 85000,
        remaining: 115000,
        percentage: 42.5,
        trend: 'stable',
        transactions: [
          { date: '2024-01-12', description: 'Коммунальные услуги', amount: -35000, category: 'Операционные' },
          { date: '2024-01-25', description: 'Канцелярские товары', amount: -8000, category: 'Офис' },
          { date: '2024-01-28', description: 'Транспортные расходы', amount: -42000, category: 'Логистика' },
        ]
      }
    }
  },
  'project-activity': {
    title: 'Активность по проектам',
    data: {
      monday: {
        tasks: 12,
        completed: 8,
        inProgress: 3,
        delayed: 1,
        projects: [
          { name: 'Жилой комплекс "Солнечный"', tasks: 5, progress: 75 },
          { name: 'Офисный центр "Центральный"', tasks: 4, progress: 60 },
          { name: 'Торговый центр "Весна"', tasks: 3, progress: 45 },
        ]
      },
      tuesday: {
        tasks: 19,
        completed: 14,
        inProgress: 4,
        delayed: 1,
        projects: [
          { name: 'Жилой комплекс "Солнечный"', tasks: 8, progress: 80 },
          { name: 'Офисный центр "Центральный"', tasks: 6, progress: 65 },
          { name: 'Торговый центр "Весна"', tasks: 5, progress: 50 },
        ]
      },
      // ... другие дни недели
    }
  },
  'monthly-financial': {
    title: 'Месячный финансовый отчёт',
    data: {
      january: {
        income: 2400000,
        expenses: 1800000,
        profit: 600000,
        profitMargin: 25,
        categories: [
          { name: 'Строительство', income: 1800000, expenses: 1200000 },
          { name: 'Консультации', income: 400000, expenses: 300000 },
          { name: 'Аренда техники', income: 200000, expenses: 300000 },
        ],
        dailyData: Array.from({ length: 31 }, (_, i) => ({
          day: i + 1,
          income: Math.floor(Math.random() * 100000) + 50000,
          expenses: Math.floor(Math.random() * 80000) + 40000,
        }))
      },
      february: {
        income: 1398000,
        expenses: 1200000,
        profit: 198000,
        profitMargin: 14.2,
        categories: [
          { name: 'Строительство', income: 1000000, expenses: 800000 },
          { name: 'Консультации', income: 298000, expenses: 250000 },
          { name: 'Аренда техники', income: 100000, expenses: 150000 },
        ],
        dailyData: Array.from({ length: 28 }, (_, i) => ({
          day: i + 1,
          income: Math.floor(Math.random() * 80000) + 30000,
          expenses: Math.floor(Math.random() * 70000) + 35000,
        }))
      },
      // ... другие месяцы
    }
  }
};

const ReportDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { reportType } = useParams<{ reportType: string }>();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Симуляция загрузки данных
    setTimeout(() => {
      const category = searchParams.get('category');
      const day = searchParams.get('day');
      const month = searchParams.get('month');

      if (reportType && reportData[reportType as keyof typeof reportData]) {
        const report = reportData[reportType as keyof typeof reportData];
        let reportData_subset = report.data;

        if (category && reportData_subset[category as keyof typeof reportData_subset]) {
          reportData_subset = { [category]: reportData_subset[category as keyof typeof reportData_subset] };
        }

        if (day && reportData_subset[day as keyof typeof reportData_subset]) {
          reportData_subset = { [day]: reportData_subset[day as keyof typeof reportData_subset] };
        }

        if (month && reportData_subset[month as keyof typeof reportData_subset]) {
          reportData_subset = { [month]: reportData_subset[month as keyof typeof reportData_subset] };
        }

        setData({ ...report, data: reportData_subset });
      }
      setLoading(false);
    }, 1000);
  }, [reportType, searchParams]);

  const getReportTypeIcon = () => {
    switch (reportType) {
      case 'financial-overview':
        return '📊';
      case 'budget-analysis':
        return '💰';
      case 'project-activity':
        return '📊';
      case 'monthly-financial':
        return '📈';
      default:
        return '📋';
    }
  };

  const getBreadcrumbs = () => {
    const category = searchParams.get('category');
    const day = searchParams.get('day');
    const month = searchParams.get('month');

    const breadcrumbs = [
      { label: 'Главная', href: '/dashboard' },
      { label: 'Отчёты', href: '/reports' },
      { label: data?.title || 'Отчёт', href: null },
    ];

    if (category) breadcrumbs.push({ label: getCategoryName(category), href: null });
    if (day) breadcrumbs.push({ label: getDayName(day), href: null });
    if (month) breadcrumbs.push({ label: getMonthName(month), href: null });

    return breadcrumbs;
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      materials: 'Материалы',
      salary: 'Зарплата',
      equipment: 'Оборудование',
      other: 'Прочее',
    };
    return names[category] || category;
  };

  const getDayName = (day: string) => {
    const names: { [key: string]: string } = {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье',
    };
    return names[day] || day;
  };

  const getMonthName = (month: string) => {
    const names: { [key: string]: string } = {
      january: 'Январь',
      february: 'Февраль',
      march: 'Март',
      april: 'Апрель',
      may: 'Май',
      june: 'Июнь',
    };
    return names[month] || month;
  };

  const renderBudgetAnalysis = () => {
    const categories = Object.keys(data.data);
    const chartData = categories.map(key => ({
      name: getCategoryName(key),
      allocated: data.data[key].allocated,
      spent: data.data[key].spent,
      remaining: data.data[key].remaining,
      percentage: data.data[key].percentage,
    }));

    return (
      <Grid container spacing={3}>
        {/* Сводка */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Сводка по бюджету
              </Typography>
              <Grid container spacing={3}>
                {categories.map(key => {
                  const categoryData = data.data[key];
                  return (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" color="primary">
                            {getCategoryName(key)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Typography variant="h4">
                              {categoryData.percentage}%
                            </Typography>
                            {categoryData.trend === 'up' ? (
                              <TrendingUpIcon color="error" />
                            ) : categoryData.trend === 'down' ? (
                              <TrendingDownIcon color="success" />
                            ) : null}
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={categoryData.percentage} 
                            sx={{ mt: 2, mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Потрачено: {categoryData.spent.toLocaleString('ru-RU')} ₽
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Остаток: {categoryData.remaining.toLocaleString('ru-RU')} ₽
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* График */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Распределение бюджета
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`} />
                  <Legend />
                  <Bar dataKey="allocated" fill="#8884d8" name="Выделено" />
                  <Bar dataKey="spent" fill="#82ca9d" name="Потрачено" />
                  <Bar dataKey="remaining" fill="#ffc658" name="Остаток" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Детальные транзакции */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Последние транзакции
              </Typography>
              {categories.map(key => {
                const categoryData = data.data[key];
                return (
                  <Box key={key} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {getCategoryName(key)}
                    </Typography>
                    {categoryData.transactions?.map((transaction: any, index: number) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {transaction.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(transaction.date), 'dd.MM.yyyy', { locale: ru })}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                          sx={{ fontWeight: 600 }}
                        >
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderProjectActivity = () => {
    const days = Object.keys(data.data);
    
    return (
      <Grid container spacing={3}>
        {days.map(day => {
          const dayData = data.data[day];
          return (
            <Grid item xs={12} key={day}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    {getDayName(day)} - Активность по проектам
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Card variant="outlined" sx={{ flex: 1, textAlign: 'center' }}>
                          <CardContent>
                            <Typography variant="h4" color="primary">
                              {dayData.tasks}
                            </Typography>
                            <Typography variant="body2">Всего задач</Typography>
                          </CardContent>
                        </Card>
                        <Card variant="outlined" sx={{ flex: 1, textAlign: 'center' }}>
                          <CardContent>
                            <Typography variant="h4" color="success.main">
                              {dayData.completed}
                            </Typography>
                            <Typography variant="body2">Завершено</Typography>
                          </CardContent>
                        </Card>
                        <Card variant="outlined" sx={{ flex: 1, textAlign: 'center' }}>
                          <CardContent>
                            <Typography variant="h4" color="warning.main">
                              {dayData.inProgress}
                            </Typography>
                            <Typography variant="body2">В работе</Typography>
                          </CardContent>
                        </Card>
                        <Card variant="outlined" sx={{ flex: 1, textAlign: 'center' }}>
                          <CardContent>
                            <Typography variant="h4" color="error.main">
                              {dayData.delayed}
                            </Typography>
                            <Typography variant="body2">Просрочено</Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Проекты
                      </Typography>
                      {dayData.projects.map((project: any, index: number) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {project.name}
                            </Typography>
                            <Typography variant="body2">
                              {project.tasks} задач
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={project.progress} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Прогресс: {project.progress}%
                          </Typography>
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderFinancialOverview = () => {
    const summaryData = data.data.summary;
    
    return (
      <Grid container spacing={3}>
        {/* Основные показатели */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {summaryData.totalRevenue.toLocaleString('ru-RU')} ₽
                  </Typography>
                  <Typography variant="body2">Общая выручка</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {summaryData.totalExpenses.toLocaleString('ru-RU')} ₽
                  </Typography>
                  <Typography variant="body2">Общие расходы</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {summaryData.profit.toLocaleString('ru-RU')} ₽
                  </Typography>
                  <Typography variant="body2">Прибыль</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {summaryData.profitMargin}%
                  </Typography>
                  <Typography variant="body2">Рентабельность</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* График динамики */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Динамика доходов и расходов
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summaryData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip 
                    formatter={(value: any) => [`${value.toLocaleString('ru-RU')} ₽`, '']}
                    labelFormatter={(label) => `Месяц: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#4CAF50" name="Доходы" />
                  <Bar dataKey="expenses" fill="#F44336" name="Расходы" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Распределение расходов */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Структура расходов
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summaryData.categories}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={(entry) => `${entry.percentage}%`}
                  >
                    {summaryData.categories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value.toLocaleString('ru-RU')} ₽`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderMonthlyFinancial = () => {
    const months = Object.keys(data.data);
    
    return (
      <Grid container spacing={3}>
        {months.map(month => {
          const monthData = data.data[month];
          return (
            <Grid item xs={12} key={month}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    {getMonthName(month)} - Финансовый отчёт
                  </Typography>
                  
                  {/* Основные показатели */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main">
                            {monthData.income.toLocaleString('ru-RU')} ₽
                          </Typography>
                          <Typography variant="body2">Доходы</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="error.main">
                            {monthData.expenses.toLocaleString('ru-RU')} ₽
                          </Typography>
                          <Typography variant="body2">Расходы</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary.main">
                            {monthData.profit.toLocaleString('ru-RU')} ₽
                          </Typography>
                          <Typography variant="body2">Прибыль</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="info.main">
                            {monthData.profitMargin}%
                          </Typography>
                          <Typography variant="body2">Маржа</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* График по дням */}
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Динамика по дням
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthData.dailyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="income" 
                            stroke="#8884d8" 
                            name="Доходы"
                            strokeWidth={2}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="expenses" 
                            stroke="#82ca9d" 
                            name="Расходы"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Категории */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        По категориям
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Категория</TableCell>
                              <TableCell align="right">Доходы</TableCell>
                              <TableCell align="right">Расходы</TableCell>
                              <TableCell align="right">Прибыль</TableCell>
                              <TableCell align="right">Маржа</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {monthData.categories.map((category: any, index: number) => {
                              const profit = category.income - category.expenses;
                              const margin = category.income > 0 ? ((profit / category.income) * 100).toFixed(1) : 0;
                              
                              return (
                                <TableRow key={index}>
                                  <TableCell>{category.name}</TableCell>
                                  <TableCell align="right">
                                    {category.income.toLocaleString('ru-RU')} ₽
                                  </TableCell>
                                  <TableCell align="right">
                                    {category.expenses.toLocaleString('ru-RU')} ₽
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography 
                                      color={profit >= 0 ? 'success.main' : 'error.main'}
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {profit.toLocaleString('ru-RU')} ₽
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip 
                                      label={`${margin}%`}
                                      color={Number(margin) >= 20 ? 'success' : Number(margin) >= 10 ? 'warning' : 'error'}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderContent = () => {
    if (!data) return null;

    switch (reportType) {
      case 'financial-overview':
        return renderFinancialOverview();
      case 'budget-analysis':
        return renderBudgetAnalysis();
      case 'project-activity':
        return renderProjectActivity();
      case 'monthly-financial':
        return renderMonthlyFinancial();
      default:
        return <Typography>Тип отчёта не поддерживается</Typography>;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Загрузка отчёта...</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Отчёт не найден</Typography>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')}>
          Вернуться на главную
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Хлебные крошки */}
      <Breadcrumbs sx={{ mb: 2 }}>
        {getBreadcrumbs().map((crumb, index) => (
          crumb.href ? (
            <Link
              key={index}
              underline="hover"
              color="inherit"
              onClick={() => navigate(crumb.href!)}
              sx={{ cursor: 'pointer' }}
            >
              {crumb.label}
            </Link>
          ) : (
            <Typography key={index} color="text.primary">
              {crumb.label}
            </Typography>
          )
        ))}
      </Breadcrumbs>

      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/dashboard')}
          >
            Назад
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {getReportTypeIcon()} {data.title}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Печать
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => alert('Экспорт будет добавлен позже')}
          >
            Экспорт
          </Button>
        </Box>
      </Box>

      {/* Содержимое отчёта */}
      {renderContent()}
    </Box>
  );
};

export default ReportDetailPage;