import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Badge,
  Paper,
  List,
  ListItem,
} from '@mui/material';
import {
  Business as ProjectIcon,
  AccountBalance as FinanceIcon,
  Assessment as ReportIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MoneyIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Functions as CalculatorIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  Savings as SavingsIcon,
  AllInclusive as AllProjectsIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { useProjectStore, useProjectFilterStore } from '../../store';

const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjectStore();
  const { selectedProjectId, setSelectedProject, getProjectById } = useProjectFilterStore();
  
  const [financeMenuAnchor, setFinanceMenuAnchor] = useState<null | HTMLElement>(null);
  const [reportsMenuAnchor, setReportsMenuAnchor] = useState<null | HTMLElement>(null);

  // Загружаем проекты при монтировании компонента
  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null;

  const handleProjectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const projectId = event.target.value === 'all' ? null : event.target.value as string;
    setSelectedProject(projectId);
  };

  const handleFinanceMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFinanceMenuAnchor(event.currentTarget);
  };

  const handleFinanceMenuClose = () => {
    setFinanceMenuAnchor(null);
  };

  const handleReportsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setReportsMenuAnchor(event.currentTarget);
  };

  const handleReportsMenuClose = () => {
    setReportsMenuAnchor(null);
  };

  const financeMenuItems = [
    { 
      id: 'overview', 
      label: 'Обзор финансов', 
      icon: <MoneyIcon />, 
      path: '/finances',
      description: 'Общие финансовые показатели'
    },
    { 
      id: 'budget', 
      label: 'Бюджеты', 
      icon: <CalculatorIcon />, 
      path: '/finances/budget',
      description: 'Планирование и контроль бюджета'
    },
    { 
      id: 'invoices', 
      label: 'Счета и инвойсы', 
      icon: <ReceiptIcon />, 
      path: '/finances/invoices',
      description: 'Управление счетами'
    },
    { 
      id: 'payments', 
      label: 'Платежи', 
      icon: <CreditCardIcon />, 
      path: '/finances/payments',
      description: 'Входящие и исходящие платежи'
    },
    { 
      id: 'cashflow', 
      label: 'Денежные потоки', 
      icon: <TrendingUpIcon />, 
      path: '/finances/cashflow',
      description: 'Анализ движения средств'
    },
    { 
      id: 'profitability', 
      label: 'Рентабельность', 
      icon: <SavingsIcon />, 
      path: '/finances/profitability',
      description: 'Анализ прибыльности проектов'
    },
  ];

  const reportsMenuItems = [
    { 
      id: 'dashboard', 
      label: 'Дашборд аналитики', 
      icon: <DashboardIcon />, 
      path: '/reports',
      description: 'Интерактивный дашборд'
    },
    { 
      id: 'financial', 
      label: 'Финансовые отчёты', 
      icon: <MoneyIcon />, 
      path: '/reports?type=financial',
      description: 'P&L, бюджеты, прогнозы'
    },
    { 
      id: 'project', 
      label: 'Отчёты по проектам', 
      icon: <ProjectIcon />, 
      path: '/reports?type=project',
      description: 'Прогресс, ресурсы, качество'
    },
    { 
      id: 'hr', 
      label: 'HR аналитика', 
      icon: <AnalyticsIcon />, 
      path: '/reports?type=hr',
      description: 'Персонал, время, эффективность'
    },
    { 
      id: 'predictive', 
      label: 'Предиктивная аналитика', 
      icon: <AnalyticsIcon />, 
      path: '/reports?type=predictive',
      description: 'ML прогнозы и оптимизация'
    },
    { 
      id: 'builder', 
      label: 'Конструктор отчётов', 
      icon: <BarChartIcon />, 
      path: '/reports/builder',
      description: 'Создание пользовательских отчётов'
    },
  ];

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        px: 3, 
        py: 1.5, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3,
        borderRadius: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(90deg, #fafafa 0%, #ffffff 100%)',
      }}
    >
      {/* Выбор проекта */}
      <Box sx={{ minWidth: 250 }}>
        <FormControl size="small" fullWidth>
          <InputLabel>Выбор проекта</InputLabel>
          <Select
            value={selectedProjectId || 'all'}
            label="Выбор проекта"
            onChange={handleProjectChange}
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              },
            }}
          >
            <MenuItem value="all">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AllProjectsIcon fontSize="small" />
                <Box>
                  <Typography variant="body2">Все проекты</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Общий обзор
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ProjectIcon fontSize="small" />
                  <Box>
                    <Typography variant="body2">{project.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Прогресс: {project.progress || 0}%
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {selectedProject && (
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Chip 
              label={`${selectedProject.progress || 0}%`}
              color="primary" 
              size="small" 
            />
            <Chip 
              label={selectedProject.status === 'in_progress' ? 'В работе' : 'Планирование'}
              color={selectedProject.status === 'in_progress' ? 'success' : 'warning'} 
              size="small"
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      {/* Финансы */}
      <Tooltip title="Финансовые инструменты">
        <Button
          variant="outlined"
          startIcon={<FinanceIcon />}
          endIcon={<ArrowDropDownIcon />}
          onClick={handleFinanceMenuOpen}
          sx={{
            minWidth: 140,
            justifyContent: 'space-between',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'white',
            }
          }}
        >
          Финансы
        </Button>
      </Tooltip>

      <Menu
        anchorEl={financeMenuAnchor}
        open={Boolean(financeMenuAnchor)}
        onClose={handleFinanceMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            minWidth: 280,
            maxWidth: 320,
            mt: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Финансовые инструменты
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Управление финансами проекта
          </Typography>
        </Box>

        <List sx={{ p: 1 }}>
          {financeMenuItems.map((item) => (
            <ListItem
              key={item.id}
              onClick={() => {
                navigate(item.path);
                handleFinanceMenuClose();
              }}
              sx={{
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider />
        
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            💡 Совет: Используйте дашборд для быстрого обзора
          </Typography>
        </Box>
      </Menu>

      {/* Отчёты и аналитика */}
      <Tooltip title="Отчёты и аналитика">
        <Button
          variant="outlined"
          startIcon={<ReportIcon />}
          endIcon={<ArrowDropDownIcon />}
          onClick={handleReportsMenuOpen}
          sx={{
            minWidth: 160,
            justifyContent: 'space-between',
            '&:hover': {
              backgroundColor: 'secondary.light',
              color: 'white',
            }
          }}
        >
          Отчёты
          <Badge badgeContent="AI" color="error" sx={{ ml: 1 }} />
        </Button>
      </Tooltip>

      <Menu
        anchorEl={reportsMenuAnchor}
        open={Boolean(reportsMenuAnchor)}
        onClose={handleReportsMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            minWidth: 300,
            maxWidth: 350,
            mt: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Отчёты и аналитика
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Расширенная аналитика с ИИ
          </Typography>
        </Box>

        <List sx={{ p: 1 }}>
          {reportsMenuItems.map((item) => (
            <ListItem
              key={item.id}
              onClick={() => {
                navigate(item.path);
                handleReportsMenuClose();
              }}
              sx={{
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'secondary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.label}
                    {item.id === 'predictive' && (
                      <Chip label="AI" size="small" color="error" sx={{ height: 16, fontSize: '0.6rem' }} />
                    )}
                  </Box>
                }
                secondary={item.description}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider />
        
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            🚀 Новинка: Предиктивная аналитика с машинным обучением
          </Typography>
        </Box>
      </Menu>

      {/* Спейсер */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Индикатор выбранного проекта */}
      {selectedProject && (
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1,
            backgroundColor: 'primary.light',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Typography variant="caption" sx={{ display: 'block' }}>
            Активный проект:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedProject.name}
          </Typography>
        </Paper>
      )}
    </Paper>
  );
};

export default TopNavbar;