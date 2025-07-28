import React, { useState, useEffect } from 'react';
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
  Alert,
  Switch,
  FormControlLabel,
  Badge,
  Autocomplete,
  DatePicker,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Business as ProjectIcon,
  Assignment as TaskIcon,
  GetApp as ExportIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Timer as TimerIcon,
  DateRange as CalendarIcon,
  BarChart as ChartIcon,
  Assignment as ReportIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isToday, addDays, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TimeEntry, User, Project, ProjectTask, WorkType } from '../types';

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
      id={`timesheet-tabpanel-${index}`}
      aria-labelledby={`timesheet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Моковые данные
const mockEmployees: User[] = [
  { id: '1', name: 'Иван Иванов', email: 'ivan@example.com', role: 'worker', department: 'Строительство', position: 'Каменщик' },
  { id: '2', name: 'Петр Петров', email: 'petr@example.com', role: 'foreman', department: 'Строительство', position: 'Мастер' },
  { id: '3', name: 'Сидор Сидоров', email: 'sidor@example.com', role: 'worker', department: 'Отделка', position: 'Штукатур' },
  { id: '4', name: 'Мария Марьева', email: 'maria@example.com', role: 'engineer', department: 'Проектирование', position: 'Инженер' },
];

const mockProjects: Project[] = [
  { id: '1', name: 'Жилой комплекс "Север"', status: 'in_progress' },
  { id: '2', name: 'Торговый центр "Юг"', status: 'in_progress' },
  { id: '3', name: 'Офисное здание "Центр"', status: 'planning' },
];

const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    userId: '1',
    projectId: '1',
    date: new Date(),
    startTime: new Date(new Date().setHours(8, 0)),
    endTime: new Date(new Date().setHours(17, 0)),
    totalHours: 8,
    breakHours: 1,
    overtimeHours: 0,
    description: 'Кладка стен',
    workType: 'walls',
    isApproved: false,
    location: 'Объект №1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: '2',
    projectId: '1',
    date: new Date(),
    startTime: new Date(new Date().setHours(8, 0)),
    endTime: new Date(new Date().setHours(18, 0)),
    totalHours: 9,
    breakHours: 1,
    overtimeHours: 1,
    description: 'Контроль качества работ',
    workType: 'inspection',
    isApproved: true,
    approvedBy: 'admin',
    location: 'Объект №1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const TimesheetPage: React.FC = () => {
  // State
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries);
  const [activeTimers, setActiveTimers] = useState<Map<string, Date>>(new Map());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [approvalMode, setApprovalMode] = useState(false);

  const { control, handleSubmit, reset, formState, watch } = useForm<TimeEntry>();

  // Вычисленные значения
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedWeek, { weekStartsOn: 1 }),
    end: endOfWeek(selectedWeek, { weekStartsOn: 1 }),
  });

  const filteredEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    
    let matches = entryDate >= weekStart && entryDate <= weekEnd;
    
    if (selectedEmployee) {
      matches = matches && entry.userId === selectedEmployee;
    }
    
    return matches;
  });

  const weeklyStats = {
    totalHours: filteredEntries.reduce((sum, entry) => sum + entry.totalHours, 0),
    overtimeHours: filteredEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0),
    workingDays: new Set(filteredEntries.map(entry => format(entry.date, 'yyyy-MM-dd'))).size,
    pendingApprovals: filteredEntries.filter(entry => !entry.isApproved).length,
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleStartTimer = (userId: string) => {
    setActiveTimers(prev => new Map(prev.set(userId, new Date())));
    toast.success('Таймер запущен');
  };

  const handleStopTimer = (userId: string) => {
    const startTime = activeTimers.get(userId);
    if (startTime) {
      const endTime = new Date();
      const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // Создаем новую запись времени
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        userId,
        date: new Date(),
        startTime,
        endTime,
        totalHours: Math.round(totalHours * 100) / 100,
        breakHours: 0,
        overtimeHours: Math.max(0, totalHours - 8),
        description: '',
        isApproved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setTimeEntries(prev => [...prev, newEntry]);
      setActiveTimers(prev => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
      
      toast.success(`Таймер остановлен. Отработано: ${totalHours.toFixed(2)} часов`);
    }
  };

  const handleCreateEntry = async (data: TimeEntry) => {
    try {
      const newEntry: TimeEntry = {
        ...data,
        id: Date.now().toString(),
        isApproved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setTimeEntries(prev => [...prev, newEntry]);
      setOpenDialog(false);
      reset();
      toast.success('Запись времени создана');
    } catch (error) {
      toast.error('Ошибка при создании записи');
    }
  };

  const handleApproveEntry = (entryId: string) => {
    setTimeEntries(prev =>
      prev.map(entry =>
        entry.id === entryId
          ? { ...entry, isApproved: true, approvedBy: 'current_user', approvedAt: new Date() }
          : entry
      )
    );
    toast.success('Запись утверждена');
  };

  const handleRejectEntry = (entryId: string) => {
    setTimeEntries(prev =>
      prev.map(entry =>
        entry.id === entryId
          ? { ...entry, isApproved: false, rejectionReason: 'Требует уточнения' }
          : entry
      )
    );
    toast.success('Запись отклонена');
  };

  const handleDeleteEntry = (entryId: string) => {
    if (window.confirm('Удалить запись времени?')) {
      setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Запись удалена');
    }
  };

  const handleTimeEntryDialog = (entry?: TimeEntry) => {
    if (entry) {
      setSelectedEntry(entry);
      reset(entry);
    } else {
      setSelectedEntry(null);
      reset({
        userId: '',
        projectId: '',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        totalHours: 8,
        breakHours: 1,
        overtimeHours: 0,
        description: '',
        workType: 'other',
        isApproved: false,
      } as any);
    }
    setOpenDialog(true);
  };

  const getEmployeeName = (userId: string) => {
    const employee = mockEmployees.find(emp => emp.id === userId);
    return employee?.name || 'Неизвестный сотрудник';
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return '-';
    const project = mockProjects.find(proj => proj.id === projectId);
    return project?.name || 'Неизвестный проект';
  };

  const getWorkTypeText = (workType?: WorkType) => {
    const types = {
      foundation: 'Фундамент',
      walls: 'Стены',
      roof: 'Крыша',
      electrical: 'Электрика',
      plumbing: 'Сантехника',
      finishing: 'Отделка',
      inspection: 'Контроль',
      other: 'Прочее',
    };
    return types[workType as keyof typeof types] || 'Прочее';
  };

  const renderTimerCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimerIcon />
          Активные таймеры
        </Typography>
        
        <Grid container spacing={2}>
          {mockEmployees.map((employee) => {
            const isActive = activeTimers.has(employee.id);
            const startTime = activeTimers.get(employee.id);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={employee.id}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: isActive ? 'success.main' : 'grey.400' }}>
                      <PersonIcon />
                    </Avatar>
                    
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {employee.name}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      {employee.position}
                    </Typography>
                    
                    {isActive && startTime && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          Начато: {format(startTime, 'HH:mm')}
                        </Typography>
                        <LinearProgress 
                          variant="indeterminate" 
                          sx={{ mt: 1, bgcolor: 'success.light' }}
                        />
                      </Box>
                    )}
                    
                    <Button
                      variant={isActive ? "outlined" : "contained"}
                      color={isActive ? "error" : "success"}
                      startIcon={isActive ? <StopIcon /> : <StartIcon />}
                      onClick={() => isActive ? handleStopTimer(employee.id) : handleStartTimer(employee.id)}
                      size="small"
                      fullWidth
                    >
                      {isActive ? 'Остановить' : 'Начать'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderWeeklyView = () => (
    <Box>
      {/* Заголовок недели */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setSelectedWeek(subDays(selectedWeek, 7))}
          >
            ← Предыдущая
          </Button>
          
          <Typography variant="h6">
            {format(weekDays[0], 'dd.MM')} - {format(weekDays[6], 'dd.MM.yyyy')}
          </Typography>
          
          <Button
            variant="outlined"
            onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
          >
            Следующая →
          </Button>
        </Box>
        
        <Autocomplete
          options={mockEmployees}
          getOptionLabel={(option) => option.name}
          value={mockEmployees.find(emp => emp.id === selectedEmployee) || null}
          onChange={(_, value) => setSelectedEmployee(value?.id || '')}
          renderInput={(params) => (
            <TextField {...params} label="Сотрудник" size="small" sx={{ minWidth: 200 }} />
          )}
        />
      </Box>

      {/* Статистика недели */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {weeklyStats.totalHours}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего часов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {weeklyStats.overtimeHours}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Сверхурочные
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CalendarIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {weeklyStats.workingDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Рабочих дней
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {weeklyStats.pendingApprovals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                На утверждении
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Таблица времени */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Сотрудник</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Проект</TableCell>
              <TableCell>Начало</TableCell>
              <TableCell>Конец</TableCell>
              <TableCell>Часов</TableCell>
              <TableCell>Сверхурочные</TableCell>
              <TableCell>Тип работ</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {getEmployeeName(entry.userId).charAt(0)}
                    </Avatar>
                    {getEmployeeName(entry.userId)}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {format(entry.date, 'dd.MM.yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(entry.date, 'EEEE', { locale: ru })}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {getProjectName(entry.projectId)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  {format(entry.startTime, 'HH:mm')}
                </TableCell>
                
                <TableCell>
                  {entry.endTime ? format(entry.endTime, 'HH:mm') : '-'}
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" />
                    {entry.totalHours}ч
                  </Box>
                </TableCell>
                
                <TableCell>
                  {entry.overtimeHours > 0 && (
                    <Chip 
                      label={`+${entry.overtimeHours}ч`} 
                      color="warning" 
                      size="small" 
                    />
                  )}
                </TableCell>
                
                <TableCell>
                  <Chip 
                    label={getWorkTypeText(entry.workType)} 
                    variant="outlined" 
                    size="small" 
                  />
                </TableCell>
                
                <TableCell>
                  <Chip 
                    label={entry.isApproved ? 'Утверждено' : 'На проверке'} 
                    color={entry.isApproved ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!entry.isApproved && approvalMode && (
                      <>
                        <Tooltip title="Утвердить">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleApproveEntry(entry.id)}
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Отклонить">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRejectEntry(entry.id)}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    
                    <Tooltip title="Редактировать">
                      <IconButton 
                        size="small"
                        onClick={() => handleTimeEntryDialog(entry)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Удалить">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredEntries.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <TimeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Нет записей времени
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Добавьте первую запись времени для начала работы
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleTimeEntryDialog()}
          >
            Добавить запись
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderReportsTab = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Отчеты по рабочему времени
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Сводка по сотрудникам
              </Typography>
              
              {mockEmployees.map((employee) => {
                const employeeEntries = filteredEntries.filter(entry => entry.userId === employee.id);
                const totalHours = employeeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
                const overtimeHours = employeeEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0);
                
                return (
                  <Box key={employee.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {employee.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{employee.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.position}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {totalHours}ч
                        </Typography>
                        {overtimeHours > 0 && (
                          <Typography variant="caption" color="warning.main">
                            +{overtimeHours}ч сверх
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((totalHours / 40) * 100, 100)} 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Экспорт данных
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={() => toast('Экспорт в Excel будет добавлен')}
                >
                  Экспорт в Excel
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ReportIcon />}
                  onClick={() => toast('Генерация PDF отчета будет добавлена')}
                >
                  PDF отчет
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ChartIcon />}
                  onClick={() => toast('Детальная аналитика будет добавлена')}
                >
                  Аналитика
                </Button>
              </Box>
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
          Табель учёта рабочего времени
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={approvalMode}
                onChange={(e) => setApprovalMode(e.target.checked)}
              />
            }
            label="Режим утверждения"
          />
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleTimeEntryDialog()}
          >
            Добавить запись
          </Button>
        </Box>
      </Box>

      {approvalMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Режим утверждения активен. Вы можете утверждать или отклонять записи времени.
        </Alert>
      )}

      {/* Вкладки */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="timesheet tabs">
            <Tab label="Таймеры" icon={<TimerIcon />} />
            <Tab label="Недельный вид" icon={<CalendarIcon />} />
            <Tab label="Отчеты" icon={<ChartIcon />} />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          {renderTimerCard()}
          {renderWeeklyView()}
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          {renderWeeklyView()}
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          {renderReportsTab()}
        </TabPanel>
      </Card>

      {/* FAB для быстрого добавления */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleTimeEntryDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Диалог создания/редактирования записи времени */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(selectedEntry ? () => {} : handleCreateEntry)}>
          <DialogTitle>
            {selectedEntry ? 'Редактировать запись времени' : 'Добавить запись времени'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="userId"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Выберите сотрудника' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Сотрудник</InputLabel>
                      <Select {...field} label="Сотрудник">
                        {mockEmployees.map((employee) => (
                          <MenuItem key={employee.id} value={employee.id}>
                            {employee.name} - {employee.position}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="projectId"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Проект</InputLabel>
                      <Select {...field} label="Проект">
                        <MenuItem value="">Без проекта</MenuItem>
                        {mockProjects.map((project) => (
                          <MenuItem key={project.id} value={project.id}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="date"
                  control={control}
                  defaultValue={new Date()}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="workType"
                  control={control}
                  defaultValue="other"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Тип работ</InputLabel>
                      <Select {...field} label="Тип работ">
                        <MenuItem value="foundation">Фундамент</MenuItem>
                        <MenuItem value="walls">Стены</MenuItem>
                        <MenuItem value="roof">Крыша</MenuItem>
                        <MenuItem value="electrical">Электрика</MenuItem>
                        <MenuItem value="plumbing">Сантехника</MenuItem>
                        <MenuItem value="finishing">Отделка</MenuItem>
                        <MenuItem value="inspection">Контроль</MenuItem>
                        <MenuItem value="other">Прочее</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="startTime"
                  control={control}
                  defaultValue={new Date()}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Время начала"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      value={field.value ? format(new Date(field.value), 'HH:mm') : ''}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const date = new Date();
                        date.setHours(parseInt(hours), parseInt(minutes));
                        field.onChange(date);
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="endTime"
                  control={control}
                  defaultValue={new Date()}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Время окончания"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      value={field.value ? format(new Date(field.value), 'HH:mm') : ''}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const date = new Date();
                        date.setHours(parseInt(hours), parseInt(minutes));
                        field.onChange(date);
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="totalHours"
                  control={control}
                  defaultValue={8}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Всего часов"
                      type="number"
                      inputProps={{ min: 0, max: 24, step: 0.5 }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="breakHours"
                  control={control}
                  defaultValue={1}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Перерыв (часов)"
                      type="number"
                      inputProps={{ min: 0, max: 8, step: 0.5 }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="overtimeHours"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Сверхурочные"
                      type="number"
                      inputProps={{ min: 0, max: 16, step: 0.5 }}
                    />
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
                      label="Описание работ"
                      multiline
                      rows={3}
                      placeholder="Детальное описание выполненных работ"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="location"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Место работы"
                      placeholder="Конкретное место выполнения работ"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="contained">
              {selectedEntry ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TimesheetPage;