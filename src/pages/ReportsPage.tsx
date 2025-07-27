import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Badge,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tabs,
  Tab,
  AccordionSummary,
  AccordionDetails,
  Accordion,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as ReportIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as ChartIcon,
  PieChart as PieChartIcon,
  AttachMoney as MoneyIcon,
  Build as ProjectIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Report, Template } from '../types';

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

// Типы отчетов
const reportTypes = [
  {
    id: 'financial',
    name: 'Финансовые отчеты',
    description: 'Доходы, расходы, прибыль, бюджеты',
    icon: <MoneyIcon />,
    color: '#4caf50',
    subtypes: [
      { id: 'profit_loss', name: 'Отчет о прибылях и убытках' },
      { id: 'budget_analysis', name: 'Анализ бюджета' },
      { id: 'cash_flow', name: 'Отчет о движении денежных средств' },
      { id: 'invoice_report', name: 'Отчет по счетам' },
    ]
  },
  {
    id: 'project',
    name: 'Отчеты по проектам',
    description: 'Прогресс, задачи, ресурсы',
    icon: <ProjectIcon />,
    color: '#2196f3',
    subtypes: [
      { id: 'project_progress', name: 'Прогресс проектов' },
      { id: 'project_timeline', name: 'Временные рамки проектов' },
      { id: 'project_costs', name: 'Затраты по проектам' },
      { id: 'project_quality', name: 'Качество работ' },
    ]
  },
  {
    id: 'hr',
    name: 'Кадровые отчеты',
    description: 'Сотрудники, время, зарплата',
    icon: <PeopleIcon />,
    color: '#ff9800',
    subtypes: [
      { id: 'attendance', name: 'Табель учета рабочего времени' },
      { id: 'payroll', name: 'Расчет заработной платы' },
      { id: 'performance', name: 'Оценка производительности' },
      { id: 'training', name: 'Отчет по обучению' },
    ]
  },
  {
    id: 'inventory',
    name: 'Складские отчеты',
    description: 'Материалы, инструменты, поставки',
    icon: <InventoryIcon />,
    color: '#9c27b0',
    subtypes: [
      { id: 'stock_levels', name: 'Остатки на складе' },
      { id: 'material_usage', name: 'Использование материалов' },
      { id: 'supplier_report', name: 'Отчет по поставщикам' },
      { id: 'tool_maintenance', name: 'Техобслуживание инструментов' },
    ]
  }
];

