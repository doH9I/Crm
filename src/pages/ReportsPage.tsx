import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Tooltip,
  Fab,
  Switch,
  FormControlLabel,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Badge,
  Alert,
  Skeleton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  TreeView,
  TreeItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Assessment as ReportIcon,
  BarChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  TableChart as TableIcon,
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Palette as PaletteIcon,
  Code as CodeIcon,
  DataUsage as DataIcon,
  Timeline as TimelineIcon,
  AccountBalance as FinanceIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Security as SecurityIcon,
  Construction as ConstructionIcon,
  Analytics as AnalyticsIcon,
  AutoGraph as AutoGraphIcon,
  Insights as InsightsIcon,
  Calculate as CalculateIcon,
  MonetizationOn as MoneyIcon,
  Engineering as EngineeringIcon,
  Architecture as ArchitectureIcon,
  Gavel as ComplianceIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Report, Template } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Расширенные типы отчетов с детальными подкategoriями
const advancedReportTypes = [
  {
    id: 'financial',
    name: 'Финансовая аналитика',
    description: 'Полный финансовый анализ и прогнозирование',
    icon: <FinanceIcon />,
    color: '#4caf50',
    subtypes: [
      { id: 'profit_loss', name: 'P&L отчет', description: 'Прибыли и убытки' },
      { id: 'cash_flow', name: 'Денежные потоки', description: 'Движение денежных средств' },
      { id: 'budget_variance', name: 'Отклонения бюджета', description: 'Анализ отклонений от плана' },
      { id: 'roi_analysis', name: 'ROI анализ', description: 'Возврат инвестиций' },
      { id: 'cost_breakdown', name: 'Структура затрат', description: 'Детализация расходов' },
      { id: 'revenue_forecast', name: 'Прогноз доходов', description: 'Планирование выручки' },
      { id: 'margin_analysis', name: 'Анализ маржинальности', description: 'Рентабельность по проектам' },
      { id: 'tax_reporting', name: 'Налоговая отчетность', description: 'Подготовка налоговых документов' },
    ]
  },
  {
    id: 'project',
    name: 'Проектная аналитика',
    description: 'Глубокий анализ проектов и производительности',
    icon: <ConstructionIcon />,
    color: '#2196f3',
    subtypes: [
      { id: 'project_dashboard', name: 'Дашборд проектов', description: 'Обзор всех проектов' },
      { id: 'gantt_analysis', name: 'Анализ Ганта', description: 'Временные рамки и зависимости' },
      { id: 'resource_utilization', name: 'Загрузка ресурсов', description: 'Эффективность использования' },
      { id: 'milestone_tracking', name: 'Отслеживание вех', description: 'Контроль ключевых событий' },
      { id: 'risk_assessment', name: 'Оценка рисков', description: 'Анализ проектных рисков' },
      { id: 'quality_metrics', name: 'Метрики качества', description: 'Показатели качества работ' },
      { id: 'change_requests', name: 'Изменения в проекте', description: 'Отслеживание изменений' },
      { id: 'stakeholder_reports', name: 'Отчеты для заказчиков', description: 'Презентационные материалы' },
    ]
  },
  {
    id: 'hr',
    name: 'HR Аналитика',
    description: 'Управление персоналом и эффективность',
    icon: <PeopleIcon />,
    color: '#ff9800',
    subtypes: [
      { id: 'timesheet_analysis', name: 'Анализ табелей', description: 'Рабочее время и производительность' },
      { id: 'payroll_breakdown', name: 'Фонд оплаты труда', description: 'Структура зарплат' },
      { id: 'performance_review', name: 'Оценка персонала', description: 'KPI и эффективность' },
      { id: 'training_analytics', name: 'Аналитика обучения', description: 'Программы развития' },
      { id: 'absence_tracking', name: 'Отсутствия', description: 'Отпуска и больничные' },
      { id: 'overtime_analysis', name: 'Сверхурочные', description: 'Анализ переработок' },
      { id: 'skill_matrix', name: 'Матрица навыков', description: 'Компетенции сотрудников' },
      { id: 'turnover_analysis', name: 'Текучесть кадров', description: 'Удержание персонала' },
    ]
  },
  {
    id: 'inventory',
    name: 'Складская аналитика',
    description: 'Управление запасами и логистика',
    icon: <InventoryIcon />,
    color: '#9c27b0',
    subtypes: [
      { id: 'stock_analysis', name: 'Анализ остатков', description: 'Движение товарно-материальных ценностей' },
      { id: 'abc_analysis', name: 'ABC анализ', description: 'Классификация материалов' },
      { id: 'supplier_performance', name: 'Оценка поставщиков', description: 'Качество поставок' },
      { id: 'procurement_analytics', name: 'Аналитика закупок', description: 'Эффективность закупок' },
      { id: 'waste_analysis', name: 'Анализ отходов', description: 'Потери и списания' },
      { id: 'inventory_turnover', name: 'Оборачиваемость', description: 'Скорость оборота запасов' },
      { id: 'demand_forecast', name: 'Прогноз потребности', description: 'Планирование закупок' },
      { id: 'cost_optimization', name: 'Оптимизация затрат', description: 'Снижение расходов на склад' },
    ]
  },
  {
    id: 'operations',
    name: 'Операционная аналитика',
    description: 'Производственные процессы и эффективность',
    icon: <EngineeringIcon />,
    color: '#607d8b',
    subtypes: [
      { id: 'productivity_metrics', name: 'Метрики производительности', description: 'KPI операций' },
      { id: 'equipment_efficiency', name: 'Эффективность оборудования', description: 'OEE анализ' },
      { id: 'downtime_analysis', name: 'Анализ простоев', description: 'Причины остановок' },
      { id: 'capacity_planning', name: 'Планирование мощностей', description: 'Загрузка производства' },
      { id: 'workflow_optimization', name: 'Оптимизация процессов', description: 'Улучшение workflow' },
      { id: 'cycle_time_analysis', name: 'Анализ времени цикла', description: 'Скорость выполнения' },
      { id: 'bottleneck_identification', name: 'Узкие места', description: 'Поиск ограничений' },
      { id: 'lean_metrics', name: 'Lean метрики', description: 'Бережливое производство' },
    ]
  },
  {
    id: 'safety',
    name: 'Безопасность и соответствие',
    description: 'Охрана труда и регулятивное соответствие',
    icon: <SecurityIcon />,
    color: '#f44336',
    subtypes: [
      { id: 'incident_analysis', name: 'Анализ инцидентов', description: 'Безопасность на объектах' },
      { id: 'compliance_tracking', name: 'Соответствие требованиям', description: 'Регулятивные нормы' },
      { id: 'training_compliance', name: 'Обучение по ТБ', description: 'Подготовка персонала' },
      { id: 'audit_reports', name: 'Аудиторские отчеты', description: 'Проверки соответствия' },
      { id: 'environmental_impact', name: 'Экологическое воздействие', description: 'Влияние на окружающую среду' },
      { id: 'risk_register', name: 'Реестр рисков', description: 'Управление рисками' },
      { id: 'certification_tracking', name: 'Отслеживание сертификатов', description: 'Срок действия документов' },
      { id: 'emergency_preparedness', name: 'Готовность к ЧС', description: 'Планы реагирования' },
    ]
  },
  {
    id: 'client',
    name: 'Клиентская аналитика',
    description: 'Анализ клиентов и удовлетворенности',
    icon: <BusinessIcon />,
    color: '#795548',
    subtypes: [
      { id: 'client_satisfaction', name: 'Удовлетворенность клиентов', description: 'Опросы и NPS' },
      { id: 'client_profitability', name: 'Прибыльность клиентов', description: 'CLV анализ' },
      { id: 'project_feedback', name: 'Обратная связь по проектам', description: 'Качество работ' },
      { id: 'communication_tracking', name: 'Отслеживание коммуникаций', description: 'История взаимодействий' },
      { id: 'contract_analysis', name: 'Анализ контрактов', description: 'Условия и выполнение' },
      { id: 'change_order_impact', name: 'Влияние изменений', description: 'Анализ доп. работ' },
      { id: 'retention_analysis', name: 'Удержание клиентов', description: 'Лояльность и повторные заказы' },
      { id: 'market_share', name: 'Доля рынка', description: 'Позиционирование' },
    ]
  },
  {
    id: 'predictive',
    name: 'Предиктивная аналитика',
    description: 'Машинное обучение и прогнозирование',
    icon: <InsightsIcon />,
    color: '#3f51b5',
    subtypes: [
      { id: 'demand_forecasting', name: 'Прогноз спроса', description: 'ML модели предсказания' },
      { id: 'maintenance_prediction', name: 'Предиктивное ТО', description: 'Прогноз поломок' },
      { id: 'cost_prediction', name: 'Прогноз затрат', description: 'Планирование бюджета' },
      { id: 'timeline_prediction', name: 'Прогноз сроков', description: 'Время завершения проектов' },
      { id: 'quality_prediction', name: 'Прогноз качества', description: 'Предотвращение дефектов' },
      { id: 'resource_optimization', name: 'Оптимизация ресурсов', description: 'AI планирование' },
      { id: 'anomaly_detection', name: 'Обнаружение аномалий', description: 'Выявление отклонений' },
      { id: 'trend_analysis', name: 'Анализ трендов', description: 'Долгосрочные тенденции' },
    ]
  }
];

