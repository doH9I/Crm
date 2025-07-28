import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAppStore, useAuthStore } from '../store';
import { formatCurrency } from '../utils';
import ProjectSelector from '../components/ProjectSelector';

interface CompanyFormData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  inn: string;
  kpp: string;
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
}

interface WorkingHoursData {
  start: string;
  end: string;
  lunchStart: string;
  lunchEnd: string;
}

interface SecuritySettingsData {
  passwordMinLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  twoFactorRequired: boolean;
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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useAppStore();
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);

  const { control: companyControl, handleSubmit: handleCompanySubmit, reset: resetCompany, formState: { errors: companyErrors } } = useForm<CompanyFormData>();
  const { control: hoursControl, handleSubmit: handleHoursSubmit, reset: resetHours } = useForm<WorkingHoursData>();
  const { control: securityControl, handleSubmit: handleSecuritySubmit, reset: resetSecurity } = useForm<SecuritySettingsData>();

  useEffect(() => {
    if (settings) {
      resetCompany({
        companyName: settings.companyName,
        companyAddress: settings.companyAddress,
        companyPhone: settings.companyPhone,
        companyEmail: settings.companyEmail,
        companyWebsite: settings.companyWebsite,
        inn: settings.inn,
        kpp: settings.kpp,
        currency: settings.currency,
        timezone: settings.timezone,
        language: settings.language,
        dateFormat: settings.dateFormat,
      });

      resetHours({
        start: settings.workingHours.start,
        end: settings.workingHours.end,
        lunchStart: settings.workingHours.lunchStart,
        lunchEnd: settings.workingHours.lunchEnd,
      });

      resetSecurity({
        passwordMinLength: settings.security.passwordPolicy.minLength,
        requireUppercase: settings.security.passwordPolicy.requireUppercase,
        requireNumbers: settings.security.passwordPolicy.requireNumbers,
        requireSpecialChars: settings.security.passwordPolicy.requireSpecialChars,
        sessionTimeout: settings.security.sessionTimeout,
        maxLoginAttempts: settings.security.maxLoginAttempts,
        twoFactorRequired: settings.security.twoFactorRequired,
      });
    }
  }, [settings, resetCompany, resetHours, resetSecurity]);

  const handleSaveCompanySettings = async (data: CompanyFormData) => {
    try {
      await updateSettings({
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyPhone: data.companyPhone,
        companyEmail: data.companyEmail,
        companyWebsite: data.companyWebsite,
        inn: data.inn,
        kpp: data.kpp,
        currency: data.currency,
        timezone: data.timezone,
        language: data.language,
        dateFormat: data.dateFormat,
      });
      toast.success('Настройки компании сохранены');
    } catch (error) {
      toast.error('Ошибка при сохранении настроек');
    }
  };

  const handleSaveWorkingHours = async (data: WorkingHoursData) => {
    try {
      await updateSettings({
        workingHours: data,
      });
      toast.success('Рабочие часы обновлены');
    } catch (error) {
      toast.error('Ошибка при обновлении рабочих часов');
    }
  };

  const handleSaveSecuritySettings = async (data: SecuritySettingsData) => {
    try {
      await updateSettings({
        security: {
          passwordPolicy: {
            minLength: data.passwordMinLength,
            requireUppercase: data.requireUppercase,
            requireNumbers: data.requireNumbers,
            requireSpecialChars: data.requireSpecialChars,
          },
          sessionTimeout: data.sessionTimeout,
          maxLoginAttempts: data.maxLoginAttempts,
          twoFactorRequired: data.twoFactorRequired,
        },
      });
      toast.success('Настройки безопасности обновлены');
    } catch (error) {
      toast.error('Ошибка при обновлении настроек безопасности');
    }
  };

  const handleCreateBackup = () => {
    // Симуляция создания резервной копии
    toast.success('Резервная копия создана успешно');
    setBackupDialogOpen(false);
  };

  const handleClearCache = () => {
    // Симуляция очистки кэша
    if (window.caches) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    localStorage.removeItem('app-store');
    toast.success('Кэш очищен');
  };

  // Проверяем права доступа
  const canManageSettings = user?.role === 'admin';

  if (!canManageSettings) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          У вас нет прав для управления настройками системы
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Настройки системы
          </Typography>
          <ProjectSelector />
        </Box>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Компания" icon={<BusinessIcon />} />
          <Tab label="Рабочее время" icon={<ScheduleIcon />} />
          <Tab label="Безопасность" icon={<SecurityIcon />} />
          <Tab label="Уведомления" icon={<NotificationsIcon />} />
          <Tab label="Система" icon={<PaletteIcon />} />
        </Tabs>

        {/* Вкладка "Компания" */}
        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Информация о компании
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleCompanySubmit(handleSaveCompanySettings)}
                >
                  Сохранить
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="companyName"
                    control={companyControl}
                    rules={{ required: 'Название компании обязательно' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Название компании"
                        fullWidth
                        error={!!companyErrors.companyName}
                        helperText={companyErrors.companyName?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="companyPhone"
                    control={companyControl}
                    render={({ field }) => (
                      <TextField {...field} label="Телефон" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="companyEmail"
                    control={companyControl}
                    rules={{
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
                        error={!!companyErrors.companyEmail}
                        helperText={companyErrors.companyEmail?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="companyWebsite"
                    control={companyControl}
                    render={({ field }) => (
                      <TextField {...field} label="Веб-сайт" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="companyAddress"
                    control={companyControl}
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
                    control={companyControl}
                    render={({ field }) => (
                      <TextField {...field} label="ИНН" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="kpp"
                    control={companyControl}
                    render={({ field }) => (
                      <TextField {...field} label="КПП" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="currency"
                    control={companyControl}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Валюта</InputLabel>
                        <Select {...field} label="Валюта">
                          <MenuItem value="RUB">Рубль (RUB)</MenuItem>
                          <MenuItem value="USD">Доллар (USD)</MenuItem>
                          <MenuItem value="EUR">Евро (EUR)</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="timezone"
                    control={companyControl}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Часовой пояс</InputLabel>
                        <Select {...field} label="Часовой пояс">
                          <MenuItem value="Europe/Moscow">Москва (UTC+3)</MenuItem>
                          <MenuItem value="Europe/Kaliningrad">Калининград (UTC+2)</MenuItem>
                          <MenuItem value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</MenuItem>
                          <MenuItem value="Asia/Novosibirsk">Новосибирск (UTC+7)</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="language"
                    control={companyControl}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Язык</InputLabel>
                        <Select {...field} label="Язык">
                          <MenuItem value="ru">Русский</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Вкладка "Рабочее время" */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  График работы
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleHoursSubmit(handleSaveWorkingHours)}
                >
                  Сохранить
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="start"
                    control={hoursControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Начало рабочего дня"
                        type="time"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="end"
                    control={hoursControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Конец рабочего дня"
                        type="time"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="lunchStart"
                    control={hoursControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Начало обеда"
                        type="time"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="lunchEnd"
                    control={hoursControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Конец обеда"
                        type="time"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Рабочие дни
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map((day, index) => (
                  <Chip
                    key={day}
                    label={day}
                    color={settings?.workingDays.includes(index + 1) ? 'primary' : 'default'}
                    variant={settings?.workingDays.includes(index + 1) ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Вкладка "Безопасность" */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Настройки безопасности
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSecuritySubmit(handleSaveSecuritySettings)}
                >
                  Сохранить
                </Button>
              </Box>

              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Политика паролей
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="passwordMinLength"
                    control={securityControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Минимальная длина пароля"
                        type="number"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="sessionTimeout"
                    control={securityControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Тайм-аут сессии (минуты)"
                        type="number"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="requireUppercase"
                    control={securityControl}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Требовать заглавные буквы в пароле"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="requireNumbers"
                    control={securityControl}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Требовать цифры в пароле"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="requireSpecialChars"
                    control={securityControl}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Требовать специальные символы в пароле"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="twoFactorRequired"
                    control={securityControl}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Требовать двухфакторную аутентификацию"
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Ограничения доступа
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="maxLoginAttempts"
                    control={securityControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Максимальное количество попыток входа"
                        type="number"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Вкладка "Уведомления" */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Настройки уведомлений
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="Email уведомления"
                    secondary="Отправлять уведомления на email"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked={settings?.notifications.email} />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Push уведомления"
                    secondary="Отправлять push уведомления"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked={settings?.notifications.push} />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="SMS уведомления"
                    secondary="Отправлять SMS уведомления"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked={settings?.notifications.sms} />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Низкий остаток на складе"
                    secondary="Уведомления о нехватке материалов"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked={settings?.notifications.lowStock} />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Дедлайны проектов"
                    secondary="Уведомления о приближающихся сроках"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked={settings?.notifications.projectDeadlines} />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Нарушения ТБ"
                    secondary="Уведомления о проблемах безопасности"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked={settings?.notifications.safetyAlerts} />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Превышение бюджета"
                    secondary="Уведомления о превышении бюджета проектов"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked={settings?.notifications.budgetOverruns} />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Вкладка "Система" */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Резервное копирование
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Создание резервной копии данных системы
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setBackupDialogOpen(true)}
                    fullWidth
                  >
                    Создать резервную копию
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Очистка кэша
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Очистка временных файлов и кэша браузера
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleClearCache}
                    fullWidth
                  >
                    Очистить кэш
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Информация о системе
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Версия системы:
                      </Typography>
                      <Typography variant="body1">v1.0.0</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Последнее обновление:
                      </Typography>
                      <Typography variant="body1">2024-01-15</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        База данных:
                      </Typography>
                      <Typography variant="body1">PostgreSQL 15</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Сервер:
                      </Typography>
                      <Typography variant="body1">Node.js 18.x</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Диалог создания резервной копии */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)}>
        <DialogTitle>Создание резервной копии</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Будет создана полная резервная копия системы, включая:
          </Typography>
          <List dense>
            <ListItem>• Все проекты и задачи</ListItem>
            <ListItem>• Данные сотрудников</ListItem>
            <ListItem>• Финансовые записи</ListItem>
            <ListItem>• Склад и материалы</ListItem>
            <ListItem>• Настройки системы</ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            Процесс может занять несколько минут в зависимости от объема данных.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreateBackup}>
            Создать копию
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;