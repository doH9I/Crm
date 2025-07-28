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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Grid,
  Avatar,
  Alert,
  Tooltip,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  LinearProgress,
  Badge,
  ButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Assignment as ContractIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  FileUpload as ImportIcon,
  CheckCircle as VerifiedIcon,
  Warning as WarningIcon,
  People as TeamIcon,
  TrendingUp as PerformanceIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Subcontractor, WorkType, Project } from '../types';

// Моковые данные подрядчиков
const mockContractors: Subcontractor[] = [
  {
    id: '1',
    companyName: 'ООО "СтройТех"',
    contactPerson: 'Иванов Сергей Петрович',
    email: 'ivanov@stroytech.ru',
    phone: '+7 (495) 123-45-67',
    address: 'г. Москва, ул. Строительная, 15',
    specializations: [WorkType.FOUNDATION, WorkType.CONCRETE, WorkType.EXCAVATION],
    rating: 4.8,
    isActive: true,
    certifications: ['СРО-С-123-456', 'ISO 9001:2015'],
    insurance: {
      provider: 'АльфаСтрахование',
      policyNumber: 'АС-123456789',
      expiryDate: new Date('2024-12-31'),
      coverage: 50000000,
    },
    performance: {
      projectsCompleted: 45,
      averageRating: 4.8,
      onTimeDelivery: 92,
      qualityScore: 88,
    },
    contracts: ['1', '2'],
    documents: ['doc1', 'doc2'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    companyName: 'ИП Петров В.И.',
    contactPerson: 'Петров Владимир Иванович',
    email: 'petrov@email.ru',
    phone: '+7 (926) 234-56-78',
    address: 'г. Москва, ул. Рабочая, 8, стр. 2',
    specializations: [WorkType.ELECTRICAL, WorkType.PLUMBING],
    rating: 4.5,
    isActive: true,
    certifications: ['Электробезопасность 3 группа'],
    insurance: {
      provider: 'РЕСО-Гарантия',
      policyNumber: 'РГ-987654321',
      expiryDate: new Date('2024-08-15'),
      coverage: 10000000,
    },
    performance: {
      projectsCompleted: 78,
      averageRating: 4.5,
      onTimeDelivery: 85,
      qualityScore: 90,
    },
    contracts: ['3'],
    documents: ['doc3'],
    createdAt: new Date('2022-06-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

const ContractorsPage: React.FC = () => {
  const [contractors, setContractors] = useState<Subcontractor[]>(mockContractors);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Subcontractor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<Subcontractor>();

  const handleCreateContractor = async (data: Subcontractor) => {
    try {
      const newContractor: Subcontractor = {
        ...data,
        id: Date.now().toString(),
        rating: 0,
        isActive: true,
        performance: {
          projectsCompleted: 0,
          averageRating: 0,
          onTimeDelivery: 0,
          qualityScore: 0,
        },
        contracts: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setContractors(prev => [...prev, newContractor]);
      setOpenDialog(false);
      reset();
      toast.success('Подрядчик успешно добавлен');
    } catch (error) {
      toast.error('Ошибка при добавлении подрядчика');
    }
  };

  const handleEditContractor = async (data: Subcontractor) => {
    if (!selectedContractor) return;
    try {
      setContractors(prev => 
        prev.map(contractor => 
          contractor.id === selectedContractor.id 
            ? { ...contractor, ...data, updatedAt: new Date() }
            : contractor
        )
      );
      setOpenDialog(false);
      setSelectedContractor(null);
      reset();
      toast.success('Подрядчик успешно обновлен');
    } catch (error) {
      toast.error('Ошибка при обновлении подрядчика');
    }
  };

  const handleDeleteContractor = async (contractorId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого подрядчика?')) {
      try {
        setContractors(prev => prev.filter(c => c.id !== contractorId));
        toast.success('Подрядчик удален');
      } catch (error) {
        toast.error('Ошибка при удалении подрядчика');
      }
    }
  };

  const openContractorDialog = (contractor?: Subcontractor) => {
    if (contractor) {
      setSelectedContractor(contractor);
      reset(contractor);
    } else {
      setSelectedContractor(null);
      reset();
    }
    setOpenDialog(true);
  };

  const getSpecializationText = (specialization: WorkType) => {
    const specializationMap = {
      [WorkType.FOUNDATION]: 'Фундаментные работы',
      [WorkType.WALLS]: 'Стеновые работы',
      [WorkType.ROOF]: 'Кровельные работы',
      [WorkType.ELECTRICAL]: 'Электромонтаж',
      [WorkType.PLUMBING]: 'Сантехника',
      [WorkType.HVAC]: 'ОВК',
      [WorkType.FINISHING]: 'Отделочные работы',
      [WorkType.FLOORING]: 'Напольные покрытия',
      [WorkType.PAINTING]: 'Малярные работы',
      [WorkType.LANDSCAPING]: 'Благоустройство',
      [WorkType.CONCRETE]: 'Бетонные работы',
      [WorkType.EXCAVATION]: 'Земляные работы',
      [WorkType.STEEL_WORK]: 'Металлоконструкции',
      [WorkType.MASONRY]: 'Каменная кладка',
      [WorkType.WINDOWS_DOORS]: 'Окна и двери',
      [WorkType.INSULATION]: 'Утепление',
      [WorkType.WATERPROOFING]: 'Гидроизоляция',
      [WorkType.DEMOLITION]: 'Демонтаж',
      [WorkType.SECURITY_SYSTEMS]: 'Системы безопасности',
      [WorkType.CLEANING]: 'Уборка',
      [WorkType.INSPECTION]: 'Контроль качества',
      [WorkType.OTHER]: 'Прочее',
    };
    return specializationMap[specialization] || specialization;
  };

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = filterSpecialization === 'all' || 
      contractor.specializations.includes(filterSpecialization as WorkType);
      
    const matchesRating = filterRating === 'all' || 
      (filterRating === '4+' && contractor.rating >= 4) ||
      (filterRating === '3-4' && contractor.rating >= 3 && contractor.rating < 4) ||
      (filterRating === '0-3' && contractor.rating < 3);
    
    return matchesSearch && matchesSpecialization && matchesRating;
  });

  const contractorStats = {
    total: contractors.length,
    active: contractors.filter(c => c.isActive).length,
    highRated: contractors.filter(c => c.rating >= 4.5).length,
    verified: contractors.filter(c => c.certifications.length > 0).length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Подрядчики
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={() => toast.info('Функция импорта будет добавлена')}
          >
            Импорт
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => toast.info('Функция экспорта будет добавлена')}
          >
            Экспорт
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openContractorDialog()}
          >
            Добавить подрядчика
          </Button>
        </Box>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {contractorStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего подрядчиков
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TeamIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {contractorStats.active}
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
              <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {contractorStats.highRated}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                С высоким рейтингом
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <VerifiedIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {contractorStats.verified}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Сертифицированных
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Поиск по названию, контактному лицу или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Специализация</InputLabel>
                <Select
                  value={filterSpecialization}
                  onChange={(e) => setFilterSpecialization(e.target.value)}
                  label="Специализация"
                >
                  <MenuItem value="all">Все специализации</MenuItem>
                  <MenuItem value={WorkType.FOUNDATION}>Фундаментные работы</MenuItem>
                  <MenuItem value={WorkType.ELECTRICAL}>Электромонтаж</MenuItem>
                  <MenuItem value={WorkType.PLUMBING}>Сантехника</MenuItem>
                  <MenuItem value={WorkType.CONCRETE}>Бетонные работы</MenuItem>
                  <MenuItem value={WorkType.FINISHING}>Отделочные работы</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Рейтинг</InputLabel>
                <Select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  label="Рейтинг"
                >
                  <MenuItem value="all">Любой рейтинг</MenuItem>
                  <MenuItem value="4+">4+ звезды</MenuItem>
                  <MenuItem value="3-4">3-4 звезды</MenuItem>
                  <MenuItem value="0-3">Менее 3 звезд</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterSpecialization('all');
                  setFilterRating('all');
                }}
              >
                Сбросить
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Таблица подрядчиков */}
      <Card>
        <CardContent>
          {loading ? (
            <LinearProgress />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Компания</TableCell>
                    <TableCell>Контактное лицо</TableCell>
                    <TableCell>Специализация</TableCell>
                    <TableCell>Рейтинг</TableCell>
                    <TableCell>Проекты</TableCell>
                    <TableCell>Производительность</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredContractors.map((contractor) => (
                    <TableRow key={contractor.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {contractor.companyName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {contractor.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {contractor.contactPerson}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {contractor.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {contractor.specializations.slice(0, 2).map((spec) => (
                            <Chip 
                              key={spec}
                              label={getSpecializationText(spec)} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                          {contractor.specializations.length > 2 && (
                            <Chip 
                              label={`+${contractor.specializations.length - 2}`} 
                              size="small" 
                              variant="outlined"
                              color="primary"
                            />
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating 
                            value={contractor.rating} 
                            readOnly 
                            size="small" 
                            precision={0.1}
                          />
                          <Typography variant="body2" color="text.secondary">
                            ({contractor.rating.toFixed(1)})
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {contractor.performance.projectsCompleted}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          завершено
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                            <Typography variant="body2">
                              {contractor.performance.onTimeDelivery}% в срок
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PerformanceIcon sx={{ fontSize: 14, color: 'info.main' }} />
                            <Typography variant="body2">
                              {contractor.performance.qualityScore}% качество
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={contractor.isActive ? 'Активен' : 'Неактивен'} 
                            color={contractor.isActive ? 'success' : 'default'}
                            size="small"
                          />
                          {contractor.certifications.length > 0 && (
                            <Tooltip title="Сертифицирован">
                              <VerifiedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <ButtonGroup variant="outlined" size="small">
                          <Tooltip title="Просмотр">
                            <IconButton 
                              size="small"
                              onClick={() => toast.info('Функция просмотра будет добавлена')}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Редактировать">
                            <IconButton 
                              size="small"
                              onClick={() => openContractorDialog(contractor)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Контракты">
                            <IconButton 
                              size="small"
                              onClick={() => toast.info('Функция управления контрактами будет добавлена')}
                            >
                              <ContractIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Удалить">
                            <IconButton 
                              size="small"
                              color="error"
                              onClick={() => handleDeleteContractor(contractor.id)}
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
          )}
          
          {filteredContractors.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {searchTerm || filterSpecialization !== 'all' || filterRating !== 'all' 
                  ? 'Подрядчики не найдены' 
                  : 'Нет добавленных подрядчиков'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || filterSpecialization !== 'all' || filterRating !== 'all'
                  ? 'Попробуйте изменить параметры поиска или фильтров'
                  : 'Начните с добавления первого подрядчика'}
              </Typography>
              {!searchTerm && filterSpecialization === 'all' && filterRating === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openContractorDialog()}
                >
                  Добавить подрядчика
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Диалог создания/редактирования подрядчика */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(selectedContractor ? handleEditContractor : handleCreateContractor)}>
          <DialogTitle>
            {selectedContractor ? 'Редактировать подрядчика' : 'Добавить подрядчика'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="companyName"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Название компании обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Название компании"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="contactPerson"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Контактное лицо обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Контактное лицо"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  rules={{ 
                    required: 'Email обязателен',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Некорректный email'
                    }
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="phone"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Телефон обязателен' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Телефон"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Адрес обязателен' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Адрес"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="specializations"
                  control={control}
                  defaultValue={[]}
                  rules={{ required: 'Выберите хотя бы одну специализацию' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Специализации</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Специализации"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as WorkType[]).map((value) => (
                              <Chip key={value} label={getSpecializationText(value)} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        <MenuItem value={WorkType.FOUNDATION}>Фундаментные работы</MenuItem>
                        <MenuItem value={WorkType.WALLS}>Стеновые работы</MenuItem>
                        <MenuItem value={WorkType.ROOF}>Кровельные работы</MenuItem>
                        <MenuItem value={WorkType.ELECTRICAL}>Электромонтаж</MenuItem>
                        <MenuItem value={WorkType.PLUMBING}>Сантехника</MenuItem>
                        <MenuItem value={WorkType.HVAC}>ОВК</MenuItem>
                        <MenuItem value={WorkType.FINISHING}>Отделочные работы</MenuItem>
                        <MenuItem value={WorkType.CONCRETE}>Бетонные работы</MenuItem>
                        <MenuItem value={WorkType.EXCAVATION}>Земляные работы</MenuItem>
                      </Select>
                      {fieldState.error && (
                        <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                          {fieldState.error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="insurance.provider"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Страховая компания"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="insurance.policyNumber"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Номер полиса"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="insurance.expiryDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата окончания страховки"
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
                  name="insurance.coverage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Страховое покрытие"
                      type="number"
                      InputProps={{
                        endAdornment: '₽',
                      }}
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
              {selectedContractor ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ContractorsPage;