// Моковые данные для графиков
const mockChartData = {
  financial: [
    { month: 'Янв', revenue: 2400000, expenses: 1800000, profit: 600000 },
    { month: 'Фев', revenue: 1398000, expenses: 1200000, profit: 198000 },
    { month: 'Мар', revenue: 9800000, expenses: 2800000, profit: 7000000 },
    { month: 'Апр', revenue: 3908000, expenses: 2400000, profit: 1508000 },
    { month: 'Май', revenue: 4800000, expenses: 3200000, profit: 1600000 },
    { month: 'Июн', revenue: 3800000, expenses: 2900000, profit: 900000 },
  ],
  projects: [
    { name: 'Завершено', value: 25, color: '#4caf50' },
    { name: 'В работе', value: 35, color: '#2196f3' },
    { name: 'Планирование', value: 20, color: '#ff9800' },
    { name: 'Приостановлено', value: 10, color: '#f44336' },
    { name: 'Отменено', value: 10, color: '#9e9e9e' },
  ],
  efficiency: [
    { department: 'Строительство', planned: 100, actual: 120, efficiency: 120 },
    { department: 'Отделка', planned: 80, actual: 85, efficiency: 106 },
    { department: 'Инженерия', planned: 60, actual: 55, efficiency: 92 },
    { department: 'Логистика', planned: 40, actual: 45, efficiency: 113 },
  ],
  timeline: [
    { date: '2024-01', projects: 5, completed: 3, delayed: 1, onTime: 4 },
    { date: '2024-02', projects: 7, completed: 5, delayed: 2, onTime: 5 },
    { date: '2024-03', projects: 8, completed: 6, delayed: 1, onTime: 7 },
    { date: '2024-04', projects: 10, completed: 8, delayed: 2, onTime: 8 },
    { date: '2024-05', projects: 12, completed: 9, delayed: 3, onTime: 9 },
    { date: '2024-06', projects: 15, completed: 12, delayed: 2, onTime: 13 },
  ]
};

