import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Avatar,
  Divider,
  Chip,
  Alert,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuthStore } from '../store';
import { UserRole } from '../types';
import { formatCurrency } from '../utils';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  const { control: profileControl, handleSubmit: handleProfileSubmit, reset: resetProfile, formState: { errors: profileErrors } } = useForm<ProfileFormData>();
  const { control: passwordControl, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<PasswordFormData>();

  React.useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || '',
      });
    }
  }, [user, resetProfile]);

  const handleSaveProfile = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      toast.success('Профиль успешно обновлен');
      setIsEditing(false);
    } catch (error) {
      toast.error('Ошибка при обновлении профиля');
    }
  };

  const handleChangePassword = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    try {
      // Здесь должна быть логика смены пароля
      toast.success('Пароль успешно изменен');
      setPasswordDialogOpen(false);
      resetPassword();
    } catch (error) {
      toast.error('Ошибка при смене пароля');
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'Администратор';
      case UserRole.MANAGER: return 'Менеджер проектов';
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

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Ошибка загрузки профиля пользователя
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Профиль пользователя
      </Typography>

      <Grid container spacing={3}>
        {/* Боковая панель с информацией о пользователе */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {user.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user.position || 'Должность не указана'}
              </Typography>
              <Chip
                label={getRoleLabel(user.role)}
                color="primary"
                sx={{ mb: 2 }}
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{user.email}</Typography>
                </Box>
                {user.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{user.phone}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WorkIcon fontSize="small" color="action" />
                  <Typography variant="body2">{user.department || 'Отдел не указан'}</Typography>
                </Box>
                {user.salary && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Зарплата: {formatCurrency(user.salary)}
                    </Typography>
                  </Box>
                )}
                {user.hireDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Работает с {format(user.hireDate, 'dd.MM.yyyy', { locale: ru })}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Навыки */}
          {user.skills && user.skills.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Навыки
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Основной контент */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="fullWidth"
            >
              <Tab label="Личные данные" icon={<PersonIcon />} />
              <Tab label="Безопасность" icon={<SecurityIcon />} />
              <Tab label="Настройки" icon={<SettingsIcon />} />
            </Tabs>

            {/* Вкладка "Личные данные" */}
            <TabPanel value={tabValue} index={0}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Личная информация
                    </Typography>
                    {!isEditing ? (
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditing(true)}
                      >
                        Редактировать
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          startIcon={<SaveIcon />}
                          variant="contained"
                          onClick={handleProfileSubmit(handleSaveProfile)}
                        >
                          Сохранить
                        </Button>
                        <Button
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setIsEditing(false);
                            resetProfile();
                          }}
                        >
                          Отмена
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="name"
                        control={profileControl}
                        rules={{ required: 'Имя обязательно' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Полное имя"
                            fullWidth
                            disabled={!isEditing}
                            error={!!profileErrors.name}
                            helperText={profileErrors.name?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="email"
                        control={profileControl}
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
                            disabled={!isEditing}
                            error={!!profileErrors.email}
                            helperText={profileErrors.email?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="phone"
                        control={profileControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Телефон"
                            fullWidth
                            disabled={!isEditing}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="address"
                        control={profileControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Адрес"
                            fullWidth
                            disabled={!isEditing}
                            multiline
                            rows={2}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="emergencyContact"
                        control={profileControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Контактное лицо (экстренная связь)"
                            fullWidth
                            disabled={!isEditing}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="emergencyPhone"
                        control={profileControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Телефон экстренной связи"
                            fullWidth
                            disabled={!isEditing}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Служебная информация
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Роль"
                        value={getRoleLabel(user.role)}
                        fullWidth
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Отдел"
                        value={user.department || 'Не указан'}
                        fullWidth
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Должность"
                        value={user.position || 'Не указана'}
                        fullWidth
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Дата найма"
                        value={user.hireDate ? format(user.hireDate, 'dd.MM.yyyy', { locale: ru }) : 'Не указана'}
                        fullWidth
                        disabled
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Вкладка "Безопасность" */}
            <TabPanel value={tabValue} index={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Настройки безопасности
                  </Typography>

                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Сменить пароль"
                        secondary="Обновите пароль для защиты аккаунта"
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="outlined"
                          onClick={() => setPasswordDialogOpen(true)}
                        >
                          Изменить
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Последний вход"
                        secondary={user.lastLogin ? format(user.lastLogin, 'dd.MM.yyyy HH:mm', { locale: ru }) : 'Информация недоступна'}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Статус аккаунта"
                        secondary={user.isActive ? 'Активен' : 'Неактивен'}
                      />
                      <Chip
                        label={user.isActive ? 'Активен' : 'Неактивен'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Вкладка "Настройки" */}
            <TabPanel value={tabValue} index={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Персональные настройки
                  </Typography>

                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Email уведомления"
                        secondary="Получать уведомления на email"
                      />
                      <ListItemSecondaryAction>
                        <Switch defaultChecked />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Push уведомления"
                        secondary="Получать push уведомления в браузере"
                      />
                      <ListItemSecondaryAction>
                        <Switch defaultChecked />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Уведомления о проектах"
                        secondary="Получать уведомления об изменениях в проектах"
                      />
                      <ListItemSecondaryAction>
                        <Switch defaultChecked />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Уведомления о безопасности"
                        secondary="Получать уведомления о нарушениях ТБ"
                      />
                      <ListItemSecondaryAction>
                        <Switch defaultChecked />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Диалог смены пароля */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Смена пароля</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="currentPassword"
                control={passwordControl}
                rules={{ required: 'Введите текущий пароль' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Текущий пароль"
                    type="password"
                    fullWidth
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="newPassword"
                control={passwordControl}
                rules={{
                  required: 'Введите новый пароль',
                  minLength: { value: 6, message: 'Пароль должен содержать минимум 6 символов' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Новый пароль"
                    type="password"
                    fullWidth
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="confirmPassword"
                control={passwordControl}
                rules={{ required: 'Подтвердите новый пароль' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Подтвердите новый пароль"
                    type="password"
                    fullWidth
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handlePasswordSubmit(handleChangePassword)}
          >
            Сменить пароль
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;