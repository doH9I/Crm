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

// Моковые данные для обучения
const mockTrainings: Training[] = [
  {
    id: '1',
    name: 'Основы техники безопасности на стройплощадке',
    type: 'safety',
    description: 'Базовый курс по технике безопасности для всех работников строительной площадки',
    duration: 8,
    instructor: 'Иванов А.П.',
    location: 'Конференц-зал, офис',
    isOnline: false,
    maxParticipants: 20,
    startDate: new Date('2024-02-10'),
    endDate: new Date('2024-02-10'),
    status: 'completed',
    materials: ['Презентация', 'Видеоматериалы', 'Тестовые задания'],
    participants: [
      { userId: '1', status: 'completed', score: 95, certificateUrl: '/certificates/cert1.pdf', completedAt: new Date('2024-02-10') },
      { userId: '2', status: 'completed', score: 88, certificateUrl: '/certificates/cert2.pdf', completedAt: new Date('2024-02-10') },
      { userId: '3', status: 'completed', score: 92, certificateUrl: '/certificates/cert3.pdf', completedAt: new Date('2024-02-10') },
    ],
    cost: 15000,
    isRequired: true,
    certificate: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '2',
    name: 'Работа на высоте',
    type: 'safety',
    description: 'Специализированный курс для работников, выполняющих работы на высоте',
    duration: 12,
    instructor: 'Петров В.И.',
    location: 'Учебный полигон',
    isOnline: false,
    maxParticipants: 15,
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-02-16'),
    status: 'ongoing',
    materials: ['Практические занятия', 'Проверка оборудования', 'Экзамен'],
    participants: [
      { userId: '4', status: 'enrolled' },
      { userId: '5', status: 'enrolled' },
      { userId: '6', status: 'enrolled' },
    ],
    cost: 25000,
    isRequired: true,
    certificate: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: '3',
    name: 'Пожарная безопасность',
    type: 'safety',
    description: 'Обучение мерам пожарной безопасности и действиям при пожаре',
    duration: 4,
    instructor: 'Сидоров М.К.',
    location: '',
    isOnline: true,
    maxParticipants: 50,
    startDate: new Date('2024-02-20'),
    endDate: new Date('2024-02-20'),
    status: 'planned',
    materials: ['Онлайн-курс', 'Тестирование'],
    participants: [],
    cost: 8000,
    isRequired: true,
    certificate: true,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
];

// Моковые данные для документов ТБ
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Инструкция по технике безопасности при работе на высоте',
    type: 'other',
    category: 'instruction',
    description: 'Подробная инструкция по безопасному выполнению работ на высоте',
    fileUrl: '/documents/safety/work_at_height.pdf',
    fileName: 'work_at_height_instruction.pdf',
    fileSize: 2456789,
    mimeType: 'application/pdf',
    uploadedBy: 'admin',
    version: 3,
    isLatest: true,
    tags: ['высота', 'безопасность', 'инструкция'],
    expiryDate: new Date('2024-12-31'),
    accessLevel: 'internal',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Сертификат соответствия СИЗ',
    type: 'certificate',
    category: 'standard',
    description: 'Сертификат на средства индивидуальной защиты',
    fileUrl: '/documents/certificates/siz_cert.pdf',
    fileName: 'siz_certificate_2024.pdf',
    fileSize: 1234567,
    mimeType: 'application/pdf',
    uploadedBy: 'admin',
    version: 1,
    isLatest: true,
    tags: ['СИЗ', 'сертификат', 'безопасность'],
    expiryDate: new Date('2025-06-30'),
    accessLevel: 'public',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'Политика безопасности компании',
    type: 'other',
    category: 'policy',
    description: 'Основные принципы и политика безопасности',
    fileUrl: '/documents/policies/safety_policy.pdf',
    fileName: 'company_safety_policy_v2.pdf',
    fileSize: 987654,
    mimeType: 'application/pdf',
    uploadedBy: 'admin',
    version: 2,
    isLatest: true,
    tags: ['политика', 'безопасность', 'компания'],
    accessLevel: 'internal',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    name: 'Разрешение на огневые работы',
    type: 'permit',
    category: 'procedure',
    description: 'Типовое разрешение на проведение огневых работ',
    fileUrl: '/documents/permits/fire_work_permit.pdf',
    fileName: 'fire_work_permit_template.pdf',
    fileSize: 567890,
    mimeType: 'application/pdf',
    uploadedBy: 'admin',
    version: 1,
    isLatest: true,
    tags: ['огневые работы', 'разрешение', 'безопасность'],
    expiryDate: new Date('2024-03-15'),
    accessLevel: 'restricted',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
];

