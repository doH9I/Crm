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
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  ShoppingCart as OrderIcon,
  LocalShipping as SupplierIcon,
  TrendingDown as LowStockIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useMaterialStore, useAuthStore } from '../store';
import { Material, Supplier, MaterialOrder } from '../types';
import { formatCurrency } from '../utils';

interface MaterialFormData {
  name: string;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  costPerUnit: number;
  supplierId: string;
  location: string;
  barcode?: string;
}

interface SupplierFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  inn?: string;
  deliveryTerms: string;
  paymentTerms: string;
}

interface OrderFormData {
  materialId: string;
  quantity: number;
  supplierId: string;
  expectedDelivery: string;
  notes?: string;
}

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
      id={`materials-tabpanel-${index}`}
      aria-labelledby={`materials-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const MaterialsPage: React.FC = () => {
  const { materials, suppliers, orders, loading, fetchMaterials, fetchSuppliers, fetchOrders, createMaterial, updateMaterial, deleteMaterial, createSupplier, createOrder } = useMaterialStore();
  const { user } = useAuthStore();
  
  const [tabValue, setTabValue] = useState(0);
  const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
  const [openSupplierDialog, setOpenSupplierDialog] = useState(false);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewMaterial, setViewMaterial] = useState<Material | null>(null);

  const { control: materialControl, handleSubmit: handleMaterialSubmit, reset: resetMaterial, formState: { errors: materialErrors } } = useForm<MaterialFormData>();
  const { control: supplierControl, handleSubmit: handleSupplierSubmit, reset: resetSupplier, formState: { errors: supplierErrors } } = useForm<SupplierFormData>();
  const { control: orderControl, handleSubmit: handleOrderSubmit, reset: resetOrder, formState: { errors: orderErrors } } = useForm<OrderFormData>();

  useEffect(() => {
    fetchMaterials();
    fetchSuppliers();
    fetchOrders();
  }, [fetchMaterials, fetchSuppliers, fetchOrders]);

  const handleCreateMaterial = async (data: MaterialFormData) => {
    try {
      await createMaterial({
        ...data,
        lastUpdated: new Date(),
        expiryDate: null,
        batch: '',
        status: data.quantity > data.minQuantity ? 'in_stock' : 'low_stock',
        tags: [],
        specifications: {},
        photos: [],
        documents: [],
        maintenance: {
          lastMaintenance: null,
          nextMaintenance: null,
          maintenanceInterval: 0,
          maintenanceHistory: [],
        },
        usage: {
          totalUsed: 0,
          averageMonthlyUsage: 0,
          lastUsed: null,
          projects: [],
        },
      });
      toast.success('Материал успешно добавлен');
      setOpenMaterialDialog(false);
      resetMaterial();
    } catch (error) {
      toast.error('Ошибка при добавлении материала');
    }
  };

  const handleEditMaterial = async (data: MaterialFormData) => {
    if (!editingMaterial) return;
    
    try {
      await updateMaterial(editingMaterial.id, {
        ...data,
        lastUpdated: new Date(),
        status: data.quantity > data.minQuantity ? 'in_stock' : 'low_stock',
      });
      toast.success('Материал обновлен');
      setOpenMaterialDialog(false);
      setEditingMaterial(null);
      resetMaterial();
    } catch (error) {
      toast.error('Ошибка при обновлении материала');
    }
  };

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
      toast.success('Поставщик добавлен');
      setOpenSupplierDialog(false);
      resetSupplier();
    } catch (error) {
      toast.error('Ошибка при добавлении поставщика');
    }
  };

  const handleCreateOrder = async (data: OrderFormData) => {
    try {
      await createOrder({
        ...data,
        orderDate: new Date(),
        expectedDelivery: new Date(data.expectedDelivery),
        status: 'pending',
        totalCost: 0, // Будет рассчитано на основе материала
        deliveryAddress: '',
        trackingNumber: '',
        actualDelivery: null,
        invoiceNumber: '',
        items: [],
      });
      toast.success('Заказ создан');
      setOpenOrderDialog(false);
      resetOrder();
    } catch (error) {
      toast.error('Ошибка при создании заказа');
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await deleteMaterial(id);
      toast.success('Материал удален');
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error('Ошибка при удалении материала');
    }
  };

  const openCreateMaterialDialog = () => {
    setEditingMaterial(null);
    resetMaterial({
      name: '',
      description: '',
      category: '',
      unit: 'шт',
      quantity: 0,
      minQuantity: 10,
      costPerUnit: 0,
      supplierId: '',
      location: '',
      barcode: '',
    });
    setOpenMaterialDialog(true);
  };

  const openEditMaterialDialog = (material: Material) => {
    setEditingMaterial(material);
    resetMaterial({
      name: material.name,
      description: material.description,
      category: material.category,
      unit: material.unit,
      quantity: material.quantity,
      minQuantity: material.minQuantity,
      costPerUnit: material.costPerUnit,
      supplierId: material.supplierId,
      location: material.location,
      barcode: material.barcode || '',
    });
    setOpenMaterialDialog(true);
  };

  const getStatusColor = (material: Material) => {
    if (material.quantity === 0) return 'error';
    if (material.quantity <= material.minQuantity) return 'warning';
    return 'success';
  };

  const getStatusLabel = (material: Material) => {
    if (material.quantity === 0) return 'Нет в наличии';
    if (material.quantity <= material.minQuantity) return 'Мало';
    return 'В наличии';
  };

  const lowStockMaterials = materials.filter(m => m.quantity <= m.minQuantity);
  const outOfStockMaterials = materials.filter(m => m.quantity === 0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Управление складом
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<OrderIcon />}
            onClick={() => setOpenOrderDialog(true)}
          >
            Создать заказ
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateMaterialDialog}
          >
            Добавить материал
          </Button>
        </Box>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{materials.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего материалов
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
                  <Badge badgeContent={lowStockMaterials.length} color="error">
                    <LowStockIcon />
                  </Badge>
                </Avatar>
                <Box>
                  <Typography variant="h6">{lowStockMaterials.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Заканчиваются
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
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{outOfStockMaterials.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Нет в наличии
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
                  <SupplierIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{suppliers.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Поставщиков
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Предупреждения */}
      {lowStockMaterials.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            Внимание! Заканчиваются материалы: {lowStockMaterials.map(m => m.name).join(', ')}
          </Typography>
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Материалы" icon={<InventoryIcon />} />
          <Tab label="Поставщики" icon={<SupplierIcon />} />
          <Tab label="Заказы" icon={<OrderIcon />} />
        </Tabs>

        {/* Вкладка "Материалы" */}
        <TabPanel value={tabValue} index={0}>
          {materials.length === 0 && !loading ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Нет материалов
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Добавьте первый материал для начала работы
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateMaterialDialog}>
                  Добавить материал
                </Button>
              </CardContent>
            </Card>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Материал</TableCell>
                    <TableCell>Категория</TableCell>
                    <TableCell>Количество</TableCell>
                    <TableCell>Единица</TableCell>
                    <TableCell>Цена за ед.</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Местоположение</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: getStatusColor(material) === 'error' ? 'error.main' : 'primary.main', width: 32, height: 32 }}>
                            <InventoryIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {material.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {material.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={material.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {material.quantity}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            мин: {material.minQuantity}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell>{formatCurrency(material.costPerUnit)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(material)}
                          color={getStatusColor(material)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{material.location}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Просмотр">
                          <IconButton size="small" onClick={() => setViewMaterial(material)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Редактировать">
                          <IconButton size="small" onClick={() => openEditMaterialDialog(material)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteConfirmId(material.id)}
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
        </TabPanel>

        {/* Вкладка "Поставщики" */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenSupplierDialog(true)}
            >
              Добавить поставщика
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {suppliers.map((supplier) => (
              <Grid item xs={12} md={6} lg={4} key={supplier.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {supplier.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {supplier.contactPerson}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Email: {supplier.email}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        Телефон: {supplier.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={`Рейтинг: ${supplier.rating}/5`}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={supplier.isActive ? 'Активен' : 'Неактивен'}
                        color={supplier.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Вкладка "Заказы" */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Номер заказа</TableCell>
                  <TableCell>Материал</TableCell>
                  <TableCell>Количество</TableCell>
                  <TableCell>Поставщик</TableCell>
                  <TableCell>Дата заказа</TableCell>
                  <TableCell>Ожидаемая доставка</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{order.materialId}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.supplierId}</TableCell>
                    <TableCell>
                      {format(order.orderDate, 'dd.MM.yyyy', { locale: ru })}
                    </TableCell>
                    <TableCell>
                      {format(order.expectedDelivery, 'dd.MM.yyyy', { locale: ru })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={order.status === 'delivered' ? 'success' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Диалог создания/редактирования материала */}
      <Dialog open={openMaterialDialog} onClose={() => setOpenMaterialDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMaterial ? 'Редактировать материал' : 'Добавить новый материал'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={materialControl}
                rules={{ required: 'Название обязательно' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Название материала"
                    fullWidth
                    error={!!materialErrors.name}
                    helperText={materialErrors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="category"
                control={materialControl}
                rules={{ required: 'Категория обязательна' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Категория"
                    fullWidth
                    error={!!materialErrors.category}
                    helperText={materialErrors.category?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={materialControl}
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
            <Grid item xs={12} md={4}>
              <Controller
                name="quantity"
                control={materialControl}
                rules={{ required: 'Количество обязательно', min: { value: 0, message: 'Количество не может быть отрицательным' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Количество"
                    fullWidth
                    error={!!materialErrors.quantity}
                    helperText={materialErrors.quantity?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="minQuantity"
                control={materialControl}
                rules={{ required: 'Минимальное количество обязательно' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Минимальное количество"
                    fullWidth
                    error={!!materialErrors.minQuantity}
                    helperText={materialErrors.minQuantity?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="unit"
                control={materialControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Единица измерения</InputLabel>
                    <Select {...field} label="Единица измерения">
                      <MenuItem value="шт">штук</MenuItem>
                      <MenuItem value="кг">килограмм</MenuItem>
                      <MenuItem value="м">метр</MenuItem>
                      <MenuItem value="м²">м²</MenuItem>
                      <MenuItem value="м³">м³</MenuItem>
                      <MenuItem value="л">литр</MenuItem>
                      <MenuItem value="упак">упаковка</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="costPerUnit"
                control={materialControl}
                rules={{ required: 'Цена обязательна', min: { value: 0, message: 'Цена не может быть отрицательной' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Цена за единицу (руб.)"
                    fullWidth
                    error={!!materialErrors.costPerUnit}
                    helperText={materialErrors.costPerUnit?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="location"
                control={materialControl}
                render={({ field }) => (
                  <TextField {...field} label="Местоположение на складе" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="supplierId"
                control={materialControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Поставщик</InputLabel>
                    <Select {...field} label="Поставщик">
                      {suppliers.map((supplier) => (
                        <MenuItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="barcode"
                control={materialControl}
                render={({ field }) => (
                  <TextField {...field} label="Штрихкод" fullWidth />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMaterialDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleMaterialSubmit(editingMaterial ? handleEditMaterial : handleCreateMaterial)}
          >
            {editingMaterial ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог добавления поставщика */}
      <Dialog open={openSupplierDialog} onClose={() => setOpenSupplierDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить поставщика</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={supplierControl}
                rules={{ required: 'Название компании обязательно' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Название компании"
                    fullWidth
                    error={!!supplierErrors.name}
                    helperText={supplierErrors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="contactPerson"
                control={supplierControl}
                rules={{ required: 'Контактное лицо обязательно' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Контактное лицо"
                    fullWidth
                    error={!!supplierErrors.contactPerson}
                    helperText={supplierErrors.contactPerson?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={supplierControl}
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
                    error={!!supplierErrors.email}
                    helperText={supplierErrors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={supplierControl}
                render={({ field }) => (
                  <TextField {...field} label="Телефон" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={supplierControl}
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
                name="deliveryTerms"
                control={supplierControl}
                render={({ field }) => (
                  <TextField {...field} label="Условия доставки" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="paymentTerms"
                control={supplierControl}
                render={({ field }) => (
                  <TextField {...field} label="Условия оплаты" fullWidth />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSupplierDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSupplierSubmit(handleCreateSupplier)}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог создания заказа */}
      <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать заказ материала</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="materialId"
                control={orderControl}
                rules={{ required: 'Выберите материал' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!orderErrors.materialId}>
                    <InputLabel>Материал</InputLabel>
                    <Select {...field} label="Материал">
                      {materials.map((material) => (
                        <MenuItem key={material.id} value={material.id}>
                          {material.name} (осталось: {material.quantity} {material.unit})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="quantity"
                control={orderControl}
                rules={{ required: 'Количество обязательно', min: { value: 1, message: 'Количество должно быть больше 0' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Количество для заказа"
                    fullWidth
                    error={!!orderErrors.quantity}
                    helperText={orderErrors.quantity?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="supplierId"
                control={orderControl}
                rules={{ required: 'Выберите поставщика' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!orderErrors.supplierId}>
                    <InputLabel>Поставщик</InputLabel>
                    <Select {...field} label="Поставщик">
                      {suppliers.map((supplier) => (
                        <MenuItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="expectedDelivery"
                control={orderControl}
                rules={{ required: 'Дата доставки обязательна' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Ожидаемая дата доставки"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!orderErrors.expectedDelivery}
                    helperText={orderErrors.expectedDelivery?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={orderControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Примечания"
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrderDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleOrderSubmit(handleCreateOrder)}>
            Создать заказ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить этот материал? Это действие нельзя отменить.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteConfirmId && handleDeleteMaterial(deleteConfirmId)}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра материала */}
      <Dialog open={!!viewMaterial} onClose={() => setViewMaterial(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Информация о материале</DialogTitle>
        <DialogContent>
          {viewMaterial && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6">{viewMaterial.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {viewMaterial.description}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Категория:</Typography>
                <Typography variant="body2">{viewMaterial.category}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Количество:</Typography>
                <Typography variant="body2">{viewMaterial.quantity} {viewMaterial.unit}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Цена за единицу:</Typography>
                <Typography variant="body2">{formatCurrency(viewMaterial.costPerUnit)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Общая стоимость:</Typography>
                <Typography variant="body2">{formatCurrency(viewMaterial.quantity * viewMaterial.costPerUnit)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Местоположение:</Typography>
                <Typography variant="body2">{viewMaterial.location}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Статус:</Typography>
                <Chip
                  label={getStatusLabel(viewMaterial)}
                  color={getStatusColor(viewMaterial)}
                  size="small"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewMaterial(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialsPage;