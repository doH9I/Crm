import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  Fade,
  Slide,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store';

// Схема валидации
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Некорректный формат email'),
  password: z
    .string()
    .min(1, 'Пароль обязателен')
    .min(6, 'Пароль должен содержать минимум 6 символов'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@construction-crm.ru',
      password: 'admin123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      const success = await login(data.email, data.password);
      
      if (success) {
        toast.success('Добро пожаловать в систему!');
        navigate('/dashboard');
      } else {
        setLoginError('Неверный email или пароль');
        toast.error('Ошибка входа в систему');
      }
    } catch (error) {
      setLoginError('Произошла ошибка. Попробуйте снова.');
      toast.error('Произошла ошибка при входе');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #e3f2fd 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Декоративные элементы */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="sm">
        <Slide direction="up" in={true} timeout={800}>
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'visible',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Прогресс загрузки */}
            {/* <LinearProgress
              sx={{
                height: 4,
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                },
              }}
            /> */}

            <CardContent sx={{ padding: 6 }}>
              {/* Логотип и заголовок */}
              <Box textAlign="center" mb={4}>
                <Fade in={true} timeout={1000}>
                  <Box>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                        mb: 3,
                        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                      }}
                    >
                      <BusinessIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    
                    <Typography
                      variant="h4"
                      component="h1"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                      }}
                    >
                      Construction CRM
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Система управления строительной организацией
                    </Typography>

                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        background: 'rgba(25, 118, 210, 0.1)',
                        border: '1px solid rgba(25, 118, 210, 0.2)',
                      }}
                    >
                      {/* <DashboardIcon sx={{ fontSize: 20, color: 'primary.main' }} /> */}
                      <Typography variant="body2" color="primary.main" fontWeight={500}>
                        Вход в систему
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              </Box>

              {/* Ошибка авторизации */}
              {loginError && (
                <Fade in={true}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        fontSize: 24,
                      },
                    }}
                  >
                    {loginError}
                  </Alert>
                </Fade>
              )}

              {/* Демо данные */}
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  background: 'rgba(25, 118, 210, 0.05)',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                }}
              >
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Демо доступ:
                </Typography>
                <Typography variant="body2">
                  Email: admin@construction-crm.ru<br />
                  Пароль: admin123
                </Typography>
              </Alert>

              {/* Форма входа */}
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Box mb={3}>
                  <TextField
                    {...register('email')}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={false}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>

                <Box mb={4}>
                  <TextField
                    {...register('password')}
                    fullWidth
                    label="Пароль"
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={false}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            disabled={false}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={false}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                      boxShadow: '0 6px 24px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'rgba(25, 118, 210, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {'Войти в систему'}
                </Button>
              </Box>

              {/* Дополнительная информация */}
              <Box mt={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  © 2024 Construction CRM. Все права защищены.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Slide>
      </Container>

      {/* Стили для анимации */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default LoginPage;