// Моковые данные отчетов
const mockReports: Report[] = [
  {
    id: '1',
    name: 'Ежемесячный финансовый отчет',
    type: 'financial',
    description: 'Сводный отчет по доходам и расходам за месяц',
    parameters: [
      { name: 'period', type: 'date', value: 'current_month', required: true },
      { name: 'include_projects', type: 'boolean', value: true, required: false }
    ],
    schedule: {
      frequency: 'monthly',
      dayOfMonth: 1,
      time: '09:00',
      timezone: 'Europe/Moscow'
    },
    recipients: ['admin@company.com', 'accountant@company.com'],
    format: 'pdf',
    isActive: true,
    lastGenerated: new Date('2024-01-01'),
    createdBy: '1',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Отчет по прогрессу проектов',
    type: 'project',
    description: 'Состояние всех активных проектов',
    parameters: [
      { name: 'status', type: 'select', value: 'active', options: ['all', 'active', 'completed'], required: true },
      { name: 'date_range', type: 'date', value: 'current_quarter', required: true }
    ],
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 1,
      time: '10:00',
      timezone: 'Europe/Moscow'
    },
    recipients: ['manager@company.com'],
    format: 'excel',
    isActive: true,
    lastGenerated: new Date('2024-01-15'),
    createdBy: '2',
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2024-01-15'),
  }
];

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const { control, handleSubmit, reset, watch } = useForm<Report>();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateReport = async (data: Report) => {
    try {
      const newReport: Report = {
        ...data,
        id: Date.now().toString(),
        isActive: true,
        createdBy: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setReports(prev => [...prev, newReport]);
      setOpenReportDialog(false);
      reset();
      toast.success('Отчет успешно создан');
    } catch (error) {
      toast.error('Ошибка при создании отчета');
    }
  };

  const handleGenerateReport = async (reportId: string, format: 'pdf' | 'excel' = 'pdf') => {
    setGeneratingReport(reportId);
    try {
      // Симуляция генерации отчета
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Обновляем дату последней генерации
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? { ...report, lastGenerated: new Date(), format }
            : report
        )
      );
      
      toast.success(`Отчет успешно сгенерирован в формате ${format.toUpperCase()}`);
      
      // Симуляция скачивания файла
      const link = document.createElement('a');
      link.href = '#';
      link.download = `report_${reportId}.${format}`;
      link.click();
      
    } catch (error) {
      toast.error('Ошибка при генерации отчета');
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отчет?')) {
      try {
        setReports(prev => prev.filter(r => r.id !== reportId));
        toast.success('Отчет удален');
      } catch (error) {
        toast.error('Ошибка при удалении отчета');
      }
    }
  };

  const openReportDialog = (report?: Report) => {
    if (report) {
      setSelectedReport(report);
      reset(report);
    } else {
      setSelectedReport(null);
      reset();
    }
    setOpenReportDialog(true);
  };

  const getReportTypeInfo = (type: string) => {
    return reportTypes.find(rt => rt.id === type) || reportTypes[0];
  };

  const getReportsByType = (type: string) => {
    return reports.filter(report => report.type === type);
  };

  const renderDashboard = () => {
    const stats = {
      totalReports: reports.length,
      activeReports: reports.filter(r => r.isActive).length,
      scheduledReports: reports.filter(r => r.schedule).length,
      generatedToday: reports.filter(r => 
        r.lastGenerated && 
        format(r.lastGenerated, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      ).length,
    };

    return (
      <Box>
        {/* Статистика */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ReportIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.totalReports}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего отчетов
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {stats.activeReports}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Активных
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {stats.scheduledReports}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  По расписанию
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <DownloadIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {stats.generatedToday}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Сегодня
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Типы отчетов */}
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Категории отчетов
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {reportTypes.map((type) => {
            const typeReports = getReportsByType(type.id);
            return (
              <Grid item xs={12} sm={6} md={3} key={type.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      transform: 'translateY(-2px)',
                      boxShadow: 4 
                    },
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    setSelectedReportType(type.id);
                    setActiveTab(1);
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box 
                        sx={{ 
                          bgcolor: type.color, 
                          color: 'white', 
                          p: 1, 
                          borderRadius: 1,
                          mr: 2 
                        }}
                      >
                        {type.icon}
                      </Box>
                      <Badge badgeContent={typeReports.length} color="primary">
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {type.name}
                        </Typography>
                      </Badge>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {type.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {type.subtypes.slice(0, 2).map((subtype) => (
                        <Chip 
                          key={subtype.id}
                          label={subtype.name} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                      {type.subtypes.length > 2 && (
                        <Chip 
                          label={`+${type.subtypes.length - 2}`} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Последние отчеты */}
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Последние отчеты
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Последняя генерация</TableCell>
                <TableCell>Формат</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.slice(0, 5).map((report) => {
                const typeInfo = getReportTypeInfo(report.type);
                return (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: typeInfo.color }}>
                          {typeInfo.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {report.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={typeInfo.name} 
                        size="small" 
                        sx={{ bgcolor: typeInfo.color, color: 'white' }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      {report.lastGenerated ? (
                        <Typography variant="body2">
                          {format(report.lastGenerated, 'dd.MM.yyyy HH:mm', { locale: ru })}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Не генерировался
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={report.format.toUpperCase()} 
                        size="small" 
                        variant="outlined"
                        icon={report.format === 'pdf' ? <PdfIcon /> : <ExcelIcon />}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={report.isActive ? 'Активен' : 'Неактивен'} 
                        color={report.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Сгенерировать PDF">
                          <IconButton 
                            size="small"
                            onClick={() => handleGenerateReport(report.id, 'pdf')}
                            disabled={generatingReport === report.id}
                          >
                            {generatingReport === report.id ? (
                              <LinearProgress size={20} />
                            ) : (
                              <PdfIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Сгенерировать Excel">
                          <IconButton 
                            size="small"
                            onClick={() => handleGenerateReport(report.id, 'excel')}
                            disabled={generatingReport === report.id}
                          >
                            <ExcelIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Редактировать">
                          <IconButton 
                            size="small"
                            onClick={() => openReportDialog(report)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderReportsList = () => {
    const filteredReports = selectedReportType ? 
      getReportsByType(selectedReportType) : reports;

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            {selectedReportType ? 
              getReportTypeInfo(selectedReportType).name : 
              'Все отчеты'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openReportDialog()}
          >
            Создать отчет
          </Button>
        </Box>

        {selectedReportType && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              {getReportTypeInfo(selectedReportType).description}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {filteredReports.map((report) => {
            const typeInfo = getReportTypeInfo(report.type);
            return (
              <Grid item xs={12} md={6} lg={4} key={report.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: typeInfo.color }}>
                          {typeInfo.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {report.name}
                        </Typography>
                      </Box>
                      <Chip 
                        label={report.isActive ? 'Активен' : 'Неактивен'} 
                        color={report.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {report.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Формат: 
                      </Typography>
                      <Chip 
                        label={report.format.toUpperCase()} 
                        size="small" 
                        variant="outlined"
                        icon={report.format === 'pdf' ? <PdfIcon /> : <ExcelIcon />}
                        sx={{ ml: 1 }}
                      />
                    </Box>

                    {report.schedule && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ScheduleIcon sx={{ fontSize: 14 }} />
                          Расписание: {report.schedule.frequency}
                        </Typography>
                      </Box>
                    )}

                    {report.lastGenerated && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Последняя генерация: {format(report.lastGenerated, 'dd.MM.yyyy HH:mm', { locale: ru })}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Сгенерировать PDF">
                          <IconButton 
                            size="small"
                            onClick={() => handleGenerateReport(report.id, 'pdf')}
                            disabled={generatingReport === report.id}
                          >
                            <PdfIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Сгенерировать Excel">
                          <IconButton 
                            size="small"
                            onClick={() => handleGenerateReport(report.id, 'excel')}
                            disabled={generatingReport === report.id}
                          >
                            <ExcelIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Просмотр">
                          <IconButton 
                            size="small"
                            onClick={() => toast.info('Функция просмотра будет добавлена')}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Редактировать">
                          <IconButton 
                            size="small"
                            onClick={() => openReportDialog(report)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Удалить">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {filteredReports.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ReportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Нет отчетов для отображения
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Создайте первый отчет для начала работы
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openReportDialog()}
            >
              Создать отчет
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Отчеты и аналитика
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ChartIcon />}
            onClick={() => toast.info('Конструктор отчетов будет добавлен')}
          >
            Конструктор
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openReportDialog()}
          >
            Создать отчет
          </Button>
        </Box>
      </Box>

      {/* Вкладки */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="reports tabs">
            <Tab label="Панель управления" />
            <Tab label="Список отчетов" />
            <Tab label="Шаблоны" />
            <Tab label="Аналитика" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {renderDashboard()}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {renderReportsList()}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ReportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Шаблоны отчетов
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Функция управления шаблонами будет добавлена в ближайшее время
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Расширенная аналитика
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Интерактивные графики и детальная аналитика будут добавлены в ближайшее время
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Диалог создания/редактирования отчета */}
      <Dialog 
        open={openReportDialog} 
        onClose={() => setOpenReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(selectedReport ? () => {} : handleCreateReport)}>
          <DialogTitle>
            {selectedReport ? 'Редактировать отчет' : 'Создать новый отчет'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Название отчета обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Название отчета"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="type"
                  control={control}
                  defaultValue="financial"
                  rules={{ required: 'Выберите тип отчета' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Тип отчета</InputLabel>
                      <Select {...field} label="Тип отчета">
                        {reportTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {type.icon}
                              {type.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="format"
                  control={control}
                  defaultValue="pdf"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Формат</InputLabel>
                      <Select {...field} label="Формат">
                        <MenuItem value="pdf">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PdfIcon />
                            PDF
                          </Box>
                        </MenuItem>
                        <MenuItem value="excel">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ExcelIcon />
                            Excel
                          </Box>
                        </MenuItem>
                        <MenuItem value="csv">CSV</MenuItem>
                        <MenuItem value="json">JSON</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Описание"
                      multiline
                      rows={3}
                      placeholder="Краткое описание отчета"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Автоматическая генерация
                </Typography>
                
                <Controller
                  name="schedule.frequency"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Частота</InputLabel>
                      <Select {...field} label="Частота">
                        <MenuItem value="">Без расписания</MenuItem>
                        <MenuItem value="daily">Ежедневно</MenuItem>
                        <MenuItem value="weekly">Еженедельно</MenuItem>
                        <MenuItem value="monthly">Ежемесячно</MenuItem>
                        <MenuItem value="quarterly">Ежеквартально</MenuItem>
                        <MenuItem value="yearly">Ежегодно</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
                
                {watch('schedule.frequency') && (
                  <Controller
                    name="schedule.time"
                    control={control}
                    defaultValue="09:00"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Время генерации"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="recipients"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Получатели (email)"
                      placeholder="user1@company.com, user2@company.com"
                      helperText="Введите email адреса через запятую"
                      value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                      onChange={(e) => {
                        const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                        field.onChange(emails);
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOpenReportDialog(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="contained">
              {selectedReport ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ReportsPage;