// Шаблоны дашбордов
const dashboardTemplates = [
  {
    id: 'executive',
    name: 'Исполнительный дашборд',
    description: 'Ключевые показатели для руководства',
    widgets: ['kpi-summary', 'revenue-chart', 'project-status', 'alerts'],
    target: 'executives'
  },
  {
    id: 'project-manager',
    name: 'Дашборд проект-менеджера',
    description: 'Управление проектами и ресурсами',
    widgets: ['project-timeline', 'resource-allocation', 'milestone-tracker', 'team-performance'],
    target: 'managers'
  },
  {
    id: 'financial',
    name: 'Финансовый дашборд',
    description: 'Финансовые показатели и аналитика',
    widgets: ['cash-flow', 'budget-variance', 'profitability', 'cost-breakdown'],
    target: 'accountants'
  },
  {
    id: 'operational',
    name: 'Операционный дашборд',
    description: 'Производственные метрики',
    widgets: ['productivity', 'equipment-status', 'quality-metrics', 'safety-indicators'],
    target: 'operations'
  }
];

const ReportsPage: React.FC = () => {
  // State
  const [selectedTab, setSelectedTab] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [dashboardMode, setDashboardMode] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState('executive');
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);
  const [analyticsDrawerOpen, setAnalyticsDrawerOpen] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { control, handleSubmit, reset, formState, watch } = useForm<Report>();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderAdvancedDashboard = () => (
    <Box>
      {/* Заголовок с контролами */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Интерактивный дашборд
          </Typography>
          <Chip 
            label={liveMode ? 'LIVE' : 'СТАТИЧНЫЙ'} 
            color={liveMode ? 'success' : 'default'}
            variant={liveMode ? 'filled' : 'outlined'}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label="Авто-обновление"
          />
          
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setAnalyticsDrawerOpen(true)}
            size="small"
          >
            Настройки
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => toast('Обновление данных...')}
            size="small"
          >
            Обновить
          </Button>
        </Box>
      </Box>

      {/* Выбор шаблона дашборда */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Шаблоны дашбордов
          </Typography>
          <Grid container spacing={2}>
            {dashboardTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={3} key={template.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedDashboard === template.id ? '2px solid' : '1px solid',
                    borderColor: selectedDashboard === template.id ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setSelectedDashboard(template.id)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <DashboardIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {template.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* KPI карточки */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ₽15.2M
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Выручка (MTD)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                      +12.5%
                    </Typography>
                  </Box>
                </Box>
                <MoneyIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    42
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Активных проектов
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={78} 
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
                <ConstructionIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    156
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Сотрудников
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Загрузка: 89%
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    3
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Критичные проблемы
                  </Typography>
                  <Chip label="Требуют внимания" size="small" color="error" sx={{ mt: 1 }} />
                </Box>
                <SecurityIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Интерактивные графики */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Финансовые показатели</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined">6M</Button>
                  <Button size="small" variant="contained">1Y</Button>
                  <Button size="small" variant="outlined">3Y</Button>
                </Box>
              </Box>
              
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={mockChartData.financial}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => `₽${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#4caf50" name="Выручка" />
                  <Bar dataKey="expenses" fill="#f44336" name="Расходы" />
                  <Line type="monotone" dataKey="profit" stroke="#2196f3" strokeWidth={3} name="Прибыль" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Статус проектов</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockChartData.projects}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockChartData.projects.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Эффективность по отделам */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Эффективность отделов</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockChartData.efficiency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="planned" fill="#e0e0e0" name="План" />
                  <Bar dataKey="actual" fill="#2196f3" name="Факт" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Временная динамика</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={mockChartData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="completed" stackId="1" stroke="#4caf50" fill="#4caf50" name="Завершено" />
                  <Area type="monotone" dataKey="delayed" stackId="1" stroke="#f44336" fill="#f44336" name="Задержки" />
                  <Area type="monotone" dataKey="onTime" stackId="2" stroke="#2196f3" fill="#2196f3" name="В срок" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Дополнительные метрики */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Топ исполнители</Typography>
              <List dense>
                {[
                  { name: 'Иван Иванов', metric: '127%', trend: 'up' },
                  { name: 'Петр Петров', metric: '118%', trend: 'up' },
                  { name: 'Анна Сидорова', metric: '112%', trend: 'stable' },
                  { name: 'Михаил Козлов', metric: '98%', trend: 'down' },
                ].map((performer, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                        {performer.name.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={performer.name}
                      secondary={`Эффективность: ${performer.metric}`}
                    />
                    <TrendingUpIcon 
                      fontSize="small" 
                      color={performer.trend === 'up' ? 'success' : performer.trend === 'down' ? 'error' : 'disabled'} 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Критичные задачи</Typography>
              <List dense>
                {[
                  { task: 'Заливка фундамента Объект #12', deadline: '2 дня', priority: 'high' },
                  { task: 'Поставка материалов Проект "Север"', deadline: '1 день', priority: 'critical' },
                  { task: 'Техосмотр крана №3', deadline: '3 дня', priority: 'medium' },
                  { task: 'Согласование проекта "Центр"', deadline: '5 дней', priority: 'low' },
                ].map((task, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={task.task}
                      secondary={`Срок: ${task.deadline}`}
                    />
                    <Chip 
                      size="small" 
                      color={
                        task.priority === 'critical' ? 'error' :
                        task.priority === 'high' ? 'warning' :
                        task.priority === 'medium' ? 'info' : 'default'
                      }
                      label={task.priority}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Уведомления системы</Typography>
              <List dense>
                {[
                  { message: 'Низкий остаток цемента на складе', type: 'warning', time: '2 мин назад' },
                  { message: 'Превышен бюджет проекта "Юг"', type: 'error', time: '15 мин назад' },
                  { message: 'Завершен проект "Восток"', type: 'success', time: '1 час назад' },
                  { message: 'Новая заявка от клиента', type: 'info', time: '2 часа назад' },
                ].map((notification, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {notification.type === 'warning' && <InventoryIcon color="warning" />}
                      {notification.type === 'error' && <MoneyIcon color="error" />}
                      {notification.type === 'success' && <ConstructionIcon color="success" />}
                      {notification.type === 'info' && <BusinessIcon color="info" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={notification.message}
                      secondary={notification.time}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderReportBuilder = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Конструктор отчетов
      </Typography>
      
      <Stepper orientation="vertical">
        <Step active>
          <StepLabel>Выбор типа отчета</StepLabel>
          <StepContent>
            <Grid container spacing={2}>
              {advancedReportTypes.slice(0, 4).map((type) => (
                <Grid item xs={12} sm={6} md={3} key={type.id}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ color: type.color, mb: 1 }}>
                        {type.icon}
                      </Box>
                      <Typography variant="subtitle2">{type.name}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" sx={{ mr: 1 }}>
                Продолжить
              </Button>
            </Box>
          </StepContent>
        </Step>
        
        <Step>
          <StepLabel>Настройка параметров</StepLabel>
          <StepContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Название отчета"
                  defaultValue="Финансовый отчет за период"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Период</InputLabel>
                  <Select defaultValue="month">
                    <MenuItem value="week">Неделя</MenuItem>
                    <MenuItem value="month">Месяц</MenuItem>
                    <MenuItem value="quarter">Квартал</MenuItem>
                    <MenuItem value="year">Год</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" sx={{ mr: 1 }}>
                Продолжить
              </Button>
              <Button>Назад</Button>
            </Box>
          </StepContent>
        </Step>
        
        <Step>
          <StepLabel>Выбор данных</StepLabel>
          <StepContent>
            <Typography>Настройка источников данных и метрик</Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" sx={{ mr: 1 }}>
                Создать отчет
              </Button>
              <Button>Назад</Button>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
    </Box>
  );

  const renderAdvancedAnalytics = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Расширенная аналитика
      </Typography>
      
      <Grid container spacing={3}>
        {advancedReportTypes.map((type) => (
          <Grid item xs={12} md={6} lg={4} key={type.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: type.color, mr: 2 }}>
                    {type.icon}
                  </Box>
                  <Typography variant="h6">{type.name}</Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {type.description}
                </Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Доступные отчеты ({type.subtypes.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {type.subtypes.map((subtype) => (
                        <ListItemButton key={subtype.id}>
                          <ListItemText 
                            primary={subtype.name}
                            secondary={subtype.description}
                          />
                          <IconButton size="small">
                            <PlayIcon />
                          </IconButton>
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderPredictiveAnalytics = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Предиктивная аналитика и ML
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Используются алгоритмы машинного обучения для прогнозирования и оптимизации
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Прогноз выручки
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h4" color="success.main">
                  +18%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  на следующий квартал
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={85} 
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                Точность модели: 85%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Оптимизация ресурсов
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Потенциальная экономия:
                </Typography>
                <Typography variant="h4" color="primary.main">
                  ₽2.3M
                </Typography>
              </Box>
              <Button variant="outlined" startIcon={<CalculateIcon />}>
                Показать рекомендации
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Отчеты и расширенная аналитика
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={liveMode}
                onChange={(e) => setLiveMode(e.target.checked)}
              />
            }
            label="Live режим"
          />
          
          <Button
            variant="outlined"
            startIcon={<BuildIcon />}
            onClick={() => setReportBuilderOpen(true)}
          >
            Конструктор
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Создать отчет
          </Button>
        </Box>
      </Box>

      {/* Расширенные вкладки */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Дашборд" icon={<DashboardIcon />} />
            <Tab label="Конструктор" icon={<BuildIcon />} />
            <Tab label="Аналитика" icon={<AnalyticsIcon />} />
            <Tab label="Предиктивная" icon={<InsightsIcon />} />
            <Tab label="Шаблоны" icon={<ReportIcon />} />
            <Tab label="Список отчетов" icon={<TableIcon />} />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          {renderAdvancedDashboard()}
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          {renderReportBuilder()}
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          {renderAdvancedAnalytics()}
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          {renderPredictiveAnalytics()}
        </TabPanel>

        <TabPanel value={selectedTab} index={4}>
          <Typography variant="h6">Шаблоны отчетов</Typography>
          {/* Существующий код шаблонов */}
        </TabPanel>

        <TabPanel value={selectedTab} index={5}>
          <Typography variant="h6">Список всех отчетов</Typography>
          {/* Существующий код списка отчетов */}
        </TabPanel>
      </Card>

      {/* SpeedDial для быстрых действий */}
      <SpeedDial
        ariaLabel="Быстрые действия"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<DashboardIcon />}
          tooltipTitle="Новый дашборд"
          onClick={() => toast('Создание дашборда')}
        />
        <SpeedDialAction
          icon={<ChartIcon />}
          tooltipTitle="Экспресс-анализ"
          onClick={() => toast('Экспресс-анализ')}
        />
        <SpeedDialAction
          icon={<ShareIcon />}
          tooltipTitle="Поделиться"
          onClick={() => toast('Функция поделиться')}
        />
        <SpeedDialAction
          icon={<PrintIcon />}
          tooltipTitle="Печать"
          onClick={() => toast('Печать отчета')}
        />
      </SpeedDial>

      {/* Drawer с настройками аналитики */}
      <Drawer
        anchor="right"
        open={analyticsDrawerOpen}
        onClose={() => setAnalyticsDrawerOpen(false)}
      >
        <Box sx={{ width: 350, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Настройки аналитики
          </Typography>
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Автоматическое обновление"
            sx={{ mb: 2, display: 'block' }}
          />
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Уведомления о аномалиях"
            sx={{ mb: 2, display: 'block' }}
          />
          
          <FormControlLabel
            control={<Switch />}
            label="Экспорт в реальном времени"
            sx={{ mb: 2, display: 'block' }}
          />
          
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Интервал обновления
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Select defaultValue={30}>
              <MenuItem value={10}>10 секунд</MenuItem>
              <MenuItem value={30}>30 секунд</MenuItem>
              <MenuItem value={60}>1 минута</MenuItem>
              <MenuItem value={300}>5 минут</MenuItem>
            </Select>
          </FormControl>
          
          <Button variant="contained" fullWidth>
            Сохранить настройки
          </Button>
        </Box>
      </Drawer>

      {/* Диалог конструктора отчетов */}
      <Dialog
        open={reportBuilderOpen}
        onClose={() => setReportBuilderOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Конструктор отчетов
        </DialogTitle>
        <DialogContent>
          {renderReportBuilder()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportBuilderOpen(false)}>
            Отмена
          </Button>
          <Button variant="contained">
            Создать отчет
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsPage;