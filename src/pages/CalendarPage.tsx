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
  FormControlLabel,
  Switch,
  Avatar,
  ButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Work as TaskIcon,
  People as MeetingIcon,
  LocalShipping as DeliveryIcon,
  Assignment as InspectionIcon,
  School as TrainingIcon,
  Today as TodayIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  ViewWeek as WeekViewIcon,
  ViewModule as MonthViewIcon,
  ViewDay as DayViewIcon,
  FilterList as FilterIcon,
  Notifications as NotificationIcon,
  LocationOn as LocationIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarEvent, EventReminder } from '../types';

// Моковые данные событий
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Заливка фундамента',
    description: 'Заливка фундамента для проекта "Солнечный"',
    type: 'task',
    startDate: new Date('2024-02-15T09:00:00'),
    endDate: new Date('2024-02-15T17:00:00'),
    allDay: false,
    location: 'ул. Солнечная, 15',
    participants: ['1', '2'],
    projectId: '1',
    taskId: '1',
    isRecurring: false,
    status: 'confirmed',
    priority: 'high',
    color: '#f44336',
    reminders: [
      { type: 'email', minutesBefore: 60 },
      { type: 'push', minutesBefore: 30 }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    title: 'Встреча с клиентом',
    description: 'Обсуждение изменений в проекте',
    type: 'meeting',
    startDate: new Date('2024-02-16T14:00:00'),
    endDate: new Date('2024-02-16T15:30:00'),
    allDay: false,
    location: 'Офис',
    participants: ['1', '3'],
    projectId: '1',
    isRecurring: false,
    status: 'confirmed',
    priority: 'medium',
    color: '#2196f3',
    reminders: [
      { type: 'email', minutesBefore: 60 }
    ],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    title: 'Поставка материалов',
    description: 'Доставка цемента и арматуры',
    type: 'delivery',
    startDate: new Date('2024-02-14T10:00:00'),
    endDate: new Date('2024-02-14T12:00:00'),
    allDay: false,
    location: 'Склад А',
    participants: ['4'],
    isRecurring: false,
    status: 'confirmed',
    priority: 'medium',
    color: '#ff9800',
    reminders: [
      { type: 'push', minutesBefore: 30 }
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '4',
    title: 'Техника безопасности',
    description: 'Обучение новых сотрудников',
    type: 'training',
    startDate: new Date('2024-02-13T09:00:00'),
    endDate: new Date('2024-02-13T17:00:00'),
    allDay: true,
    location: 'Учебный центр',
    participants: ['5', '6', '7'],
    isRecurring: false,
    status: 'confirmed',
    priority: 'low',
    color: '#4caf50',
    reminders: [
      { type: 'email', minutesBefore: 1440 }, // За день
      { type: 'push', minutesBefore: 60 }
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
  }
];

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [showWeekends, setShowWeekends] = useState(true);

  const { control, handleSubmit, reset, watch } = useForm<CalendarEvent>();

  const handleCreateEvent = async (data: CalendarEvent) => {
    try {
      const newEvent: CalendarEvent = {
        ...data,
        id: Date.now().toString(),
        status: 'confirmed',
        isRecurring: false,
        reminders: [
          { type: 'email', minutesBefore: 60 }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setEvents(prev => [...prev, newEvent]);
      setOpenDialog(false);
      reset();
      toast.success('Событие успешно создано');
    } catch (error) {
      toast.error('Ошибка при создании события');
    }
  };

  const handleEditEvent = async (data: CalendarEvent) => {
    if (!selectedEvent) return;
    try {
      setEvents(prev =>
        prev.map(event =>
          event.id === selectedEvent.id
            ? { ...event, ...data, updatedAt: new Date() }
            : event
        )
      );
      setOpenDialog(false);
      setSelectedEvent(null);
      reset();
      toast.success('Событие успешно обновлено');
    } catch (error) {
      toast.error('Ошибка при обновлении события');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это событие?')) {
      try {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        toast.success('Событие удалено');
      } catch (error) {
        toast.error('Ошибка при удалении события');
      }
    }
  };

  const openEventDialog = (event?: CalendarEvent, date?: Date) => {
    if (event) {
      setSelectedEvent(event);
      reset(event);
    } else {
      setSelectedEvent(null);
      reset({
        startDate: date || new Date(),
        endDate: addDays(date || new Date(), 0),
        allDay: false,
        type: 'task',
        priority: 'medium',
      });
    }
    setSelectedDate(date || null);
            setOpenDialog(true);
  };

  const getEventTypeColor = (type: string) => {
    const colorMap = {
      task: '#f44336',
      meeting: '#2196f3',
      deadline: '#ff5722',
      delivery: '#ff9800',
      inspection: '#9c27b0',
      holiday: '#4caf50',
      training: '#00bcd4',
    };
    return colorMap[type as keyof typeof colorMap] || '#757575';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <TaskIcon />;
      case 'meeting':
        return <MeetingIcon />;
      case 'delivery':
        return <DeliveryIcon />;
      case 'inspection':
        return <InspectionIcon />;
      case 'training':
        return <TrainingIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getEventTypeText = (type: string) => {
    const typeMap = {
      task: 'Задача',
      meeting: 'Встреча',
      deadline: 'Дедлайн',
      delivery: 'Поставка',
      inspection: 'Инспекция',
      holiday: 'Праздник',
      training: 'Обучение',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true;
    return event.type === filterType;
  });

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      if (event.allDay) {
        return isSameDay(new Date(event.startDate), date);
      }
      return (
        isSameDay(new Date(event.startDate), date) ||
        isSameDay(new Date(event.endDate), date) ||
        (new Date(event.startDate) <= date && new Date(event.endDate) >= date)
      );
    });
  };

  const getTodayEvents = () => {
    const today = new Date();
    return getEventsForDate(today);
  };

  const getUpcomingEvents = () => {
    const today = startOfDay(new Date());
    const nextWeek = endOfDay(addDays(today, 7));
    
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= today && eventDate <= nextWeek;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const calendarDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <Box>
        {/* Заголовки дней недели */}
        <Grid container>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
            <Grid item xs key={day} sx={{ p: 1, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Календарная сетка */}
        {weeks.map((week, weekIndex) => (
          <Grid container key={weekIndex} sx={{ minHeight: 120 }}>
            {week.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              if (!showWeekends && (day.getDay() === 0 || day.getDay() === 6)) {
                return null;
              }

              return (
                <Grid 
                  item 
                  xs 
                  key={day.toISOString()}
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider',
                    p: 1,
                    cursor: 'pointer',
                    backgroundColor: isToday ? 'primary.light' : isCurrentMonth ? 'background.paper' : 'grey.50',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => openEventDialog(undefined, day)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: isToday ? 700 : 400,
                        color: isCurrentMonth ? 'text.primary' : 'text.secondary',
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                    {dayEvents.length > 0 && (
                      <Badge badgeContent={dayEvents.length} color="primary" />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {dayEvents.slice(0, 3).map((event) => (
                      <Chip
                        key={event.id}
                        label={event.title}
                        size="small"
                        sx={{
                          backgroundColor: event.color || getEventTypeColor(event.type),
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEventDialog(event);
                        }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{dayEvents.length - 3} еще
                      </Typography>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
    );
  };

  const renderUpcomingEvents = () => {
    const upcomingEvents = getUpcomingEvents();
    
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TodayIcon />
            Ближайшие события
          </Typography>
          
          {upcomingEvents.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Нет запланированных событий на ближайшую неделю
            </Typography>
          ) : (
            <List>
              {upcomingEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar 
                        sx={{ 
                          bgcolor: event.color || getEventTypeColor(event.type),
                          width: 32,
                          height: 32,
                        }}
                      >
                        {getEventTypeIcon(event.type)}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {event.title}
                          </Typography>
                          <Chip 
                            label={getEventTypeText(event.type)} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TimeIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                {event.allDay 
                                  ? format(new Date(event.startDate), 'dd.MM.yyyy')
                                  : `${format(new Date(event.startDate), 'dd.MM.yyyy HH:mm')} - ${format(new Date(event.endDate), 'HH:mm')}`
                                }
                              </Typography>
                            </Box>
                            {event.location && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption">
                                  {event.location}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {event.description && (
                            <Typography variant="caption" color="text.secondary">
                              {event.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <ButtonGroup size="small">
                        <Tooltip title="Редактировать">
                          <IconButton onClick={() => openEventDialog(event)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton onClick={() => handleDeleteEvent(event.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ButtonGroup>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < upcomingEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    );
  };

  const todayEvents = getTodayEvents();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Календарь
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<TodayIcon />}
            onClick={() => setCurrentDate(new Date())}
          >
            Сегодня
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openEventDialog()}
          >
            Создать событие
          </Button>
        </Box>
      </Box>

      {/* Уведомления о событиях сегодня */}
      {todayEvents.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          icon={<NotificationIcon />}
        >
          У вас запланировано {todayEvents.length} событий на сегодня
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Основной календарь */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              {/* Навигация по календарю */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                    <PrevIcon />
                  </IconButton>
                  <Typography variant="h5" sx={{ fontWeight: 600, minWidth: 200 }}>
                    {format(currentDate, 'LLLL yyyy', { locale: ru })}
                  </Typography>
                  <IconButton onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                    <NextIcon />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <ButtonGroup>
                    <Button
                      variant={viewType === 'month' ? 'contained' : 'outlined'}
                      startIcon={<MonthViewIcon />}
                      onClick={() => setViewType('month')}
                    >
                      Месяц
                    </Button>
                    <Button
                      variant={viewType === 'week' ? 'contained' : 'outlined'}
                      startIcon={<WeekViewIcon />}
                      onClick={() => setViewType('week')}
                      disabled
                    >
                      Неделя
                    </Button>
                    <Button
                      variant={viewType === 'day' ? 'contained' : 'outlined'}
                      startIcon={<DayViewIcon />}
                      onClick={() => setViewType('day')}
                      disabled
                    >
                      День
                    </Button>
                  </ButtonGroup>
                </Box>
              </Box>

              {/* Фильтры */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Тип события</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Тип события"
                  >
                    <MenuItem value="all">Все типы</MenuItem>
                    <MenuItem value="task">Задачи</MenuItem>
                    <MenuItem value="meeting">Встречи</MenuItem>
                    <MenuItem value="delivery">Поставки</MenuItem>
                    <MenuItem value="training">Обучение</MenuItem>
                    <MenuItem value="inspection">Инспекции</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={showWeekends}
                      onChange={(e) => setShowWeekends(e.target.checked)}
                    />
                  }
                  label="Показывать выходные"
                />
              </Box>

              {/* Календарное представление */}
              {viewType === 'month' && renderMonthView()}
            </CardContent>
          </Card>
        </Grid>

        {/* Боковая панель с предстоящими событиями */}
        <Grid item xs={12} lg={4}>
          {renderUpcomingEvents()}
        </Grid>
      </Grid>

      {/* Диалог создания/редактирования события */}
      <Dialog 
                open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(selectedEvent ? handleEditEvent : handleCreateEvent)}>
          <DialogTitle>
            {selectedEvent ? 'Редактировать событие' : 'Создать новое событие'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Название события обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Название события"
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
                  defaultValue="task"
                  rules={{ required: 'Выберите тип события' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Тип события</InputLabel>
                      <Select {...field} label="Тип события">
                        <MenuItem value="task">Задача</MenuItem>
                        <MenuItem value="meeting">Встреча</MenuItem>
                        <MenuItem value="deadline">Дедлайн</MenuItem>
                        <MenuItem value="delivery">Поставка</MenuItem>
                        <MenuItem value="inspection">Инспекция</MenuItem>
                        <MenuItem value="training">Обучение</MenuItem>
                        <MenuItem value="holiday">Праздник</MenuItem>
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
                  name="startDate"
                  control={control}
                  defaultValue={selectedDate || new Date()}
                  rules={{ required: 'Укажите дату начала' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата и время начала"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="endDate"
                  control={control}
                  defaultValue={selectedDate ? addDays(selectedDate, 0) : new Date()}
                  rules={{ required: 'Укажите дату окончания' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата и время окончания"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
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
                      placeholder="Где будет проходить событие"
                    />
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
                      <InputLabel>Связанный проект</InputLabel>
                      <Select {...field} label="Связанный проект">
                        <MenuItem value="">Без проекта</MenuItem>
                        <MenuItem value="1">Жилой комплекс "Солнечный"</MenuItem>
                        <MenuItem value="2">Офисный центр "Центральный"</MenuItem>
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
                      placeholder="Подробности события"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="allDay"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Событие на весь день"
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
              {selectedEvent ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;