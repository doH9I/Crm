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
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
  Menu,
  ButtonGroup,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as ToolIcon,
  Assignment as AssignIcon,
  Settings as MaintenanceIcon,
  QrCode as QrCodeIcon,
  Photo as PhotoIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  MoreVert as MoreIcon,
  GetApp as ExportIcon,
  FileUpload as ImportIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToolStore, useMaterialStore, useAuthStore } from '../store';
import { Tool, ToolCondition, ToolStatus, Equipment, MaintenanceRecord } from '../types';

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
      id={`tools-tabpanel-${index}`}
      aria-labelledby={`tools-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openMaintenanceDialog, setOpenMaintenanceDialog] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { 
    tools, 
    equipment, 
    loading, 
    fetchTools, 
    fetchEquipment, 
    createTool, 
    updateTool, 
    deleteTool, 
    assignTool, 
    returnTool 
  } = useToolStore();
  
  const { suppliers } = useMaterialStore();
  const { user } = useAuthStore();

  const { control, handleSubmit, reset, watch, setValue } = useForm<Tool>();
  const { control: assignControl, handleSubmit: handleAssignSubmit, reset: resetAssign } = useForm();
  const { control: maintenanceControl, handleSubmit: handleMaintenanceSubmit, reset: resetMaintenance } = useForm();

  useEffect(() => {
    fetchTools();
    fetchEquipment();
  }, [fetchTools, fetchEquipment]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateTool = async (data: Tool) => {
    try {
      await createTool({
        ...data,
        usageHours: data.usageHours || 0,
        maintenanceInterval: data.maintenanceInterval || 90,
        status: data.status || ToolStatus.AVAILABLE,
        condition: data.condition || ToolCondition.GOOD,
        isActive: true,
      });
      setOpenDialog(false);
      reset();
      toast.success('Инструмент успешно добавлен');
    } catch (error) {
      toast.error('Ошибка при добавлении инструмента');
    }
  };

  const handleEditTool = async (data: Tool) => {
    if (!selectedTool) return;
    try {
      await updateTool(selectedTool.id, data);
      setOpenDialog(false);
      setSelectedTool(null);
      reset();
      toast.success('Инструмент успешно обновлен');
    } catch (error) {
      toast.error('Ошибка при обновлении инструмента');
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот инструмент?')) {
      try {
        await deleteTool(toolId);
        toast.success('Инструмент удален');
      } catch (error) {
        toast.error('Ошибка при удалении инструмента');
      }
    }
  };

  const handleAssignTool = async (data: any) => {
    if (!selectedTool) return;
    try {
      await assignTool(selectedTool.id, data.userId);
      setOpenAssignDialog(false);
      setSelectedTool(null);
      resetAssign();
      toast.success('Инструмент назначен сотруднику');
    } catch (error) {
      toast.error('Ошибка при назначении инструмента');
    }
  };

  const handleReturnTool = async (toolId: string) => {
    try {
      await returnTool(toolId);
      toast.success('Инструмент возвращен');
    } catch (error) {
      toast.error('Ошибка при возврате инструмента');
    }
  };

  const openToolDialog = (tool?: Tool) => {
    if (tool) {
      setSelectedTool(tool);
      reset(tool);
    } else {
      setSelectedTool(null);
      reset();
    }
    setOpenDialog(true);
  };

  const getStatusColor = (status: ToolStatus) => {
    switch (status) {
      case ToolStatus.AVAILABLE:
        return 'success';
      case ToolStatus.IN_USE:
        return 'primary';
      case ToolStatus.MAINTENANCE:
        return 'warning';
      case ToolStatus.REPAIR:
        return 'error';
      case ToolStatus.RETIRED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getConditionColor = (condition: ToolCondition) => {
    switch (condition) {
      case ToolCondition.NEW:
        return 'success';
      case ToolCondition.EXCELLENT:
        return 'primary';
      case ToolCondition.GOOD:
        return 'info';
      case ToolCondition.FAIR:
        return 'warning';
      case ToolCondition.POOR:
        return 'error';
      case ToolCondition.BROKEN:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: ToolStatus) => {
    const statusMap = {
      [ToolStatus.AVAILABLE]: 'Доступен',
      [ToolStatus.IN_USE]: 'В использовании',
      [ToolStatus.MAINTENANCE]: 'На обслуживании',
      [ToolStatus.REPAIR]: 'В ремонте',
      [ToolStatus.RETIRED]: 'Списан',
      [ToolStatus.LOST]: 'Утерян',
      [ToolStatus.STOLEN]: 'Украден',
    };
    return statusMap[status] || status;
  };

  const getConditionText = (condition: ToolCondition) => {
    const conditionMap = {
      [ToolCondition.NEW]: 'Новый',
      [ToolCondition.EXCELLENT]: 'Отличное',
      [ToolCondition.GOOD]: 'Хорошее',
      [ToolCondition.FAIR]: 'Удовлетворительное',
      [ToolCondition.POOR]: 'Плохое',
      [ToolCondition.BROKEN]: 'Сломан',
      [ToolCondition.MAINTENANCE]: 'На обслуживании',
    };
    return conditionMap[condition] || condition;
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.inventoryNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || tool.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || tool.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const toolCategories = [...new Set(tools.map(tool => tool.category))];

  const toolStats = {
    total: tools.length,
    available: tools.filter(t => t.status === ToolStatus.AVAILABLE).length,
    inUse: tools.filter(t => t.status === ToolStatus.IN_USE).length,
    maintenance: tools.filter(t => t.status === ToolStatus.MAINTENANCE).length,
    needingMaintenance: tools.filter(t => {
      if (!t.nextMaintenanceDate) return false;
      return new Date(t.nextMaintenanceDate) <= addDays(new Date(), 7);
    }).length,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Инструменты и оборудование
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
            onClick={() => openToolDialog()}
          >
            Добавить инструмент
          </Button>
        </Box>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ToolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {toolStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего инструментов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {toolStats.available}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Доступно
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {toolStats.inUse}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                В использовании
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MaintenanceIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {toolStats.maintenance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                На обслуживании
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {toolStats.needingMaintenance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Требует ТО
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {toolStats.needingMaintenance > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          У вас есть {toolStats.needingMaintenance} инструментов, требующих технического обслуживания в ближайшие 7 дней.
        </Alert>
      )}

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Поиск по названию, категории или инвентарному номеру..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="all">Все статусы</MenuItem>
                  <MenuItem value={ToolStatus.AVAILABLE}>Доступен</MenuItem>
                  <MenuItem value={ToolStatus.IN_USE}>В использовании</MenuItem>
                  <MenuItem value={ToolStatus.MAINTENANCE}>На обслуживании</MenuItem>
                  <MenuItem value={ToolStatus.REPAIR}>В ремонте</MenuItem>
                  <MenuItem value={ToolStatus.RETIRED}>Списан</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Категория"
                >
                  <MenuItem value="all">Все категории</MenuItem>
                  {toolCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
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
                  setFilterStatus('all');
                  setFilterCategory('all');
                }}
              >
                Сбросить
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Таблица инструментов */}
      <Card>
        <CardContent>
          {loading ? (
            <LinearProgress />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Инструмент</TableCell>
                    <TableCell>Инвентарный №</TableCell>
                    <TableCell>Категория</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Состояние</TableCell>
                    <TableCell>Местоположение</TableCell>
                    <TableCell>Назначен</TableCell>
                    <TableCell>Следующее ТО</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTools.map((tool) => (
                    <TableRow key={tool.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <ToolIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {tool.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {tool.brand} {tool.model}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {tool.inventoryNumber}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={tool.category} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={getStatusText(tool.status)} 
                          color={getStatusColor(tool.status)}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={getConditionText(tool.condition)} 
                          color={getConditionColor(tool.condition)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {tool.location || 'Не указано'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        {tool.assignedTo ? (
                          <Chip 
                            label="Назначен" 
                            color="primary" 
                            size="small"
                            icon={<PersonIcon />}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Свободен
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {tool.nextMaintenanceDate ? (
                          <Typography 
                            variant="body2"
                            color={new Date(tool.nextMaintenanceDate) <= addDays(new Date(), 7) ? 'error' : 'inherit'}
                          >
                            {format(new Date(tool.nextMaintenanceDate), 'dd.MM.yyyy', { locale: ru })}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Не назначено
                          </Typography>
                        )}
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
                              onClick={() => openToolDialog(tool)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {tool.status === ToolStatus.AVAILABLE ? (
                            <Tooltip title="Назначить">
                              <IconButton 
                                size="small"
                                onClick={() => {
                                  setSelectedTool(tool);
                                  setOpenAssignDialog(true);
                                }}
                              >
                                <AssignIcon />
                              </IconButton>
                            </Tooltip>
                          ) : tool.status === ToolStatus.IN_USE ? (
                            <Tooltip title="Вернуть">
                              <IconButton 
                                size="small"
                                onClick={() => handleReturnTool(tool.id)}
                              >
                                <CheckIcon />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                          
                          <Tooltip title="Техобслуживание">
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setSelectedTool(tool);
                                setOpenMaintenanceDialog(true);
                              }}
                            >
                              <MaintenanceIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Удалить">
                            <IconButton 
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTool(tool.id)}
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
          
          {filteredTools.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ToolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                  ? 'Инструменты не найдены' 
                  : 'Нет добавленных инструментов'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                  ? 'Попробуйте изменить параметры поиска или фильтров'
                  : 'Начните с добавления первого инструмента'}
              </Typography>
              {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openToolDialog()}
                >
                  Добавить инструмент
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Диалог создания/редактирования инструмента */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(selectedTool ? handleEditTool : handleCreateTool)}>
          <DialogTitle>
            {selectedTool ? 'Редактировать инструмент' : 'Добавить инструмент'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Название обязательно' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Название инструмента"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="inventoryNumber"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Инвентарный номер обязателен' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Инвентарный номер"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="category"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Категория обязательна' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Категория</InputLabel>
                      <Select {...field} label="Категория">
                        <MenuItem value="Электроинструмент">Электроинструмент</MenuItem>
                        <MenuItem value="Ручной инструмент">Ручной инструмент</MenuItem>
                        <MenuItem value="Измерительный инструмент">Измерительный инструмент</MenuItem>
                        <MenuItem value="Строительная техника">Строительная техника</MenuItem>
                        <MenuItem value="Садовый инструмент">Садовый инструмент</MenuItem>
                        <MenuItem value="Другое">Другое</MenuItem>
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
                  name="brand"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Бренд"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="model"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Модель"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="serialNumber"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Серийный номер"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  defaultValue={ToolStatus.AVAILABLE}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Статус</InputLabel>
                      <Select {...field} label="Статус">
                        <MenuItem value={ToolStatus.AVAILABLE}>Доступен</MenuItem>
                        <MenuItem value={ToolStatus.IN_USE}>В использовании</MenuItem>
                        <MenuItem value={ToolStatus.MAINTENANCE}>На обслуживании</MenuItem>
                        <MenuItem value={ToolStatus.REPAIR}>В ремонте</MenuItem>
                        <MenuItem value={ToolStatus.RETIRED}>Списан</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="condition"
                  control={control}
                  defaultValue={ToolCondition.GOOD}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Состояние</InputLabel>
                      <Select {...field} label="Состояние">
                        <MenuItem value={ToolCondition.NEW}>Новый</MenuItem>
                        <MenuItem value={ToolCondition.EXCELLENT}>Отличное</MenuItem>
                        <MenuItem value={ToolCondition.GOOD}>Хорошее</MenuItem>
                        <MenuItem value={ToolCondition.FAIR}>Удовлетворительное</MenuItem>
                        <MenuItem value={ToolCondition.POOR}>Плохое</MenuItem>
                        <MenuItem value={ToolCondition.BROKEN}>Сломан</MenuItem>
                      </Select>
                    </FormControl>
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
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="zone"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Зона"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="purchaseDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата покупки"
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
                  name="purchasePrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Цена покупки"
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
                  name="maintenanceInterval"
                  control={control}
                  defaultValue={90}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Интервал ТО (дни)"
                      type="number"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="usageHours"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Часы использования"
                      type="number"
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
              
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Примечания"
                      multiline
                      rows={2}
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
              {selectedTool ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог назначения инструмента */}
      <Dialog 
        open={openAssignDialog} 
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleAssignSubmit(handleAssignTool)}>
          <DialogTitle>
            Назначить инструмент
          </DialogTitle>
          
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Назначение инструмента: <strong>{selectedTool?.name}</strong>
            </Typography>
            
            <Controller
              name="userId"
              control={assignControl}
              defaultValue=""
              rules={{ required: 'Выберите сотрудника' }}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel>Сотрудник</InputLabel>
                  <Select {...field} label="Сотрудник">
                    <MenuItem value="1">Иван Петров</MenuItem>
                    <MenuItem value="2">Анна Сидорова</MenuItem>
                    <MenuItem value="3">Михаил Иванов</MenuItem>
                  </Select>
                  {fieldState.error && (
                    <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                      {fieldState.error.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOpenAssignDialog(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="contained">
              Назначить
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог технического обслуживания */}
      <Dialog 
        open={openMaintenanceDialog} 
        onClose={() => setOpenMaintenanceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Техническое обслуживание: {selectedTool?.name}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Запланировать ТО
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Дата проведения"
                type="date"
                InputLabelProps={{ shrink: true }}
                defaultValue={format(new Date(), 'yyyy-MM-dd')}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Тип обслуживания</InputLabel>
                <Select label="Тип обслуживания" defaultValue="routine">
                  <MenuItem value="routine">Плановое ТО</MenuItem>
                  <MenuItem value="repair">Ремонт</MenuItem>
                  <MenuItem value="calibration">Калибровка</MenuItem>
                  <MenuItem value="inspection">Проверка</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание работ"
                multiline
                rows={3}
                placeholder="Описание выполняемых работ по техническому обслуживанию..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Стоимость"
                type="number"
                InputProps={{
                  endAdornment: '₽',
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Следующее ТО"
                type="date"
                InputLabelProps={{ shrink: true }}
                defaultValue={format(addDays(new Date(), 90), 'yyyy-MM-dd')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpenMaintenanceDialog(false)}>
            Отмена
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              toast.success('Техническое обслуживание запланировано');
              setOpenMaintenanceDialog(false);
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ToolsPage;