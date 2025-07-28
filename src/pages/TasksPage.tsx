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
  LinearProgress,
  Avatar,
  Tooltip,
  ButtonGroup,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Assignment as TaskIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
  Error as BlockedIcon,
  Pause as PausedIcon,
  PlayArrow as InProgressIcon,
  AccessTime as PendingIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  format, 
  startOfMonth as startOfMonthDate, 
  endOfMonth as endOfMonthDate, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay, 
  isSameMonth, 
  subMonths, 
  addMonths 
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { ProjectTask, TaskStatus, WorkType } from '../types';
import { useProjectStore } from '../store';
import ProjectSelector from '../components/ProjectSelector';

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
      id={`tasks-tabpanel-${index}`}
      aria-labelledby={`tasks-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Моковые данные задач
const mockTasks: ProjectTask[] = [
  {
    id: '1',
    projectId: '1',
    name: 'Заливка фундамента',
    description: 'Подготовка и заливка монолитного фундамента',
    workType: WorkType.FOUNDATION,
    status: TaskStatus.IN_PROGRESS,
    assigneeId: '1',
    supervisorId: '2',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-25'),
    estimatedHours: 80,
    actualHours: 45,
    materials: [],
    tools: [],
    cost: 250000,
    priority: 'high',
    dependencies: [],
    weatherDependent: true,
    location: 'Участок А, секция 1',
    photos: [],
    issues: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    projectId: '1',
    name: 'Монтаж кровли',
    description: 'Установка металлочерепицы',
    workType: WorkType.ROOF,
    status: TaskStatus.NOT_STARTED,
    assigneeId: '2',
    supervisorId: '2',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-10'),
    estimatedHours: 60,
    actualHours: 0,
    materials: [],
    tools: [],
    cost: 180000,
    priority: 'medium',
    dependencies: ['1'],
    weatherDependent: true,
    location: 'Участок А, секция 1',
    photos: [],
    issues: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    projectId: '2',
    name: 'Электромонтаж',
    description: 'Прокладка электропроводки',
    workType: WorkType.ELECTRICAL,
    status: TaskStatus.COMPLETED,
    assigneeId: '3',
    supervisorId: '2',
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-01-30'),
    estimatedHours: 40,
    actualHours: 38,
    materials: [],
    tools: [],
    cost: 120000,
    priority: 'medium',
    dependencies: [],
    weatherDependent: false,
    location: 'Офисное здание, 2 этаж',
    photos: [],
    issues: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-30'),
  },
];

const TasksPage: React.FC = () => {
  const { currentProjectId, isAllProjectsView, selectedProject, projects } = useProjectStore();
  const [tasks, setTasks] = useState<ProjectTask[]>(mockTasks);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [calendarDate, setCalendarDate] = useState(new Date());

  const { control, handleSubmit, reset } = useForm<ProjectTask>();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleCreateTask = async (data: ProjectTask) => {
    try {
      const newTask: ProjectTask = {
        ...data,
        id: Date.now().toString(),
        actualHours: 0,
        materials: [],
        tools: [],
        dependencies: [],
        photos: [],
        issues: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setTasks(prev => [...prev, newTask]);
      setOpenDialog(false);
      reset();
      toast.success('Задача успешно создана');
    } catch (error) {
      toast.error('Ошибка при создании задачи');
    }
  };

  const handleEditTask = async (data: ProjectTask) => {
    if (!selectedTask) return;
    try {
      setTasks(prev =>
        prev.map(task =>
          task.id === selectedTask.id
            ? { ...task, ...data, updatedAt: new Date() }
            : task
        )
      );
      setOpenDialog(false);
      setSelectedTask(null);
      reset();
      toast.success('Задача успешно обновлена');
    } catch (error) {
      toast.error('Ошибка при обновлении задачи');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      try {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.success('Задача удалена');
      } catch (error) {
        toast.error('Ошибка при удалении задачи');
      }
    }
  };

  const openTaskDialog = (task?: ProjectTask) => {
    if (task) {
      setSelectedTask(task);
      reset(task);
    } else {
      setSelectedTask(null);
      reset({
        name: '',
        description: '',
        workType: WorkType.OTHER,
        status: TaskStatus.NOT_STARTED,
        priority: 'medium',
        estimatedHours: 0,
        cost: 0,
        weatherDependent: false,
      } as any);
    }
    setOpenDialog(true);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'success';
      case TaskStatus.IN_PROGRESS:
        return 'primary';
      case TaskStatus.PAUSED:
        return 'warning';
      case TaskStatus.BLOCKED:
        return 'error';
      case TaskStatus.WAITING_MATERIALS:
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    const statusMap = {
      [TaskStatus.NOT_STARTED]: 'Не начата',
      [TaskStatus.IN_PROGRESS]: 'В работе',
      [TaskStatus.PAUSED]: 'Приостановлена',
      [TaskStatus.WAITING_MATERIALS]: 'Ожидание материалов',
      [TaskStatus.WAITING_APPROVAL]: 'Ожидание утверждения',
      [TaskStatus.QUALITY_CHECK]: 'Контроль качества',
      [TaskStatus.REWORK_REQUIRED]: 'Требует переделки',
      [TaskStatus.COMPLETED]: 'Завершена',
      [TaskStatus.BLOCKED]: 'Заблокирована',
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CompletedIcon />;
      case TaskStatus.IN_PROGRESS:
        return <InProgressIcon />;
      case TaskStatus.PAUSED:
        return <PausedIcon />;
      case TaskStatus.BLOCKED:
        return <BlockedIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const getWorkTypeText = (workType: WorkType) => {
    const typeMap = {
      [WorkType.FOUNDATION]: 'Фундамент',
      [WorkType.WALLS]: 'Стены',
      [WorkType.ROOF]: 'Кровля',
      [WorkType.ELECTRICAL]: 'Электромонтаж',
      [WorkType.PLUMBING]: 'Сантехника',
      [WorkType.HVAC]: 'ОВК',
      [WorkType.FINISHING]: 'Отделка',
      [WorkType.FLOORING]: 'Полы',
      [WorkType.PAINTING]: 'Покраска',
      [WorkType.LANDSCAPING]: 'Благоустройство',
      [WorkType.INSULATION]: 'Утепление',
      [WorkType.WATERPROOFING]: 'Гидроизоляция',
      [WorkType.DEMOLITION]: 'Демонтаж',
      [WorkType.EXCAVATION]: 'Земляные работы',
      [WorkType.CONCRETE]: 'Бетонные работы',
      [WorkType.STEEL_WORK]: 'Металлоконструкции',
      [WorkType.MASONRY]: 'Каменные работы',
      [WorkType.WINDOWS_DOORS]: 'Окна и двери',
      [WorkType.SECURITY_SYSTEMS]: 'Охранные системы',
      [WorkType.CLEANING]: 'Уборка',
      [WorkType.INSPECTION]: 'Инспекция',
      [WorkType.OTHER]: 'Прочее',
    };
    return typeMap[workType] || workType;
  };

  // Фильтрация задач по выбранному проекту
  const filteredTasks = tasks.filter(task => {
    if (isAllProjectsView) return true;
    if (currentProjectId) return task.projectId === currentProjectId;
    return true;
  }).filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || task.assigneeId === filterAssignee;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const taskStats = {
    total: filteredTasks.length,
    notStarted: filteredTasks.filter(t => t.status === TaskStatus.NOT_STARTED).length,
    inProgress: filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    completed: filteredTasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    blocked: filteredTasks.filter(t => t.status === TaskStatus.BLOCKED).length,
    overdue: filteredTasks.filter(t => t.endDate && new Date(t.endDate) < new Date() && t.status !== TaskStatus.COMPLETED).length,
  };

  const renderTasksList = () => (
    <Box>
      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TaskIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {taskStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего задач
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PendingIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {taskStats.notStarted}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Не начаты
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <InProgressIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {taskStats.inProgress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                В работе
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CompletedIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {taskStats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Завершены
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BlockedIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {taskStats.blocked}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Заблокированы
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {taskStats.overdue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Просрочены
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Поиск по названию или описанию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="all">Все статусы</MenuItem>
                  <MenuItem value={TaskStatus.NOT_STARTED}>Не начата</MenuItem>
                  <MenuItem value={TaskStatus.IN_PROGRESS}>В работе</MenuItem>
                  <MenuItem value={TaskStatus.COMPLETED}>Завершена</MenuItem>
                  <MenuItem value={TaskStatus.BLOCKED}>Заблокирована</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Приоритет</InputLabel>
                <Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  label="Приоритет"
                >
                  <MenuItem value="all">Все приоритеты</MenuItem>
                  <MenuItem value="low">Низкий</MenuItem>
                  <MenuItem value="medium">Средний</MenuItem>
                  <MenuItem value="high">Высокий</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Исполнитель</InputLabel>
                <Select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  label="Исполнитель"
                >
                  <MenuItem value="all">Все исполнители</MenuItem>
                  <MenuItem value="1">И. Иванов</MenuItem>
                  <MenuItem value="2">П. Петров</MenuItem>
                  <MenuItem value="3">С. Сидоров</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setFilterAssignee('all');
                }}
              >
                Сбросить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Таблица задач */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Задача</TableCell>
                  <TableCell>Тип работ</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Приоритет</TableCell>
                  <TableCell>Исполнитель</TableCell>
                  <TableCell>Прогресс</TableCell>
                  <TableCell>Срок</TableCell>
                  <TableCell>Стоимость</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => {
                  const progress = task.actualHours > 0 ? Math.round((task.actualHours / task.estimatedHours) * 100) : 0;
                  const isOverdue = task.endDate && new Date(task.endDate) < new Date() && task.status !== TaskStatus.COMPLETED;
                  
                  return (
                    <TableRow key={task.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: getStatusColor(task.status) + '.main' }}>
                            {getStatusIcon(task.status)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {task.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {task.description}
                            </Typography>
                            {task.location && (
                              <Typography variant="caption" color="text.secondary">
                                📍 {task.location}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getWorkTypeText(task.workType)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusText(task.status)}
                          color={getStatusColor(task.status)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                          color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {task.assigneeId === '1' ? 'И. Иванов' : 
                             task.assigneeId === '2' ? 'П. Петров' : 
                             task.assigneeId === '3' ? 'С. Сидоров' : 'Не назначен'}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: '100%', minWidth: 60 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ minWidth: 40 }}>
                            {progress}%
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        {task.endDate ? (
                          <Typography
                            variant="body2"
                            color={isOverdue ? 'error' : 'inherit'}
                            sx={{ fontWeight: isOverdue ? 600 : 400 }}
                          >
                            {format(new Date(task.endDate), 'dd.MM.yyyy', { locale: ru })}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Не указан
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {task.cost.toLocaleString('ru-RU')} ₽
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <ButtonGroup variant="outlined" size="small">
                          <Tooltip title="Просмотр">
                            <IconButton size="small">
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Редактировать">
                            <IconButton
                              size="small"
                              onClick={() => openTaskDialog(task)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Удалить">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredTasks.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <TaskIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all'
                  ? 'Задачи не найдены'
                  : 'Нет созданных задач'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all'
                  ? 'Попробуйте изменить параметры поиска или фильтров'
                  : 'Создайте первую задачу для начала работы'}
              </Typography>
              {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && filterAssignee === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openTaskDialog()}
                >
                  Создать задачу
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderKanbanBoard = () => (
    <Box>
      <Grid container spacing={3}>
        {[
          { status: TaskStatus.NOT_STARTED, title: 'Не начаты', color: 'grey.500' },
          { status: TaskStatus.IN_PROGRESS, title: 'В работе', color: 'primary.main' },
          { status: TaskStatus.QUALITY_CHECK, title: 'Контроль качества', color: 'info.main' },
          { status: TaskStatus.COMPLETED, title: 'Завершены', color: 'success.main' },
        ].map((column) => {
          const columnTasks = filteredTasks.filter(task => task.status === column.status);
          
          return (
            <Grid item xs={12} sm={6} lg={3} key={column.status}>
              <Card sx={{ height: '100%', minHeight: 400 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: column.color,
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {column.title}
                    </Typography>
                    <Chip label={columnTasks.length} size="small" />
                  </Box>
                  
                  <List dense>
                    {columnTasks.map((task) => (
                      <ListItem
                        key={task.id}
                        sx={{
                          p: 1,
                          mb: 1,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => openTaskDialog(task)}
                      >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: column.color }}>
                            {getStatusIcon(task.status)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                              {task.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {getWorkTypeText(task.workType)}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Chip
                                  label={task.priority === 'high' ? 'В' : task.priority === 'medium' ? 'С' : 'Н'}
                                  size="small"
                                  color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}
                                  sx={{ height: 16, fontSize: '0.6rem' }}
                                />
                                {task.endDate && (
                                  <Typography variant="caption" color="text.secondary">
                                    {format(new Date(task.endDate), 'dd.MM', { locale: ru })}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const renderTaskCalendar = () => {
    const today = calendarDate;
    const startOfMonth = startOfMonthDate(today);
    const endOfMonth = endOfMonthDate(today);
    const startDate = startOfWeek(startOfMonth, { weekStartsOn: 1 });
    const endDate = endOfWeek(endOfMonth, { weekStartsOn: 1 });
    
    const days = [];
    let day = startDate;
    
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    const getTasksForDay = (date: Date) => {
      return filteredTasks.filter(task => 
        task.endDate && isSameDay(new Date(task.endDate), date)
      );
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return '#f44336';
        case 'medium': return '#ff9800';
        case 'low': return '#4caf50';
        default: return '#9e9e9e';
      }
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            {format(today, 'LLLL yyyy', { locale: ru })}
          </Typography>
          <Box>
            <IconButton onClick={() => setCalendarDate(subMonths(calendarDate, 1))}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={() => setCalendarDate(addMonths(calendarDate, 1))}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Заголовки дней недели */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((dayName) => (
            <Grid item xs key={dayName}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {dayName}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Календарная сетка */}
        <Grid container spacing={1}>
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, today);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Grid item xs key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    minHeight: 120,
                    backgroundColor: isCurrentMonth ? 'background.paper' : 'action.hover',
                    border: isToday ? '2px solid #2196f3' : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 1 }
                  }}
                  onClick={() => {
                    console.log('Создать задачу на', format(day, 'dd.MM.yyyy'));
                  }}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: isToday ? 600 : 400,
                        color: isCurrentMonth ? 'text.primary' : 'text.disabled'
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                    
                    <Box sx={{ mt: 0.5 }}>
                      {dayTasks.slice(0, 3).map((task, taskIndex) => (
                        <Box
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openTaskDialog(task);
                          }}
                          sx={{
                            backgroundColor: getPriorityColor(task.priority),
                            color: 'white',
                            borderRadius: 1,
                            p: 0.5,
                            mb: 0.5,
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            '&:hover': { opacity: 0.8 }
                          }}
                        >
                          {task.name}
                        </Box>
                      ))}
                      {dayTasks.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{dayTasks.length - 3} еще
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Легенда */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#f44336', borderRadius: 1 }} />
            <Typography variant="caption">Высокий приоритет</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#ff9800', borderRadius: 1 }} />
            <Typography variant="caption">Средний приоритет</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#4caf50', borderRadius: 1 }} />
            <Typography variant="caption">Низкий приоритет</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Управление задачами
          </Typography>
          <ProjectSelector />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openTaskDialog()}
        >
          Создать задачу
        </Button>
      </Box>

      {/* Вкладки */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="tasks tabs">
            <Tab label="Список задач" />
            <Tab label="Канбан доска" />
            <Tab label="Календарь задач" />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          {renderTasksList()}
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          {renderKanbanBoard()}
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          {renderTaskCalendar()}
        </TabPanel>
      </Card>

      {/* Диалог создания/редактирования задачи */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(selectedTask ? handleEditTask : handleCreateTask)}>
          <DialogTitle>
            {selectedTask ? 'Редактировать задачу' : 'Создать новую задачу'}
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Название задачи обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Название задачи"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
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
                      label="Описание"
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="projectId"
                  control={control}
                  defaultValue={currentProjectId || ""}
                  rules={{ required: 'Выберите проект' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Проект</InputLabel>
                      <Select {...field} label="Проект">
                        {projects.map((project) => (
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
                  name="workType"
                  control={control}
                  defaultValue={WorkType.OTHER}
                  rules={{ required: 'Выберите тип работ' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Тип работ</InputLabel>
                      <Select {...field} label="Тип работ">
                        <MenuItem value={WorkType.FOUNDATION}>Фундамент</MenuItem>
                        <MenuItem value={WorkType.WALLS}>Стены</MenuItem>
                        <MenuItem value={WorkType.ROOF}>Кровля</MenuItem>
                        <MenuItem value={WorkType.ELECTRICAL}>Электромонтаж</MenuItem>
                        <MenuItem value={WorkType.PLUMBING}>Сантехника</MenuItem>
                        <MenuItem value={WorkType.FINISHING}>Отделка</MenuItem>
                        <MenuItem value={WorkType.OTHER}>Прочее</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="priority"
                  control={control}
                  defaultValue="medium"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Приоритет</InputLabel>
                      <Select {...field} label="Приоритет">
                        <MenuItem value="low">Низкий</MenuItem>
                        <MenuItem value="medium">Средний</MenuItem>
                        <MenuItem value="high">Высокий</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="assigneeId"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Исполнитель</InputLabel>
                      <Select {...field} label="Исполнитель">
                        <MenuItem value="1">И. Иванов</MenuItem>
                        <MenuItem value="2">П. Петров</MenuItem>
                        <MenuItem value="3">С. Сидоров</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="estimatedHours"
                  control={control}
                  defaultValue={0}
                  rules={{ required: 'Укажите планируемые часы', min: { value: 1, message: 'Должно быть больше 0' } }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Планируемые часы"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата начала"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата окончания"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="cost"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Стоимость"
                      type="number"
                      InputProps={{
                        endAdornment: '₽',
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="location"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Местоположение"
                      placeholder="Например: Участок А, секция 1"
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
              {selectedTask ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TasksPage;