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
  Alert,
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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as ResolvedIcon,
  Schedule as PendingIcon,
  Assignment as InvestigatingIcon,
  LocalHospital as InjuryIcon,
  Build as EquipmentIcon,
  Nature as EnvironmentalIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { SafetyIncident } from '../types';

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
      id={`safety-tabpanel-${index}`}
      aria-labelledby={`safety-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Моковые данные инцидентов
const mockIncidents: SafetyIncident[] = [
  {
    id: '1',
    projectId: '1',
    reportedBy: '1',
    date: new Date('2024-01-20'),
    location: 'Участок А, строительная площадка',
    type: 'injury',
    severity: 'medium',
    description: 'Работник получил ушиб при падении строительного материала',
    peopleInvolved: ['emp1'],
    injuries: [
      {
        personId: 'emp1',
        injuryType: 'ушиб',
        bodyPart: 'плечо',
        severity: 'minor',
        medicalAttention: true,
        hospitalName: 'Городская больница №1',
      }
    ],
    immediateAction: 'Оказана первая помощь, вызвана скорая помощь, пострадавший доставлен в больницу',
    rootCause: 'Нарушение правил складирования материалов',
    preventiveMeasures: 'Провести дополнительный инструктаж по технике безопасности, улучшить организацию склада',
    status: 'investigating',
    investigator: '2',
    photos: [],
    documents: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '2',
    projectId: '1',
    reportedBy: '2',
    date: new Date('2024-01-18'),
    location: 'Цех металлообработки',
    type: 'near_miss',
    severity: 'high',
    description: 'Едва не произошло падение груза весом 500 кг из-за обрыва стропа',
    peopleInvolved: ['emp2', 'emp3'],
    immediateAction: 'Работы приостановлены, проведена проверка всех стропов',
    rootCause: 'Износ строповочного оборудования',
    preventiveMeasures: 'Замена всех стропов, ужесточение контроля состояния оборудования',
    status: 'resolved',
    investigator: '2',
    photos: [],
    documents: [],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '3',
    projectId: '2',
    reportedBy: '3',
    date: new Date('2024-01-15'),
    location: 'Офисное здание, 3 этаж',
    type: 'property_damage',
    severity: 'low',
    description: 'Повреждение окна в результате сильного ветра',
    peopleInvolved: [],
    immediateAction: 'Ограждение опасной зоны, временная заделка проема',
    rootCause: 'Некачественный монтаж оконных конструкций',
    preventiveMeasures: 'Проверка качества монтажа всех окон, усиление креплений',
    status: 'closed',
    photos: [],
    documents: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
  },
];

const SafetyPage: React.FC = () => {
  const [incidents, setIncidents] = useState<SafetyIncident[]>(mockIncidents);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const { control, handleSubmit, reset, watch } = useForm<SafetyIncident>();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleCreateIncident = async (data: SafetyIncident) => {
    try {
      const newIncident: SafetyIncident = {
        ...data,
        id: Date.now().toString(),
        status: 'reported',
        photos: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setIncidents(prev => [...prev, newIncident]);
      setOpenDialog(false);
      reset();
      toast.success('Инцидент зарегистрирован');
    } catch (error) {
      toast.error('Ошибка при регистрации инцидента');
    }
  };

  const handleEditIncident = async (data: SafetyIncident) => {
    if (!selectedIncident) return;
    try {
      setIncidents(prev =>
        prev.map(incident =>
          incident.id === selectedIncident.id
            ? { ...incident, ...data, updatedAt: new Date() }
            : incident
        )
      );
      setOpenDialog(false);
      setSelectedIncident(null);
      reset();
      toast.success('Инцидент обновлен');
    } catch (error) {
      toast.error('Ошибка при обновлении инцидента');
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот инцидент?')) {
      try {
        setIncidents(prev => prev.filter(i => i.id !== incidentId));
        toast.success('Инцидент удален');
      } catch (error) {
        toast.error('Ошибка при удалении инцидента');
      }
    }
  };

  const openIncidentDialog = (incident?: SafetyIncident) => {
    if (incident) {
      setSelectedIncident(incident);
      reset(incident);
    } else {
      setSelectedIncident(null);
      reset({
        type: 'injury',
        severity: 'medium',
        date: new Date(),
        peopleInvolved: [],
        injuries: [],
        photos: [],
        documents: [],
      } as any);
    }
    setOpenDialog(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'injury':
        return 'error';
      case 'near_miss':
        return 'warning';
      case 'property_damage':
        return 'info';
      case 'environmental':
        return 'success';
      case 'security':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTypeText = (type: string) => {
    const typeMap = {
      injury: 'Травма',
      near_miss: 'Потенциальная опасность',
      property_damage: 'Ущерб имуществу',
      environmental: 'Экологический',
      security: 'Безопасность',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'injury':
        return <InjuryIcon />;
      case 'near_miss':
        return <WarningIcon />;
      case 'property_damage':
        return <EquipmentIcon />;
      case 'environmental':
        return <EnvironmentalIcon />;
      case 'security':
        return <SecurityIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSeverityText = (severity: string) => {
    const severityMap = {
      critical: 'Критическая',
      high: 'Высокая',
      medium: 'Средняя',
      low: 'Низкая',
    };
    return severityMap[severity as keyof typeof severityMap] || severity;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return 'info';
      case 'investigating':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      reported: 'Зарегистрирован',
      investigating: 'Расследуется',
      resolved: 'Решен',
      closed: 'Закрыт',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reported':
        return <PendingIcon />;
      case 'investigating':
        return <InvestigatingIcon />;
      case 'resolved':
        return <ResolvedIcon />;
      case 'closed':
        return <ResolvedIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || incident.type === filterType;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;

    return matchesSearch && matchesType && matchesStatus && matchesSeverity;
  });

  const incidentStats = {
    total: incidents.length,
    reported: incidents.filter(i => i.status === 'reported').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    thisMonth: incidents.filter(i => {
      const incidentDate = new Date(i.date);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return incidentDate.getMonth() === currentMonth && incidentDate.getFullYear() === currentYear;
    }).length,
  };

  const renderIncidentsList = () => (
    <Box>
      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {incidentStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего инцидентов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PendingIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {incidentStats.reported}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Новых
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <InvestigatingIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {incidentStats.investigating}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Расследуется
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ResolvedIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {incidentStats.resolved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Решены
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {incidentStats.critical}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Критических
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {incidentStats.thisMonth}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                За этот месяц
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {incidentStats.critical > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          У вас есть {incidentStats.critical} критических инцидентов, требующих немедленного внимания!
        </Alert>
      )}

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Поиск по описанию или месту происшествия..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Тип</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Тип"
                >
                  <MenuItem value="all">Все типы</MenuItem>
                  <MenuItem value="injury">Травма</MenuItem>
                  <MenuItem value="near_miss">Потенциальная опасность</MenuItem>
                  <MenuItem value="property_damage">Ущерб имуществу</MenuItem>
                  <MenuItem value="environmental">Экологический</MenuItem>
                  <MenuItem value="security">Безопасность</MenuItem>
                </Select>
              </FormControl>
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
                  <MenuItem value="reported">Зарегистрирован</MenuItem>
                  <MenuItem value="investigating">Расследуется</MenuItem>
                  <MenuItem value="resolved">Решен</MenuItem>
                  <MenuItem value="closed">Закрыт</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Серьезность</InputLabel>
                <Select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  label="Серьезность"
                >
                  <MenuItem value="all">Все уровни</MenuItem>
                  <MenuItem value="critical">Критическая</MenuItem>
                  <MenuItem value="high">Высокая</MenuItem>
                  <MenuItem value="medium">Средняя</MenuItem>
                  <MenuItem value="low">Низкая</MenuItem>
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
                  setFilterType('all');
                  setFilterStatus('all');
                  setFilterSeverity('all');
                }}
              >
                Сбросить фильтры
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Таблица инцидентов */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Инцидент</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Серьезность</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Участники</TableCell>
                  <TableCell>Расследователь</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: getTypeColor(incident.type) + '.main' }}>
                          {getTypeIcon(incident.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {incident.description.length > 50 
                              ? incident.description.substring(0, 50) + '...'
                              : incident.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📍 {incident.location}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getTypeText(incident.type)}
                        color={getTypeColor(incident.type)}
                        size="small"
                        icon={getTypeIcon(incident.type)}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getSeverityText(incident.severity)}
                        color={getSeverityColor(incident.severity)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getStatusText(incident.status)}
                        color={getStatusColor(incident.status)}
                        size="small"
                        icon={getStatusIcon(incident.status)}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(incident.date), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {incident.peopleInvolved.length} чел.
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {incident.investigator ? 'И. Иванов' : 'Не назначен'}
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
                            onClick={() => openIncidentDialog(incident)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteIncident(incident.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredIncidents.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterSeverity !== 'all'
                  ? 'Инциденты не найдены'
                  : 'Нет зарегистрированных инцидентов'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterSeverity !== 'all'
                  ? 'Попробуйте изменить параметры поиска или фильтров'
                  : 'Зарегистрируйте первый инцидент при необходимости'}
              </Typography>
              {!searchTerm && filterType === 'all' && filterStatus === 'all' && filterSeverity === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openIncidentDialog()}
                >
                  Зарегистрировать инцидент
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderSafetyTraining = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Обучение по технике безопасности
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Модуль обучения и сертификации по ТБ будет добавлен в ближайшее время
      </Typography>
    </Box>
  );

  const renderSafetyDocuments = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Документы по безопасности
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Управление документами по технике безопасности будет добавлено в ближайшее время
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Техника безопасности
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openIncidentDialog()}
          color="error"
        >
          Зарегистрировать инцидент
        </Button>
      </Box>

      {/* Вкладки */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="safety tabs">
            <Tab label="Инциденты" />
            <Tab label="Обучение ТБ" />
            <Tab label="Документы" />
            <Tab label="Статистика" />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          {renderIncidentsList()}
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          {renderSafetyTraining()}
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          {renderSafetyDocuments()}
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Статистика безопасности
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Детальная статистика и аналитика по ТБ будет добавлена в ближайшее время
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Диалог регистрации/редактирования инцидента */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(selectedIncident ? handleEditIncident : handleCreateIncident)}>
          <DialogTitle>
            {selectedIncident ? 'Редактировать инцидент' : 'Зарегистрировать новый инцидент'}
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Описание инцидента обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Описание инцидента"
                      multiline
                      rows={3}
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
                  defaultValue="injury"
                  rules={{ required: 'Выберите тип инцидента' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Тип инцидента</InputLabel>
                      <Select {...field} label="Тип инцидента">
                        <MenuItem value="injury">Травма</MenuItem>
                        <MenuItem value="near_miss">Потенциальная опасность</MenuItem>
                        <MenuItem value="property_damage">Ущерб имуществу</MenuItem>
                        <MenuItem value="environmental">Экологический</MenuItem>
                        <MenuItem value="security">Безопасность</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="severity"
                  control={control}
                  defaultValue="medium"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Серьезность</InputLabel>
                      <Select {...field} label="Серьезность">
                        <MenuItem value="low">Низкая</MenuItem>
                        <MenuItem value="medium">Средняя</MenuItem>
                        <MenuItem value="high">Высокая</MenuItem>
                        <MenuItem value="critical">Критическая</MenuItem>
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
                      label="Дата и время инцидента"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
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
                  rules={{ required: 'Укажите место происшествия' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Место происшествия"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
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

              <Grid item xs={12} md={6}>
                <Controller
                  name="reportedBy"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Укажите кто сообщил об инциденте' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Сообщил</InputLabel>
                      <Select {...field} label="Сообщил">
                        <MenuItem value="1">И. Иванов</MenuItem>
                        <MenuItem value="2">П. Петров</MenuItem>
                        <MenuItem value="3">С. Сидоров</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="immediateAction"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Опишите принятые меры' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Принятые немедленные меры"
                      multiline
                      rows={3}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="rootCause"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Причина инцидента"
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="preventiveMeasures"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Предупредительные меры"
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Grid>

              {watch('type') === 'injury' && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Информация о травмах
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    При травмах обязательно укажите детали для ведения медицинской отчетности
                  </Alert>
                  {/* Здесь можно добавить поля для информации о травмах */}
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="contained" color="error">
              {selectedIncident ? 'Обновить' : 'Зарегистрировать'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SafetyPage;