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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PersonAdd as ClientIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Assignment as ProjectIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useProjectStore, useAuthStore } from '../store';
import { formatCurrency } from '../utils';

interface Client {
  id: string;
  name: string;
  type: 'individual' | 'company';
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  inn?: string;
  kpp?: string;
  website?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  projects: string[];
  totalBudget: number;
  completedProjects: number;
}

interface ClientFormData {
  name: string;
  type: 'individual' | 'company';
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  inn?: string;
  kpp?: string;
  website?: string;
  notes?: string;
}

const ClientsPage: React.FC = () => {
  const { projects } = useProjectStore();
  const { user } = useAuthStore();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewClient, setViewClient] = useState<Client | null>(null);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<ClientFormData>();
  const watchType = watch('type');

  useEffect(() => {
    // Имитация загрузки клиентов
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'ООО "СтройИнвест"',
        type: 'company',
        contactPerson: 'Иванов Иван Иванович',
        email: 'info@stroyinvest.ru',
        phone: '+7 (495) 123-45-67',
        address: 'г. Москва, ул. Строительная, д. 10',
        inn: '7701234567',
        kpp: '770101001',
        website: 'www.stroyinvest.ru',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        projects: ['proj1', 'proj2'],
        totalBudget: 15000000,
        completedProjects: 3,
      },
      {
        id: '2',
        name: 'Петров Петр Петрович',
        type: 'individual',
        email: 'petrov@example.com',
        phone: '+7 (916) 234-56-78',
        address: 'г. Москва, ул. Садовая, д. 5, кв. 10',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        projects: ['proj3'],
        totalBudget: 2500000,
        completedProjects: 1,
      },
    ];
    setClients(mockClients);
  }, []);

  const handleCreateClient = async (data: ClientFormData) => {
    try {
      const newClient: Client = {
        id: `client_${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        projects: [],
        totalBudget: 0,
        completedProjects: 0,
      };

      setClients(prev => [...prev, newClient]);
      toast.success('Клиент успешно добавлен');
      setOpenDialog(false);
      reset();
    } catch (error) {
      toast.error('Ошибка при добавлении клиента');
    }
  };

  const handleEditClient = async (data: ClientFormData) => {
    if (!editingClient) return;
    
    try {
      const updatedClient: Client = {
        ...editingClient,
        ...data,
        updatedAt: new Date(),
      };

      setClients(prev => prev.map(client => client.id === editingClient.id ? updatedClient : client));
      toast.success('Клиент обновлен');
      setOpenDialog(false);
      setEditingClient(null);
      reset();
    } catch (error) {
      toast.error('Ошибка при обновлении клиента');
    }
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    toast.success('Клиент удален');
    setDeleteConfirmId(null);
  };

  const openCreateDialog = () => {
    setEditingClient(null);
    reset({
      name: '',
      type: 'individual',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      inn: '',
      kpp: '',
      website: '',
      notes: '',
    });
    setOpenDialog(true);
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    reset({
      name: client.name,
      type: client.type,
      contactPerson: client.contactPerson || '',
      email: client.email,
      phone: client.phone,
      address: client.address,
      inn: client.inn || '',
      kpp: client.kpp || '',
      website: client.website || '',
      notes: client.notes || '',
    });
    setOpenDialog(true);
  };

  const getClientProjects = (clientId: string) => {
    return projects.filter(project => project.clientName === clients.find(c => c.id === clientId)?.name);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Управление заказчиками
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 2 }}
        >
          Добавить заказчика
        </Button>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ClientIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{clients.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего заказчиков
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
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{clients.filter(c => c.type === 'company').length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Компании
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
                  <ProjectIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{clients.reduce((sum, c) => sum + c.completedProjects, 0)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Завершенных проектов
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
                  ₽
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {formatCurrency(clients.reduce((sum, c) => sum + c.totalBudget, 0)).slice(0, -3)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Общий бюджет
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {clients.length === 0 && !loading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ClientIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Нет заказчиков
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Добавьте первого заказчика для начала работы
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
              Добавить заказчика
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Заказчик</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Контакты</TableCell>
                <TableCell>Проекты</TableCell>
                <TableCell>Бюджет</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: client.type === 'company' ? 'primary.main' : 'secondary.main', width: 40, height: 40 }}>
                        {client.type === 'company' ? <BusinessIcon /> : <ClientIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {client.name}
                        </Typography>
                        {client.contactPerson && (
                          <Typography variant="caption" color="text.secondary">
                            {client.contactPerson}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={client.type === 'company' ? 'Компания' : 'Физ. лицо'} 
                      size="small" 
                      color={client.type === 'company' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">{client.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">{client.phone}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {getClientProjects(client.id).length} активных
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {client.completedProjects} завершенных
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(client.totalBudget)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={client.isActive ? 'Активен' : 'Неактивен'}
                      color={client.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Просмотр">
                      <IconButton size="small" onClick={() => setViewClient(client)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton size="small" onClick={() => openEditDialog(client)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirmId(client.id)}
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

      {/* Диалог создания/редактирования заказчика */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingClient ? 'Редактировать заказчика' : 'Добавить нового заказчика'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Тип заказчика</InputLabel>
                    <Select {...field} label="Тип заказчика">
                      <MenuItem value="individual">Физическое лицо</MenuItem>
                      <MenuItem value="company">Компания</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Название/Имя обязательно' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={watchType === 'company' ? 'Название компании' : 'ФИО'}
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            {watchType === 'company' && (
              <Grid item xs={12} md={6}>
                <Controller
                  name="contactPerson"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Контактное лицо"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}
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
                rules={{ required: 'Телефон обязателен' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Телефон"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                rules={{ required: 'Адрес обязателен' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Адрес"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>
            {watchType === 'company' && (
              <>
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
              </>
            )}
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
            onClick={handleSubmit(editingClient ? handleEditClient : handleCreateClient)}
          >
            {editingClient ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра заказчика */}
      <Dialog open={!!viewClient} onClose={() => setViewClient(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Информация о заказчике</DialogTitle>
        <DialogContent>
          {viewClient && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                  {viewClient.type === 'company' ? <BusinessIcon fontSize="large" /> : <ClientIcon fontSize="large" />}
                </Avatar>
                <Typography variant="h6">{viewClient.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {viewClient.type === 'company' ? 'Компания' : 'Физическое лицо'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Email" secondary={viewClient.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Телефон" secondary={viewClient.phone} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Адрес" secondary={viewClient.address} />
                  </ListItem>
                  {viewClient.contactPerson && (
                    <ListItem>
                      <ListItemText primary="Контактное лицо" secondary={viewClient.contactPerson} />
                    </ListItem>
                  )}
                  {viewClient.inn && (
                    <ListItem>
                      <ListItemText primary="ИНН" secondary={viewClient.inn} />
                    </ListItem>
                  )}
                  {viewClient.website && (
                    <ListItem>
                      <ListItemText primary="Веб-сайт" secondary={viewClient.website} />
                    </ListItem>
                  )}
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Активных проектов" secondary={getClientProjects(viewClient.id).length} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Завершенных проектов" secondary={viewClient.completedProjects} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Общий бюджет" secondary={formatCurrency(viewClient.totalBudget)} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Дата регистрации" secondary={format(viewClient.createdAt, 'dd.MM.yyyy', { locale: ru })} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewClient(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить этого заказчика? Это действие нельзя отменить.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteConfirmId && handleDeleteClient(deleteConfirmId)}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsPage;