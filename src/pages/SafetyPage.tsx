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
  LinearProgress,
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
  Book as BookIcon,
  PlayCircle as PlayCircleIcon,
  EmojiEvents as EmojiEventsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { SafetyIncident, Training, Document } from '../types';
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
    description: 'Рабочий поскользнулся на мокром полу',
    peopleInvolved: ['1'],
    immediateAction: 'Оказана первая помощь, вызвана скорая',
    status: 'resolved',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    projectId: '1',
    reportedBy: '2',
    date: new Date('2024-01-18'),
    location: 'Участок Б, фундамент',
    type: 'near_miss',
    severity: 'high',
    description: 'Почти упал строительный материал с высоты',
    peopleInvolved: ['2', '3'],
    immediateAction: 'Остановлены работы, укреплена конструкция',
    status: 'investigating',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Моковые данные обучения
const mockTrainings: Training[] = [
  {
    id: '1',
    name: 'Безопасность на высоте',
    type: 'safety',
    description: 'Обучение правилам работы на высоте',
    duration: 8,
    instructor: 'И. Иванов',
    location: 'Учебный центр',
    isOnline: false,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-01'),
    status: 'planned',
    participants: [],
    cost: 5000,
    isRequired: true,
    certificate: true,
    projectId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Моковые данные документов
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Инструкция по технике безопасности',
    type: 'other',
    fileUrl: '/documents/safety-instruction.pdf',
    fileName: 'safety-instruction.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    projectId: '1',
    uploadedBy: '1',
    version: 1,
    isLatest: true,
    accessLevel: 'public',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SafetyPage: React.FC = () => {
  const { currentProjectId, isAllProjectsView, selectedProject } = useProjectStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const [openIncidentDialog, setOpenIncidentDialog] = useState(false);
  const [openTrainingDialog, setOpenTrainingDialog] = useState(false);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [incidents, setIncidents] = useState<SafetyIncident[]>(mockIncidents);
  const [trainings, setTrainings] = useState<Training[]>(mockTrainings);
  const [safetyDocuments, setSafetyDocuments] = useState<Document[]>(mockDocuments);

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
      setOpenIncidentDialog(false);
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
      setOpenIncidentDialog(false);
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

  const handleOpenIncidentDialog = (incident?: SafetyIncident) => {
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
    setOpenIncidentDialog(true);
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
      resolved: 'Разрешен',
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
    if (isAllProjectsView) return true;
    if (currentProjectId) return incident.projectId === currentProjectId;
    return true;
  }).filter(incident => {
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

  const filteredTrainings = trainings.filter(training => {
    if (isAllProjectsView) return true;
    if (currentProjectId) return training.projectId === currentProjectId;
    return true;
  });

  const handleOpenTrainingDialog = (training?: Training) => {
    setSelectedTraining(training || null);
    setTrainingDialogOpen(true);
  };

  const closeTrainingDialog = () => {
    setTrainingDialogOpen(false);
    setSelectedTraining(null);
  };

  const getTrainingTypeText = (type: string) => {
    switch (type) {
      case 'safety': return 'Безопасность';
      case 'technical': return 'Техническое';
      case 'compliance': return 'Соответствие';
      case 'software': return 'ПО';
      case 'soft_skills': return 'Навыки';
      default: return type;
    }
  };

  const getTrainingStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Запланировано';
      case 'ongoing': return 'В процессе';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getTrainingStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'planned': return 'info';
      case 'ongoing': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getIncidentTypeText = (type: string) => {
    const typeMap = {
      injury: 'Травма',
      near_miss: 'Почти авария',
      property_damage: 'Повреждение имущества',
      environmental: 'Экологический',
      security: 'Безопасность',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getIncidentSeverityText = (severity: string) => {
    const severityMap = {
      critical: 'Критическая',
      high: 'Высокая',
      medium: 'Средняя',
      low: 'Низкая',
    };
    return severityMap[severity as keyof typeof severityMap] || severity;
  };

  const getDocumentTypeText = (type: string) => {
    const typeMap = {
      contract: 'Договор',
      permit: 'Разрешение',
      certificate: 'Сертификат',
      drawing: 'Чертеж',
      photo: 'Фото',
      report: 'Отчет',
      invoice: 'Счет',
      other: 'Другое',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const renderSafetyStatistics = () => {
    const currentYear = new Date().getFullYear();
    const incidentsByType = incidents.reduce((acc: any, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {});

    const incidentsBySeverity = incidents.reduce((acc: any, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {});

    const monthlyIncidents = Array.from({ length: 12 }, (_, i) => {
      const count = incidents.filter(incident => {
        const incidentDate = new Date(incident.date);
        return incidentDate.getMonth() === i && incidentDate.getFullYear() === currentYear;
      }).length;
      return { month: i + 1, count };
    });

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика инцидентов
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {incidentStats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Всего инцидентов
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error">
                      {incidentStats.critical}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Критических
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info">
                      {incidentStats.thisMonth}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      В этом месяце
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success">
                      {Math.floor((Date.now() - Math.max(...incidents.map(i => new Date(i.date).getTime()))) / (1000 * 60 * 60 * 24))}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Дней без инцидентов
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                По типам инцидентов
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.keys(incidentsByType).map((type) => (
                  <Box key={type} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {getIncidentTypeText(type)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {incidentsByType[type]}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(incidentsByType[type] / incidents.length) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                По серьезности
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.keys(incidentsBySeverity).map((severity) => (
                  <Box key={severity} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {getIncidentSeverityText(severity)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {incidentsBySeverity[severity]}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(incidentsBySeverity[severity] / incidents.length) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Инциденты по месяцам
              </Typography>
              <Box sx={{ mt: 2 }}>
                {monthlyIncidents.map((data) => (
                  <Box key={data.month} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {new Date(2024, data.month - 1).toLocaleDateString('ru-RU', { month: 'long' })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {data.count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(data.count / Math.max(...monthlyIncidents.map(d => d.count))) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderIncidentsList = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Инциденты ({filteredIncidents.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenIncidentDialog()}
          >
            Сообщить инцидент
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Поиск инцидентов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
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
                  <MenuItem value="injury">Травмы</MenuItem>
                  <MenuItem value="near_miss">Почти аварии</MenuItem>
                  <MenuItem value="property_damage">Ущерб имуществу</MenuItem>
                  <MenuItem value="environmental">Экологические</MenuItem>
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
                  <MenuItem value="resolved">Разрешен</MenuItem>
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
          </Grid>
        </Box>

        {filteredIncidents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Инциденты не найдены
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Место</TableCell>
                  <TableCell>Серьезность</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      {format(new Date(incident.date), 'dd.MM.yyyy', { locale: ru })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getTypeIcon(incident.type)}
                        label={getTypeText(incident.type)}
                        color={getTypeColor(incident.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{incident.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={getSeverityText(incident.severity)}
                        color={getSeverityColor(incident.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(incident.status)}
                        label={getStatusText(incident.status)}
                        color={getStatusColor(incident.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenIncidentDialog(incident)}>
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenIncidentDialog(incident)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteIncident(incident.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );

  const renderSafetyTraining = () => {
    const trainingStats = {
      total: mockTrainings.length,
      planned: mockTrainings.filter(t => t.status === 'planned').length,
      ongoing: mockTrainings.filter(t => t.status === 'ongoing').length,
      completed: mockTrainings.filter(t => t.status === 'completed').length,
    };

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Обучение безопасности
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenTrainingDialog()}
            >
              Добавить обучение
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {trainingStats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего курсов
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info">
                  {trainingStats.planned}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Запланировано
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning">
                  {trainingStats.ongoing}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  В процессе
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success">
                  {trainingStats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Завершено
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {filteredTrainings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Курсы обучения не найдены
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Инструктор</TableCell>
                    <TableCell>Дата</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTrainings.map((training) => (
                    <TableRow key={training.id}>
                      <TableCell>{training.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={getTrainingTypeText(training.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{training.instructor}</TableCell>
                      <TableCell>
                        {format(new Date(training.startDate), 'dd.MM.yyyy', { locale: ru })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getTrainingStatusText(training.status)}
                          color={getTrainingStatusColor(training.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleOpenTrainingDialog(training)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpenTrainingDialog(training)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSafetyDocuments = () => {
    const filteredDocuments = safetyDocuments.filter(document => {
      if (isAllProjectsView) return true;
      if (currentProjectId) return document.projectId === currentProjectId;
      return true;
    });

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Документы по безопасности
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDocumentDialog(true)}
            >
              Добавить документ
            </Button>
          </Box>

          {filteredDocuments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Документы не найдены
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Размер</TableCell>
                    <TableCell>Загружен</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>{document.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={getDocumentTypeText(document.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {(document.fileSize / 1024 / 1024).toFixed(2)} МБ
                      </TableCell>
                      <TableCell>
                        {format(new Date(document.createdAt), 'dd.MM.yyyy', { locale: ru })}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Безопасность и охрана труда
          </Typography>
          <ProjectSelector />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenIncidentDialog(null)}
        >
          Сообщить инцидент
        </Button>
      </Box>

      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Статистика" />
        <Tab label="Инциденты" />
        <Tab label="Обучение" />
        <Tab label="Документы" />
      </Tabs>

      <TabPanel value={selectedTab} index={0}>
        {renderSafetyStatistics()}
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {renderIncidentsList()}
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {renderSafetyTraining()}
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        {renderSafetyDocuments()}
      </TabPanel>

      {/* Диалог создания/редактирования инцидента */}
      <Dialog open={openIncidentDialog} onClose={() => setOpenIncidentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedIncident ? 'Редактировать инцидент' : 'Сообщить инцидент'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(selectedIncident ? handleEditIncident : handleCreateIncident)}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="type"
                  control={control}
                  defaultValue="injury"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Тип инцидента</InputLabel>
                      <Select {...field} label="Тип инцидента">
                        <MenuItem value="injury">Травма</MenuItem>
                        <MenuItem value="near_miss">Почти авария</MenuItem>
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
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Описание инцидента"
                      multiline
                      rows={4}
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
                      label="Место происшествия"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIncidentDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(selectedIncident ? handleEditIncident : handleCreateIncident)}
          >
            {selectedIncident ? 'Обновить' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SafetyPage;