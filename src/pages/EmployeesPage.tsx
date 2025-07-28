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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useHRStore, useAuthStore, useProjectSelectionStore } from '../store';
import { User, UserRole } from '../types';
import { formatCurrency } from '../utils';

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  skills?: string;
}

const EmployeesPage: React.FC = () => {
  const { employees, loading, fetchEmployees, createEmployee, updateEmployee, deleteEmployee } = useHRStore();
  const { user } = useAuthStore();
  const { selectedProjectId } = useProjectSelectionStore();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewEmployee, setViewEmployee] = useState<User | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EmployeeFormData>();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees, selectedProjectId]); // Перезагружаем при изменении проекта

  const handleCreateEmployee = async (data: EmployeeFormData) => {
    try {
      await createEmployee({
        ...data,
        hireDate: new Date(data.hireDate),
        avatar: '',
        lastLogin: new Date(),
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
        certifications: [],
        performanceRating: 3,
        contractType: 'permanent',
        workSchedule: {
          type: 'standard',
          hoursPerWeek: 40,
          workDays: [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime: '18:00',
          lunchBreakDuration: 60,
        },
        permissions: [],
        rolePermissions: [],
      });
      toast.success('Сотрудник успешно добавлен');
      setOpenDialog(false);
      reset();
    } catch (error) {
      toast.error('Ошибка при добавлении сотрудника');
    }
  };

  const handleEditEmployee = async (data: EmployeeFormData) => {
    if (!editingEmployee) return;
    
    try {
      await updateEmployee(editingEmployee.id, {
        ...data,
        hireDate: new Date(data.hireDate),
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
      });
      toast.success('Данные сотрудника обновлены');
      setOpenDialog(false);
      setEditingEmployee(null);
      reset();
    } catch (error) {
      toast.error('Ошибка при обновлении данных');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmployee(id);
      toast.success('Сотрудник удален');
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error('Ошибка при удалении сотрудника');
    }
  };

  const openCreateDialog = () => {
    setEditingEmployee(null);
    reset({
      name: '',
      email: '',
      phone: '',
      role: UserRole.WORKER,
      department: '',
      position: '',
      salary: 0,
      hireDate: format(new Date(), 'yyyy-MM-dd'),
      isActive: true,
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      skills: '',
    });
    setOpenDialog(true);
  };

  const openEditDialog = (employee: User) => {
    setEditingEmployee(employee);
    reset({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role,
      department: employee.department || '',
      position: employee.position || '',
      salary: employee.salary || 0,
      hireDate: employee.hireDate ? format(employee.hireDate, 'yyyy-MM-dd') : '',
      isActive: employee.isActive,
      address: employee.address || '',
      emergencyContact: employee.emergencyContact || '',
      emergencyPhone: employee.emergencyPhone || '',
      skills: employee.skills ? employee.skills.join(', ') : '',
    });
    setOpenDialog(true);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'Администратор';
      case UserRole.MANAGER: return 'Менеджер';
      case UserRole.FOREMAN: return 'Мастер';
      case UserRole.WORKER: return 'Рабочий';
      case UserRole.ACCOUNTANT: return 'Бухгалтер';
      case UserRole.ARCHITECT: return 'Архитектор';
      case UserRole.ENGINEER: return 'Инженер';
      case UserRole.SAFETY_OFFICER: return 'Инженер по ТБ';
      case UserRole.QUALITY_CONTROLLER: return 'Контролер качества';
      case UserRole.PROCUREMENT_MANAGER: return 'Менеджер по закупкам';
      case UserRole.LOGISTICS_COORDINATOR: return 'Логист';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'error';
      case UserRole.MANAGER: return 'primary';
      case UserRole.FOREMAN: return 'warning';
      case UserRole.ACCOUNTANT: return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Управление персоналом
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 2 }}
        >
          Добавить сотрудника
        </Button>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary.main">
                {employees.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего сотрудников
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {employees.filter(e => e.isActive).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Активных
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {employees.filter(e => !e.isActive).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Неактивных
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {formatCurrency(employees.reduce((sum, e) => sum + (e.salary || 0), 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Общий фонд зарплат
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {employees.length === 0 && !loading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Нет сотрудников
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Добавьте первого сотрудника для начала работы
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
              Добавить сотрудника
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Сотрудник</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Отдел</TableCell>
                <TableCell>Зарплата</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата найма</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        {employee.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {employee.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {employee.email}
                          </Typography>
                        </Box>
                        {employee.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {employee.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{employee.position || 'Не указана'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(employee.role)}
                      color={getRoleColor(employee.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{employee.department || 'Не указан'}</Typography>
                  </TableCell>
                  <TableCell>
                    {employee.salary ? formatCurrency(employee.salary) : 'Не указана'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.isActive ? 'Активен' : 'Неактивен'}
                      color={employee.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {employee.hireDate
                      ? format(employee.hireDate, 'dd.MM.yyyy', { locale: ru })
                      : 'Не указана'
                    }
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Просмотр">
                      <IconButton size="small" onClick={() => setViewEmployee(employee)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton size="small" onClick={() => openEditDialog(employee)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirmId(employee.id)}
                        disabled={employee.id === user?.id}
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

      {/* Диалог создания/редактирования сотрудника */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Редактировать сотрудника' : 'Добавить нового сотрудника'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Имя обязательно' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Полное имя"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
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
            <Grid item xs={12} md={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Роль</InputLabel>
                    <Select {...field} label="Роль">
                      {Object.values(UserRole).map((role) => (
                        <MenuItem key={role} value={role}>
                          {getRoleLabel(role)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Отдел" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Должность" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="salary"
                control={control}
                rules={{ min: { value: 0, message: 'Зарплата должна быть положительной' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Зарплата (руб.)"
                    fullWidth
                    error={!!errors.salary}
                    helperText={errors.salary?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="hireDate"
                control={control}
                rules={{ required: 'Дата найма обязательна' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Дата найма"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.hireDate}
                    helperText={errors.hireDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Адрес" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="emergencyContact"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Контактное лицо (экстренная связь)" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="emergencyPhone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Телефон экстренной связи" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Навыки (через запятую)"
                    fullWidth
                    multiline
                    rows={2}
                    helperText="Перечислите навыки через запятую"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Активный сотрудник"
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
            onClick={handleSubmit(editingEmployee ? handleEditEmployee : handleCreateEmployee)}
          >
            {editingEmployee ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра сотрудника */}
      <Dialog open={!!viewEmployee} onClose={() => setViewEmployee(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Информация о сотруднике</DialogTitle>
        <DialogContent>
          {viewEmployee && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                  {viewEmployee.name.charAt(0)}
                </Avatar>
                <Typography variant="h6">{viewEmployee.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {viewEmployee.position}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Email:</Typography>
                <Typography variant="body2">{viewEmployee.email}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Телефон:</Typography>
                <Typography variant="body2">{viewEmployee.phone || 'Не указан'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Роль:</Typography>
                <Typography variant="body2">{getRoleLabel(viewEmployee.role)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Отдел:</Typography>
                <Typography variant="body2">{viewEmployee.department || 'Не указан'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Зарплата:</Typography>
                <Typography variant="body2">
                  {viewEmployee.salary ? formatCurrency(viewEmployee.salary) : 'Не указана'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Дата найма:</Typography>
                <Typography variant="body2">
                  {viewEmployee.hireDate
                    ? format(viewEmployee.hireDate, 'dd.MM.yyyy', { locale: ru })
                    : 'Не указана'
                  }
                </Typography>
              </Grid>
              {viewEmployee.skills && viewEmployee.skills.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Навыки:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {viewEmployee.skills.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewEmployee(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить этого сотрудника? Это действие нельзя отменить.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteConfirmId && handleDeleteEmployee(deleteConfirmId)}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesPage;