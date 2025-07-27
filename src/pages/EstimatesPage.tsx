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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Receipt as EstimateIcon,
  Calculate as CalculateIcon,
  Assignment as TemplateIcon,
  FileCopy as CopyIcon,
  GetApp as DownloadIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useProjectStore, useMaterialStore, useAuthStore } from '../store';
import { formatCurrency } from '../utils';

interface EstimateItem {
  materialId: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

interface EstimateFormData {
  name: string;
  description: string;
  projectId: string;
  clientName: string;
  validUntil: string;
  laborCost: number;
  overheadPercentage: number;
  profitMargin: number;
  vatRate: number;
  items: EstimateItem[];
}

interface Estimate {
  id: string;
  name: string;
  description: string;
  projectId: string;
  clientName: string;
  createdAt: Date;
  validUntil: Date;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  items: EstimateItem[];
  laborCost: number;
  materialsCost: number;
  overheadPercentage: number;
  profitMargin: number;
  vatRate: number;
  subtotal: number;
  overhead: number;
  profit: number;
  vat: number;
  total: number;
  createdBy: string;
}

const EstimatesPage: React.FC = () => {
  const { projects } = useProjectStore();
  const { materials } = useMaterialStore();
  const { user } = useAuthStore();
  
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewEstimate, setViewEstimate] = useState<Estimate | null>(null);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EstimateFormData>({
    defaultValues: {
      items: [{ materialId: '', name: '', unit: 'шт', quantity: 1, unitPrice: 0, totalPrice: 0, category: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');
  const watchedLaborCost = watch('laborCost');
  const watchedOverheadPercentage = watch('overheadPercentage');
  const watchedProfitMargin = watch('profitMargin');
  const watchedVatRate = watch('vatRate');

  const calculateEstimate = () => {
    const materialsCost = watchedItems?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
    const laborCost = watchedLaborCost || 0;
    const subtotal = materialsCost + laborCost;
    const overhead = subtotal * ((watchedOverheadPercentage || 0) / 100);
    const profit = (subtotal + overhead) * ((watchedProfitMargin || 0) / 100);
    const vat = (subtotal + overhead + profit) * ((watchedVatRate || 0) / 100);
    const total = subtotal + overhead + profit + vat;

    return {
      materialsCost,
      laborCost,
      subtotal,
      overhead,
      profit,
      vat,
      total
    };
  };

  const calculations = calculateEstimate();

  const handleCreateEstimate = async (data: EstimateFormData) => {
    try {
      const newEstimate: Estimate = {
        id: `est_${Date.now()}`,
        ...data,
        createdAt: new Date(),
        validUntil: new Date(data.validUntil),
        status: 'draft',
        materialsCost: calculations.materialsCost,
        subtotal: calculations.subtotal,
        overhead: calculations.overhead,
        profit: calculations.profit,
        vat: calculations.vat,
        total: calculations.total,
        createdBy: user?.id || '',
      };

      setEstimates(prev => [...prev, newEstimate]);
      toast.success('Смета успешно создана');
      setOpenDialog(false);
      reset();
    } catch (error) {
      toast.error('Ошибка при создании сметы');
    }
  };

  const handleEditEstimate = async (data: EstimateFormData) => {
    if (!editingEstimate) return;
    
    try {
      const updatedEstimate: Estimate = {
        ...editingEstimate,
        ...data,
        validUntil: new Date(data.validUntil),
        materialsCost: calculations.materialsCost,
        subtotal: calculations.subtotal,
        overhead: calculations.overhead,
        profit: calculations.profit,
        vat: calculations.vat,
        total: calculations.total,
      };

      setEstimates(prev => prev.map(est => est.id === editingEstimate.id ? updatedEstimate : est));
      toast.success('Смета обновлена');
      setOpenDialog(false);
      setEditingEstimate(null);
      reset();
    } catch (error) {
      toast.error('Ошибка при обновлении сметы');
    }
  };

  const handleDeleteEstimate = (id: string) => {
    setEstimates(prev => prev.filter(est => est.id !== id));
    toast.success('Смета удалена');
    setDeleteConfirmId(null);
  };

  const openCreateDialog = () => {
    setEditingEstimate(null);
    reset({
      name: '',
      description: '',
      projectId: '',
      clientName: '',
      validUntil: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      laborCost: 0,
      overheadPercentage: 15,
      profitMargin: 20,
      vatRate: 20,
      items: [{ materialId: '', name: '', unit: 'шт', quantity: 1, unitPrice: 0, totalPrice: 0, category: '' }]
    });
    setOpenDialog(true);
  };

  const openEditDialog = (estimate: Estimate) => {
    setEditingEstimate(estimate);
    reset({
      name: estimate.name,
      description: estimate.description,
      projectId: estimate.projectId,
      clientName: estimate.clientName,
      validUntil: format(estimate.validUntil, 'yyyy-MM-dd'),
      laborCost: estimate.laborCost,
      overheadPercentage: estimate.overheadPercentage,
      profitMargin: estimate.profitMargin,
      vatRate: estimate.vatRate,
      items: estimate.items,
    });
    setOpenDialog(true);
  };

  const handleMaterialSelect = (index: number, materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      setValue(`items.${index}.materialId`, materialId);
      setValue(`items.${index}.name`, material.name);
      setValue(`items.${index}.unit`, material.unit);
      setValue(`items.${index}.unitPrice`, material.costPerUnit);
      setValue(`items.${index}.category`, material.category);
      
      const quantity = watchedItems[index]?.quantity || 1;
      setValue(`items.${index}.totalPrice`, quantity * material.costPerUnit);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setValue(`items.${index}.quantity`, quantity);
    const unitPrice = watchedItems[index]?.unitPrice || 0;
    setValue(`items.${index}.totalPrice`, quantity * unitPrice);
  };

  const getStatusColor = (status: Estimate['status']) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: Estimate['status']) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'sent': return 'Отправлена';
      case 'approved': return 'Одобрена';
      case 'rejected': return 'Отклонена';
      case 'expired': return 'Просрочена';
      default: return status;
    }
  };

  const handleExportEstimate = (estimate: Estimate) => {
    toast.info('Экспорт сметы в PDF будет реализован позже');
  };

  const handleSendEstimate = (estimate: Estimate) => {
    setEstimates(prev => prev.map(est => 
      est.id === estimate.id ? { ...est, status: 'sent' as const } : est
    ));
    toast.success('Смета отправлена клиенту');
  };

  const handleCopyEstimate = (estimate: Estimate) => {
    const copiedEstimate: Estimate = {
      ...estimate,
      id: `est_${Date.now()}`,
      name: `${estimate.name} (копия)`,
      createdAt: new Date(),
      status: 'draft',
      createdBy: user?.id || '',
    };
    
    setEstimates(prev => [...prev, copiedEstimate]);
    toast.success('Смета скопирована');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Управление сметами
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 2 }}
        >
          Создать смету
        </Button>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <EstimateIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{estimates.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего смет
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CalculateIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{estimates.filter(e => e.status === 'approved').length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Одобрено
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TemplateIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{estimates.filter(e => e.status === 'draft').length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Черновики
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  {formatCurrency(estimates.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.total, 0)).slice(0, -3)}
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Сумма одобренных
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(estimates.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.total, 0))}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {estimates.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <EstimateIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Нет смет
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Создайте первую смету для начала работы
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
              Создать смету
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Смета</TableCell>
                <TableCell>Проект</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действительна до</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estimates.map((estimate) => (
                <TableRow key={estimate.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <EstimateIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {estimate.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(estimate.createdAt, 'dd.MM.yyyy', { locale: ru })}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {projects.find(p => p.id === estimate.projectId)?.name || 'Без проекта'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{estimate.clientName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(estimate.total)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(estimate.status)}
                      color={getStatusColor(estimate.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(estimate.validUntil, 'dd.MM.yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Просмотр">
                      <IconButton size="small" onClick={() => setViewEstimate(estimate)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton size="small" onClick={() => openEditDialog(estimate)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Копировать">
                      <IconButton size="small" onClick={() => handleCopyEstimate(estimate)}>
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Экспорт PDF">
                      <IconButton size="small" onClick={() => handleExportEstimate(estimate)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    {estimate.status === 'draft' && (
                      <Tooltip title="Отправить">
                        <IconButton size="small" color="success" onClick={() => handleSendEstimate(estimate)}>
                          <SendIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Удалить">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirmId(estimate.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Диалог создания/редактирования сметы */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingEstimate ? 'Редактировать смету' : 'Создать новую смету'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Название обязательно' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Название сметы"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="clientName"
                control={control}
                rules={{ required: 'Имя клиента обязательно' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Имя клиента"
                    fullWidth
                    error={!!errors.clientName}
                    helperText={errors.clientName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="projectId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Проект</InputLabel>
                    <Select {...field} label="Проект">
                      <MenuItem value="">Без проекта</MenuItem>
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
                name="validUntil"
                control={control}
                rules={{ required: 'Дата действия обязательна' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Действительна до"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.validUntil}
                    helperText={errors.validUntil?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Описание"
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>

            {/* Материалы и работы */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Материалы и работы
              </Typography>
              
              {fields.map((field, index) => (
                <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={3}>
                    <Controller
                      name={`items.${index}.materialId`}
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Материал</InputLabel>
                          <Select 
                            {...field} 
                            label="Материал"
                            onChange={(e) => handleMaterialSelect(index, e.target.value as string)}
                          >
                            <MenuItem value="">Выберите материал</MenuItem>
                            {materials.map((material) => (
                              <MenuItem key={material.id} value={material.id}>
                                {material.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Controller
                      name={`items.${index}.quantity`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Количество"
                          fullWidth
                          onChange={(e) => {
                            field.onChange(e);
                            handleQuantityChange(index, Number(e.target.value));
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Controller
                      name={`items.${index}.unit`}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Единица" fullWidth disabled />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Controller
                      name={`items.${index}.unitPrice`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          label="Цена за ед."
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Controller
                      name={`items.${index}.totalPrice`}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Итого" fullWidth disabled />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton
                      color="error"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={() => append({ 
                  materialId: '', 
                  name: '', 
                  unit: 'шт', 
                  quantity: 1, 
                  unitPrice: 0, 
                  totalPrice: 0, 
                  category: '' 
                })}
                sx={{ mt: 1 }}
              >
                Добавить позицию
              </Button>
            </Grid>

            {/* Дополнительные расходы и расчеты */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Дополнительные расходы и расчеты
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name="laborCost"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Стоимость работ (руб.)"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Controller
                name="overheadPercentage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Накладные расходы (%)"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Controller
                name="profitMargin"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Прибыль (%)"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Controller
                name="vatRate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="НДС (%)"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Итоговые расчеты */}
            <Grid item xs={12}>
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Итоговый расчет
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Стоимость материалов" />
                      <ListItemSecondaryAction>
                        <Typography variant="body2">{formatCurrency(calculations.materialsCost)}</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Стоимость работ" />
                      <ListItemSecondaryAction>
                        <Typography variant="body2">{formatCurrency(calculations.laborCost)}</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Промежуточный итог" />
                      <ListItemSecondaryAction>
                        <Typography variant="body2">{formatCurrency(calculations.subtotal)}</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Накладные расходы" />
                      <ListItemSecondaryAction>
                        <Typography variant="body2">{formatCurrency(calculations.overhead)}</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Прибыль" />
                      <ListItemSecondaryAction>
                        <Typography variant="body2">{formatCurrency(calculations.profit)}</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="НДС" />
                      <ListItemSecondaryAction>
                        <Typography variant="body2">{formatCurrency(calculations.vat)}</Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Typography variant="h6" fontWeight={600}>
                            Общая сумма
                          </Typography>
                        } 
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="h6" fontWeight={600} color="primary">
                          {formatCurrency(calculations.total)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(editingEstimate ? handleEditEstimate : handleCreateEstimate)}
          >
            {editingEstimate ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра сметы */}
      <Dialog open={!!viewEstimate} onClose={() => setViewEstimate(null)} maxWidth="md" fullWidth>
        <DialogTitle>Просмотр сметы: {viewEstimate?.name}</DialogTitle>
        <DialogContent>
          {viewEstimate && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Клиент:</Typography>
                <Typography variant="body1">{viewEstimate.clientName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Проект:</Typography>
                <Typography variant="body1">
                  {projects.find(p => p.id === viewEstimate.projectId)?.name || 'Без проекта'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Создана:</Typography>
                <Typography variant="body1">
                  {format(viewEstimate.createdAt, 'dd.MM.yyyy HH:mm', { locale: ru })}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Действительна до:</Typography>
                <Typography variant="body1">
                  {format(viewEstimate.validUntil, 'dd.MM.yyyy', { locale: ru })}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Описание:</Typography>
                <Typography variant="body1">{viewEstimate.description || 'Нет описания'}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Материалы и работы</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Наименование</TableCell>
                        <TableCell>Количество</TableCell>
                        <TableCell>Единица</TableCell>
                        <TableCell>Цена</TableCell>
                        <TableCell>Сумма</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewEstimate.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Итоговые расчеты</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Стоимость материалов" />
                        <ListItemSecondaryAction>
                          {formatCurrency(viewEstimate.materialsCost)}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Стоимость работ" />
                        <ListItemSecondaryAction>
                          {formatCurrency(viewEstimate.laborCost)}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Накладные расходы" />
                        <ListItemSecondaryAction>
                          {formatCurrency(viewEstimate.overhead)}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Прибыль" />
                        <ListItemSecondaryAction>
                          {formatCurrency(viewEstimate.profit)}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="НДС" />
                        <ListItemSecondaryAction>
                          {formatCurrency(viewEstimate.vat)}
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary={
                            <Typography variant="h6" fontWeight={600}>
                              Общая сумма
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="h6" fontWeight={600} color="primary">
                            {formatCurrency(viewEstimate.total)}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewEstimate(null)}>Закрыть</Button>
          {viewEstimate && (
            <>
              <Button startIcon={<DownloadIcon />} onClick={() => handleExportEstimate(viewEstimate)}>
                Экспорт PDF
              </Button>
              {viewEstimate.status === 'draft' && (
                <Button 
                  variant="contained" 
                  startIcon={<SendIcon />} 
                  onClick={() => handleSendEstimate(viewEstimate)}
                >
                  Отправить
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить эту смету? Это действие нельзя отменить.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteConfirmId && handleDeleteEstimate(deleteConfirmId)}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EstimatesPage;