const SafetyPage: React.FC = () => {
  const { currentProjectId, isAllProjectsView, selectedProject, projects } = useProjectStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const [openIncidentDialog, setOpenIncidentDialog] = useState(false);
  const [openTrainingDialog, setOpenTrainingDialog] = useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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

  const openTrainingDialog = (training?: Training) => {
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

  const filteredSafetyDocuments = safetyDocuments.filter(document => {
    if (isAllProjectsView) return true;
    if (currentProjectId) return document.projectId === currentProjectId;
    return true;
  }).filter(document => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || document.type === filterType;
    const matchesCategory = filterStatus === 'all' || document.category === filterStatus;

    return matchesSearch && matchesType && matchesCategory;
  });

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'certificate': return 'Сертификат';
      case 'permit': return 'Разрешение';
      case 'report': return 'Отчет';
      case 'drawing': return 'Чертеж';
      case 'photo': return 'Фото';
      case 'invoice': return 'Счет';
      case 'contract': return 'Договор';
      case 'other': return 'Другое';
      default: return type;
    }
  };

  const renderSafetyStatistics = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Статистика по инцидентам
    const incidentsByType = incidents.reduce((acc: any, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {});

    const incidentsBySeverity = incidents.reduce((acc: any, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {});

    const monthlyIncidents = Array.from({ length: 12 }, (_, i) => {
      const month = i;
      const count = incidents.filter(incident => {
        const incidentDate = new Date(incident.date);
        return incidentDate.getFullYear() === currentYear && incidentDate.getMonth() === month;
      }).length;
      return { month: i + 1, count };
    });

    // Статистика по обучению
    const totalParticipants = trainings.reduce((acc, training) => acc + training.participants.length, 0);
    const completedCertificates = trainings.reduce((acc, training) => 
      acc + training.participants.filter(p => p.status === 'completed').length, 0);

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3 }}>Статистика и аналитика ТБ</Typography>

        {/* Общая статистика */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Инциденты за год
                    </Typography>
                    <Typography variant="h4" component="div">
                      {incidents.filter(i => new Date(i.date).getFullYear() === currentYear).length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                    <WarningIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Дней без инцидентов
                    </Typography>
                    <Typography variant="h4" component="div">
                      {Math.floor((Date.now() - Math.max(...incidents.map(i => new Date(i.date).getTime()))) / (1000 * 60 * 60 * 24))}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <CheckCircleIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Обученных сотрудников
                    </Typography>
                    <Typography variant="h4" component="div">
                      {totalParticipants}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                    <BookIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Выдано сертификатов
                    </Typography>
                    <Typography variant="h4" component="div">
                      {completedCertificates}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                    <EmojiEventsIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Диаграммы */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Инциденты по типам</Typography>
                <Box sx={{ height: 300 }}>
                  {Object.keys(incidentsByType).map((type, index) => (
                    <Box key={type} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{getIncidentTypeText(type)}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(incidentsByType[type] / incidents.length) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ ml: 2, minWidth: 30 }}>
                        {incidentsByType[type]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Инциденты по степени тяжести</Typography>
                <Box sx={{ height: 300 }}>
                  {Object.keys(incidentsBySeverity).map((severity, index) => (
                    <Box key={severity} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{getIncidentSeverityText(severity)}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(incidentsBySeverity[severity] / incidents.length) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                          color={severity === 'critical' ? 'error' : severity === 'high' ? 'warning' : 'success'}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ ml: 2, minWidth: 30 }}>
                        {incidentsBySeverity[severity]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Динамика инцидентов по месяцам</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'end', gap: 1 }}>
                  {monthlyIncidents.map((data, index) => (
                    <Box
                      key={data.month}
                      sx={{
                        flex: 1,
                        height: `${Math.max(10, (data.count / Math.max(...monthlyIncidents.map(m => m.count))) * 100)}%`,
                        backgroundColor: 'primary.main',
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'end',
                        alignItems: 'center',
                        p: 1,
                        color: 'white',
                        position: 'relative'
                      }}
                    >
                      <Typography variant="caption" sx={{ mb: 1 }}>{data.count}</Typography>
                      <Typography variant="caption" sx={{ position: 'absolute', bottom: -20, color: 'text.primary' }}>
                        {data.month}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
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

  const renderSafetyTraining = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Обучение и сертификация</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openTrainingDialog()}
          >
            Создать курс
          </Button>
        </Box>

        {/* Статистика обучения */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { label: 'Всего курсов', value: mockTrainings.length, color: 'primary', icon: <BookIcon /> },
            { label: 'Активных', value: mockTrainings.filter(t => t.status === 'ongoing').length, color: 'success', icon: <PlayCircleIcon /> },
            { label: 'Завершенных', value: mockTrainings.filter(t => t.status === 'completed').length, color: 'info', icon: <CheckCircleIcon /> },
            { label: 'Сертификатов выдано', value: mockTrainings.reduce((acc, t) => acc + t.participants.filter(p => p.status === 'completed').length, 0), color: 'warning', icon: <EmojiEventsIcon /> }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        {stat.label}
                      </Typography>
                      <Typography variant="h5" component="div">
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${stat.color}.main`, width: 56, height: 56 }}>
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Фильтры */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Поиск курсов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Тип</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Тип"
                  >
                    <MenuItem value="all">Все</MenuItem>
                    <MenuItem value="safety">Безопасность</MenuItem>
                    <MenuItem value="technical">Техническое</MenuItem>
                    <MenuItem value="compliance">Соответствие</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Статус</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Статус"
                  >
                    <MenuItem value="all">Все</MenuItem>
                    <MenuItem value="planned">Запланировано</MenuItem>
                    <MenuItem value="ongoing">В процессе</MenuItem>
                    <MenuItem value="completed">Завершено</MenuItem>
                    <MenuItem value="cancelled">Отменено</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Список курсов */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название курса</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Инструктор</TableCell>
                <TableCell>Дата проведения</TableCell>
                <TableCell>Участники</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTrainings.map((training) => (
                <TableRow key={training.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {training.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {training.duration}ч • {training.isOnline ? 'Онлайн' : training.location}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTrainingTypeText(training.type)}
                      size="small"
                      color={training.type === 'safety' ? 'error' : training.type === 'technical' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{training.instructor || 'Не назначен'}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(training.startDate), 'dd.MM.yyyy', { locale: ru })}
                      {training.endDate && training.startDate !== training.endDate && 
                        ` - ${format(new Date(training.endDate), 'dd.MM.yyyy', { locale: ru })}`
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {training.participants.length}
                        {training.maxParticipants && `/${training.maxParticipants}`}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={training.maxParticipants ? (training.participants.length / training.maxParticipants) * 100 : 100}
                        sx={{ flex: 1, maxWidth: 100 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTrainingStatusText(training.status)}
                      size="small"
                      color={getTrainingStatusColor(training.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Просмотр">
                      <IconButton size="small" onClick={() => openTrainingDialog(training)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton size="small" onClick={() => openTrainingDialog(training)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderSafetyDocuments = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Документы по безопасности</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => console.log('Добавить документ')}
          >
            Добавить документ
          </Button>
        </Box>

        {/* Категории документов */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { label: 'Всего документов', value: mockDocuments.length, color: 'primary', icon: <BookIcon /> },
            { label: 'Сертификаты', value: mockDocuments.filter(d => d.type === 'certificate').length, color: 'success', icon: <EmojiEventsIcon /> },
            { label: 'Инструкции', value: mockDocuments.filter(d => d.category === 'instruction').length, color: 'info', icon: <InfoIcon /> },
            { label: 'Истекают', value: mockDocuments.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length, color: 'warning', icon: <WarningIcon /> }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        {stat.label}
                      </Typography>
                      <Typography variant="h5" component="div">
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${stat.color}.main`, width: 56, height: 56 }}>
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Фильтры */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Поиск документов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Тип</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Тип"
                  >
                    <MenuItem value="all">Все</MenuItem>
                    <MenuItem value="certificate">Сертификаты</MenuItem>
                    <MenuItem value="permit">Разрешения</MenuItem>
                    <MenuItem value="report">Отчеты</MenuItem>
                    <MenuItem value="other">Прочее</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Категория</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Категория"
                  >
                    <MenuItem value="all">Все</MenuItem>
                    <MenuItem value="instruction">Инструкции</MenuItem>
                    <MenuItem value="policy">Политики</MenuItem>
                    <MenuItem value="procedure">Процедуры</MenuItem>
                    <MenuItem value="standard">Стандарты</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Список документов */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название документа</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Размер</TableCell>
                <TableCell>Дата добавления</TableCell>
                <TableCell>Срок действия</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map((document) => (
                <TableRow key={document.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {document.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {document.fileName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getDocumentTypeText(document.type)}
                      size="small"
                      color={document.type === 'certificate' ? 'success' : document.type === 'permit' ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{document.category || 'Не указана'}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {(document.fileSize / 1024 / 1024).toFixed(2)} МБ
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(document.createdAt), 'dd.MM.yyyy', { locale: ru })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {document.expiryDate ? (
                      <Box>
                        <Typography variant="body2">
                          {format(new Date(document.expiryDate), 'dd.MM.yyyy', { locale: ru })}
                        </Typography>
                        {new Date(document.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                          <Chip label="Истекает" size="small" color="warning" />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Бессрочно
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Скачать">
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
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
          onClick={() => openIncidentDialog(null)}
        >
          Сообщить инцидент
        </Button>
      </Box>

      {/* Вкладки */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="safety tabs">
            <Tab label="Обзор" />
            <Tab label="Инциденты" />
            <Tab label="Обучение" />
            <Tab label="Документы" />
          </Tabs>
        </Box>

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
      </Card>

      {/* Диалог регистрации/редактирования инцидента */}
      <Dialog
        open={openIncidentDialog}
        onClose={() => setOpenIncidentDialog(false)}
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
            <Button onClick={() => setOpenIncidentDialog(false)}>
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