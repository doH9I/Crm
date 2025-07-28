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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocalShipping as SupplierIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useMaterialStore, useAuthStore, useProjectStore } from '../store';
import { Supplier } from '../types';
import { formatCurrency } from '../utils';
import ProjectSelector from '../components/ProjectSelector';

interface SupplierFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  inn?: string;
  kpp?: string;
  website?: string;
  deliveryTerms: string;
  paymentTerms: string;
  specialization: string;
  notes?: string;
}

const SuppliersPage: React.FC = () => {
  const { suppliers, loading, fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } = useMaterialStore();
  const { user } = useAuthStore();
  const { currentProjectId, isAllProjectsView, selectedProject } = useProjectStore();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormData>();

  useEffect(() => {
    fetchSuppliers(currentProjectId);
  }, [fetchSuppliers, currentProjectId]);

  // Фильтрация поставщиков по выбранному проекту
  const filteredSuppliers = suppliers.filter(supplier => {
    if (isAllProjectsView) return true;
    if (currentProjectId) return supplier.projectId === currentProjectId;
    return true;
  });

  const handleCreateSupplier = async (data: SupplierFormData) => {
    try {
      await createSupplier({
        ...data,
        rating: 5,
        isActive: true,
        materials: [],
        orders: [],
        performance: {
          onTimeDelivery: 100,
          qualityRating: 5,
          totalOrders: 0,
          averageDeliveryTime: 0,
        },
      });
      toast.success('Поставщик успешно добавлен');
      setOpenDialog(false);
      reset();
    } catch (error) {
      toast.error('Ошибка при добавлении поставщика');
    }
  };

  const handleEditSupplier = async (data: SupplierFormData) => {
    if (!editingSupplier) return;
    
    try {
      await updateSupplier(editingSupplier.id, data);
      toast.success('Поставщик обновлен');
      setOpenDialog(false);
      setEditingSupplier(null);
      reset();
    } catch (error) {
      toast.error('Ошибка при обновлении поставщика');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      await deleteSupplier(id);
      toast.success('Поставщик удален');
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error('Ошибка при удалении поставщика');
    }
  };

  const openCreateDialog = () => {
    setEditingSupplier(null);
    reset({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      inn: '',
      kpp: '',
      website: '',
      deliveryTerms: '',
      paymentTerms: '',
      specialization: '',
      notes: '',
    });
    setOpenDialog(true);
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    reset({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      inn: supplier.inn || '',
      kpp: supplier.kpp || '',
      website: supplier.website || '',
      deliveryTerms: supplier.deliveryTerms,
      paymentTerms: supplier.paymentTerms,
      specialization: supplier.specialization || '',
      notes: supplier.notes || '',
    });
    setOpenDialog(true);
  };

  const getSpecializationColor = (specialization: string) => {
    switch (specialization.toLowerCase()) {
      case 'материалы': return 'primary';
      case 'инструменты': return 'secondary';
      case 'оборудование': return 'info';
      case 'услуги': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Управление поставщиками
          </Typography>
          <ProjectSelector />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 2 }}
        >
          Добавить поставщика
        </Button>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SupplierIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{filteredSuppliers.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего поставщиков
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
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{filteredSuppliers.filter(s => s.isActive).length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Активных
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
                  <ReportIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {filteredSuppliers.length > 0 ? (filteredSuppliers.reduce((sum, s) => sum + s.rating, 0) / filteredSuppliers.length).toFixed(1) : '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Средний рейтинг
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
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {filteredSuppliers.reduce((sum, s) => sum + (s.performance?.totalOrders || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего заказов
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {filteredSuppliers.length === 0 && !loading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <SupplierIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Нет поставщиков
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {isAllProjectsView 
                ? 'Добавьте первого поставщика для начала работы'
                : selectedProject 
                  ? `Добавьте поставщика для проекта "${selectedProject.name}"`
                  : 'Добавьте первого поставщика для начала работы'
              }
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
              Добавить поставщика
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Поставщик</TableCell>
                <TableCell>Контакты</TableCell>
                <TableCell>Специализация</TableCell>
                <TableCell>Рейтинг</TableCell>
                <TableCell>Заказов</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <SupplierIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {supplier.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {supplier.contactPerson}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">{supplier.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">{supplier.phone}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={supplier.specialization || 'Не указана'} 
                      size="small" 
                      color={getSpecializationColor(supplier.specialization || '')}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={supplier.rating} readOnly size="small" />
                      <Typography variant="caption">({supplier.rating})</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {supplier.performance?.totalOrders || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={supplier.isActive ? 'Активен' : 'Неактивен'}
                      color={supplier.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Просмотр">
                      <IconButton size="small" onClick={() => setViewSupplier(supplier)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton size="small" onClick={() => openEditDialog(supplier)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirmId(supplier.id)}
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

      {/* Диалог создания/редактирования поставщика */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSupplier ? 'Редактировать поставщика' : 'Добавить нового поставщика'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Название компании обязательно' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Название компании"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="contactPerson"
                control={control}
                rules={{ required: 'Контактное лицо обязательно' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Контактное лицо"
                    fullWidth
                    error={!!errors.contactPerson}
                    helperText={errors.contactPerson?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Email обязателен',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Неверный формат email'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Телефон" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Адрес"
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="inn"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="ИНН" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="kpp"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="КПП" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="website"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Веб-сайт" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="specialization"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    label="Специализация" 
                    fullWidth 
                    helperText="Например: Материалы, Инструменты, Оборудование"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="deliveryTerms"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Условия доставки" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="paymentTerms"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Условия оплаты" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Примечания"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(editingSupplier ? handleEditSupplier : handleCreateSupplier)}
          >
            {editingSupplier ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра поставщика */}
      <Dialog open={!!viewSupplier} onClose={() => setViewSupplier(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Информация о поставщике</DialogTitle>
        <DialogContent>
          {viewSupplier && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                  <SupplierIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6">{viewSupplier.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {viewSupplier.contactPerson}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Email" secondary={viewSupplier.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Телефон" secondary={viewSupplier.phone} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Адрес" secondary={viewSupplier.address} />
                  </ListItem>
                  {viewSupplier.inn && (
                    <ListItem>
                      <ListItemText primary="ИНН" secondary={viewSupplier.inn} />
                    </ListItem>
                  )}
                  {viewSupplier.website && (
                    <ListItem>
                      <ListItemText primary="Веб-сайт" secondary={viewSupplier.website} />
                    </ListItem>
                  )}
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Специализация" secondary={viewSupplier.specialization || 'Не указана'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Рейтинг" />
                    <ListItemSecondaryAction>
                      <Rating value={viewSupplier.rating} readOnly size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Условия доставки" secondary={viewSupplier.deliveryTerms} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Условия оплаты" secondary={viewSupplier.paymentTerms} />
                  </ListItem>
                  {viewSupplier.performance && (
                    <>
                      <Divider />
                      <ListItem>
                        <ListItemText primary="Всего заказов" secondary={viewSupplier.performance.totalOrders} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Качество поставок" secondary={`${viewSupplier.performance.qualityRating}/5`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Своевременность" secondary={`${viewSupplier.performance.onTimeDelivery}%`} />
                      </ListItem>
                    </>
                  )}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewSupplier(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить этого поставщика? Это действие нельзя отменить.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteConfirmId && handleDeleteSupplier(deleteConfirmId)}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuppliersPage;