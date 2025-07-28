import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  LinearProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ProjectTask, TaskStatus, WorkType, User } from '../../types';
import { FilterList as FilterIcon, List as ListIcon, ViewKanban as KanbanIcon, Add as AddIcon } from '@mui/icons-material';

interface TaskManagerProps {
  projectId: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [filters, setFilters] = useState({
    assignee: '',
    workType: '',
    priority: '',
    status: '',
    search: '',
  });

  // Симуляция данных
  const mockTasks: ProjectTask[] = [
    {
      id: '1',
      projectId,
      name: 'Подготовка фундамента',
      description: 'Выкопать котлован и подготовить основание под фундамент',
      workType: WorkType.FOUNDATION,
      status: TaskStatus.IN_PROGRESS,
      assigneeId: 'user-1',
      supervisorId: 'user-2',
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      estimatedHours: 40,
      actualHours: 25,
      materials: [],
      tools: [],
      cost: 150000,
      priority: 'high',
      dependencies: [],
      weatherDependent: true,
      location: 'Участок А',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      projectId,
      name: 'Возведение стен',
      description: 'Кладка кирпичных стен первого этажа',
      workType: WorkType.WALLS,
      status: TaskStatus.NOT_STARTED,
      assigneeId: 'user-3',
      supervisorId: 'user-2',
      estimatedHours: 80,
      actualHours: 0,
      materials: [],
      tools: [],
      cost: 300000,
      priority: 'medium',
      dependencies: ['1'],
      weatherDependent: true,
      location: 'Первый этаж',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      projectId,
      name: 'Электромонтажные работы',
      description: 'Прокладка электрических сетей и установка розеток',
      workType: WorkType.ELECTRICAL,
      status: TaskStatus.QUALITY_CHECK,
      assigneeId: 'user-4',
      estimatedHours: 30,
      actualHours: 28,
      materials: [],
      tools: [],
      cost: 80000,
      priority: 'medium',
      dependencies: ['2'],
      weatherDependent: false,
      location: 'Все этажи',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      projectId,
      name: 'Отделочные работы',
      description: 'Штукатурка, шпаклевка и покраска стен',
      workType: WorkType.FINISHING,
      status: TaskStatus.COMPLETED,
      assigneeId: 'user-5',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      estimatedHours: 60,
      actualHours: 65,
      materials: [],
      tools: [],
      cost: 120000,
      priority: 'low',
      dependencies: ['3'],
      weatherDependent: false,
      location: 'Комнаты 1-5',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUsers: User[] = [
    {
      id: 'user-1',
      email: 'ivanov@example.com',
      name: 'Иванов И.И.',
      role: 'foreman' as any,
      avatar: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-2',
      email: 'petrov@example.com',
      name: 'Петров П.П.',
      role: 'manager' as any,
      avatar: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-3',
      email: 'sidorov@example.com',
      name: 'Сидоров С.С.',
      role: 'worker' as any,
      avatar: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-4',
      email: 'kozlov@example.com',
      name: 'Козлов К.К.',
      role: 'worker' as any,
      avatar: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-5',
      email: 'smith@example.com',
      name: 'Смит А.А.',
      role: 'worker' as any,
      avatar: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTasks(mockTasks);
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Колонки канбан-доски
  const kanbanColumns = [
    { id: TaskStatus.NOT_STARTED, title: 'Не начато', color: '#757575' },
    { id: TaskStatus.IN_PROGRESS, title: 'В работе', color: '#2196F3' },
    { id: TaskStatus.PAUSED, title: 'Приостановлено', color: '#FF9800' },
    { id: TaskStatus.WAITING_MATERIALS, title: 'Ожидание материалов', color: '#9C27B0' },
    { id: TaskStatus.QUALITY_CHECK, title: 'Проверка качества', color: '#FF5722' },
    { id: TaskStatus.COMPLETED, title: 'Завершено', color: '#4CAF50' },
  ];

  // Фильтрация задач
  const filteredTasks = tasks.filter(task => {
    if (filters.assignee && task.assigneeId !== filters.assignee) return false;
    if (filters.workType && task.workType !== filters.workType) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.search && !task.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Группировка задач по статусам для канбан-доски
  const tasksByStatus = kanbanColumns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, ProjectTask[]>);

  const getWorkTypeText = (workType: WorkType): string => {
    const types = {
      [WorkType.FOUNDATION]: 'Фундамент',
      [WorkType.WALLS]: 'Стены',
      [WorkType.ROOF]: 'Кровля',
      [WorkType.ELECTRICAL]: 'Электрика',
      [WorkType.PLUMBING]: 'Сантехника',
      [WorkType.FINISHING]: 'Отделка',
      [WorkType.OTHER]: 'Другое',
    };
    return types[workType as keyof typeof types] || workType;
  };

  const getWorkTypeColor = (workType: WorkType): string => {
    const colors = {
      [WorkType.FOUNDATION]: '#8D6E63',
      [WorkType.WALLS]: '#FF7043',
      [WorkType.ROOF]: '#5C6BC0',
      [WorkType.ELECTRICAL]: '#FFB74D',
      [WorkType.PLUMBING]: '#42A5F5',
      [WorkType.FINISHING]: '#AB47BC',
      [WorkType.OTHER]: '#78909C',
    };
    return colors[workType as keyof typeof colors] || '#757575';
  };

  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Не назначен';
  };

  const getUserAvatar = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.name.charAt(0) || '?';
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newTasks = [...tasks];
    const taskIndex = newTasks.findIndex(task => task.id === draggableId);
    
    if (taskIndex !== -1) {
      newTasks[taskIndex] = {
        ...newTasks[taskIndex],
        status: destination.droppableId as TaskStatus,
      };
      setTasks(newTasks);
    }
  };

  const TaskCard: React.FC<{ task: ProjectTask; index: number }> = ({ task, index }) => {
    const progress = task.estimatedHours > 0 ? (task.actualHours / task.estimatedHours) * 100 : 0;
    const isOverdue = task.endDate && new Date(task.endDate) < new Date() && task.status !== TaskStatus.COMPLETED;

    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            sx={{
              mb: 2,
              cursor: 'grab',
              transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
              opacity: snapshot.isDragging ? 0.9 : 1,
              boxShadow: snapshot.isDragging ? 4 : 1,
              '&:hover': {
                boxShadow: 3,
              },
            }}
            onClick={() => {
              setSelectedTask(task);
              setTaskDialogOpen(true);
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              {/* Заголовок задачи */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, flexGrow: 1, mr: 1 }}>
                  {task.name}
                </Typography>
                <IconButton size="small" sx={{ p: 0.5 }}>
                  {/* <MoreIcon fontSize="small" /> */}
                </IconButton>
              </Box>

              {/* Описание */}
              {task.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                  {task.description.length > 100 
                    ? `${task.description.substring(0, 100)}...` 
                    : task.description
                  }
                </Typography>
              )}

              {/* Теги */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                <Chip
                  size="small"
                  label={getWorkTypeText(task.workType)}
                  sx={{ 
                    bgcolor: getWorkTypeColor(task.workType),
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
                <Chip
                  size="small"
                  label={getPriorityText(task.priority)}
                  color={getPriorityColor(task.priority)}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
                {task.weatherDependent && (
                  <Chip
                    size="small"
                    label="☀️ Погода"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>

              {/* Прогресс */}
              {task.estimatedHours > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Прогресс
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.actualHours}ч / {task.estimatedHours}ч
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(progress, 100)} 
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: progress > 100 ? '#f44336' : '#4caf50',
                      }
                    }}
                  />
                </Box>
              )}

              {/* Детали */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {task.assigneeId && (
                    <Tooltip title={getUserName(task.assigneeId)}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                        {getUserAvatar(task.assigneeId)}
                      </Avatar>
                    </Tooltip>
                  )}
                  
                  {task.endDate && (
                    <Tooltip title={`Срок: ${new Date(task.endDate).toLocaleDateString('ru')}`}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {/* <ScheduleIcon 
                          sx={{ 
                            fontSize: 16, 
                            color: isOverdue ? 'error.main' : 'text.secondary' 
                          }} 
                        /> */}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isOverdue ? 'error.main' : 'text.secondary',
                            fontSize: '0.7rem'
                          }}
                        >
                          {new Date(task.endDate).toLocaleDateString('ru', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {task.cost > 0 && (
                    <Tooltip title={`Стоимость: ${task.cost.toLocaleString('ru')} ₽`}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MoneyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {(task.cost / 1000).toFixed(0)}к
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                  
                  {isOverdue && (
                    <Tooltip title="Просрочена"><span>!</span></Tooltip>
                  )}
                </Box>
              </Box>

              {/* Зависимости */}
              {task.dependencies && task.dependencies.length > 0 && (
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Зависит от: {task.dependencies.length} задач
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Загрузка задач...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и фильтры */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* <TaskIcon sx={{ fontSize: 32, color: 'primary.main' }} /> */}
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Управление задачами
          </Typography>
          <Chip label={`${filteredTasks.length} задач`} color="primary" variant="outlined" />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Поиск задач..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            sx={{ width: 200 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setFilterDialogOpen(true)}
          >
            Фильтры
          </Button>
          
          <Button
            variant="outlined"
            startIcon={viewMode === 'kanban' ? <ListIcon /> : <KanbanIcon />}
            onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
          >
            {viewMode === 'kanban' ? 'Список' : 'Канбан'}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedTask(null);
              setTaskDialogOpen(true);
            }}
          >
            Новая задача
          </Button>
        </Box>
      </Box>

      {/* Аналитика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    В работе
                  </Typography>
                </Box>
                {/* <StartIcon sx={{ fontSize: 32, opacity: 0.8 }} /> */}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Завершено
                  </Typography>
                </Box>
                {/* <CompletedIcon sx={{ fontSize: 32, opacity: 0.8 }} /> */}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {tasks.filter(t => t.endDate && new Date(t.endDate) < new Date() && t.status !== TaskStatus.COMPLETED).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Просрочено
                  </Typography>
                </Box>
                {/* <WarningIcon sx={{ fontSize: 32, opacity: 0.8 }} /> */}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {Math.round(tasks.reduce((acc, task) => acc + (task.estimatedHours > 0 ? (task.actualHours / task.estimatedHours) * 100 : 0), 0) / tasks.length) || 0}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Общий прогресс
                  </Typography>
                </Box>
                {/* <AnalyticsIcon sx={{ fontSize: 32, opacity: 0.8 }} /> */}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Канбан-доска */}
      {viewMode === 'kanban' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            overflowX: 'auto',
            pb: 2,
            minHeight: 600
          }}>
            {kanbanColumns.map(column => (
              <Box key={column.id} sx={{ minWidth: 300, maxWidth: 300 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 2,
                  p: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  border: `2px solid ${column.color}`,
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {column.title}
                  </Typography>
                  <Badge 
                    badgeContent={tasksByStatus[column.id]?.length || 0} 
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: column.color,
                        color: 'white'
                      }
                    }}
                  >
                    <Box />
                  </Badge>
                </Box>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: 500,
                        backgroundColor: snapshot.isDraggingOver ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                        borderRadius: 2,
                        p: 1,
                      }}
                    >
                      {(tasksByStatus[column.id] || []).map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            ))}
          </Box>
        </DragDropContext>
      ) : (
        // Списочный вид
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredTasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} />
          ))}
        </Box>
      )}

      {/* Диалог фильтров */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Фильтры задач</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Исполнитель</InputLabel>
                <Select
                  value={filters.assignee}
                  onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                  label="Исполнитель"
                >
                  <MenuItem value="">Все</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Тип работ</InputLabel>
                <Select
                  value={filters.workType}
                  onChange={(e) => setFilters({ ...filters, workType: e.target.value })}
                  label="Тип работ"
                >
                  <MenuItem value="">Все</MenuItem>
                  {Object.values(WorkType).map(type => (
                    <MenuItem key={type} value={type}>
                      {getWorkTypeText(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Приоритет</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  label="Приоритет"
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="high">Высокий</MenuItem>
                  <MenuItem value="medium">Средний</MenuItem>
                  <MenuItem value="low">Низкий</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label="Статус"
                >
                  <MenuItem value="">Все</MenuItem>
                  {kanbanColumns.map(column => (
                    <MenuItem key={column.id} value={column.id}>
                      {column.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilters({ assignee: '', workType: '', priority: '', status: '', search: '' })}>
            Сбросить
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)}>
            Применить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог задачи */}
      <Dialog 
        open={taskDialogOpen} 
        onClose={() => setTaskDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedTask ? 'Редактировать задачу' : 'Новая задача'}
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedTask.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {selectedTask.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Тип работ
                  </Typography>
                  <Typography variant="body1">
                    {getWorkTypeText(selectedTask.workType)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Приоритет
                  </Typography>
                  <Chip 
                    label={getPriorityText(selectedTask.priority)}
                    color={getPriorityColor(selectedTask.priority)}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Исполнитель
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.assigneeId ? getUserName(selectedTask.assigneeId) : 'Не назначен'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Стоимость
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.cost.toLocaleString('ru')} ₽
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Часы (план/факт)
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.actualHours} / {selectedTask.estimatedHours} часов
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Локация
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.location || 'Не указана'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>
            Закрыть
          </Button>
          {selectedTask && (
            <Button variant="contained">
              Сохранить
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManager;