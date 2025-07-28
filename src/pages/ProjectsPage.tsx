import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Fab,
  Tooltip,
  Avatar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Business as ProjectIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useProjectStore, useAuthStore } from '../store';
import { Project, ProjectStatus, ProjectType } from '../types';
import { formatCurrency } from '../utils';
import ProjectSelector from '../components/ProjectSelector';

interface ProjectFormData {
  name: string;
  description: string;
  clientName: string;
  clientContact: string;
  location: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  managerId: string;
}

const ProjectsPage: React.FC = () => {
  const { 
    projects, 
    loading, 
    fetchProjects, 
    createProject, 
    updateProject, 
    deleteProject,
    selectedProject,
    currentProjectId,
    isAllProjectsView
  } = useProjectStore();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Фильтр проектов по статусу из URL и выбранному проекту
  const statusFilter = searchParams.get('status');
  const filteredProjects = projects.filter(project => {
    // Фильтр по статусу из URL
    if (statusFilter) {
      if (statusFilter === 'active') {
        if (project.status !== 'in_progress') return false;
      } else if (statusFilter === 'planning') {
        if (project.status !== 'planning') return false;
      }
    }
    
    // Если выбран конкретный проект, показываем только его
    if (currentProjectId && !isAllProjectsView) {
      return project.id === currentProjectId;
    }
    
    return true;
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (data: ProjectFormData) => {
    try {
      await createProject({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        progress: 0,
        tasks: [],
        documents: [],
        expenses: [],
        team: [],
        timeline: [],
        risks: [],
        qualityChecks: [],
        safetyIncidents: [],
        materials: [],
        equipment: [],
        notes: '',
      });
      toast.success('Проект успешно создан');
      setOpenDialog(false);
      reset();
    } catch (error) {
      toast.error('Ошибка при создании проекта');
    }
  };

  const handleEditProject = async (data: ProjectFormData) => {
    if (!editingProject) return;
    
    try {
      await updateProject(editingProject.id, {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });
      toast.success('Проект успешно обновлен');
      setOpenDialog(false);
      setEditingProject(null);
      reset();
    } catch (error) {
      toast.error('Ошибка при обновлении проекта');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      toast.success('Проект удален');
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error('Ошибка при удалении проекта');
    }
  };

  const openCreateDialog = () => {
    setEditingProject(null);
    reset({
      name: '',
      description: '',
      clientName: '',
      clientContact: '',
      location: '',
      type: ProjectType.RESIDENTIAL,
      status: ProjectStatus.PLANNING,
      startDate: '',
      endDate: '',
      budget: 0,
      managerId: user?.id || '',
    });
    setOpenDialog(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    reset({
      name: project.name,
      description: project.description,
      clientName: project.clientName,
      clientContact: project.clientContact,
      location: project.location,
      type: project.type,
      status: project.status,
      startDate: format(project.startDate, 'yyyy-MM-dd'),
      endDate: format(project.endDate, 'yyyy-MM-dd'),
      budget: project.budget,
      managerId: project.managerId,
    });
    setOpenDialog(true);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING: return 'default';
      case ProjectStatus.IN_PROGRESS: return 'primary';
      case ProjectStatus.COMPLETED: return 'success';
      case ProjectStatus.ON_HOLD: return 'warning';
      case ProjectStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING: return 'Планирование';
      case ProjectStatus.TENDER: return 'Тендер';
      case ProjectStatus.APPROVED: return 'Утвержден';
      case ProjectStatus.IN_PROGRESS: return 'В работе';
      case ProjectStatus.ON_HOLD: return 'Приостановлен';
      case ProjectStatus.QUALITY_CHECK: return 'Контроль качества';
      case ProjectStatus.CLIENT_REVIEW: return 'На проверке у клиента';
      case ProjectStatus.COMPLETED: return 'Завершен';
      case ProjectStatus.CANCELLED: return 'Отменен';
      case ProjectStatus.WARRANTY: return 'Гарантийный период';
      default: return status;
    }
  };

  const getTypeLabel = (type: ProjectType) => {
    switch (type) {
      case ProjectType.RESIDENTIAL: return 'Жилищное';
      case ProjectType.COMMERCIAL: return 'Коммерческое';
      case ProjectType.INDUSTRIAL: return 'Промышленное';
      case ProjectType.INFRASTRUCTURE: return 'Инфраструктура';
      case ProjectType.RENOVATION: return 'Реновация';
      case ProjectType.DEMOLITION: return 'Снос';
      default: return type;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {statusFilter === 'active' ? 'Активные проекты' : 
             statusFilter === 'planning' ? 'Проекты в планировании' : 
             'Управление проектами'}
          </Typography>
          <ProjectSelector />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 2 }}
        >
          Создать проект
        </Button>
      </Box>

      {filteredProjects.length === 0 && !loading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ProjectIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Нет проектов
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Создайте первый проект для начала работы
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
              Создать проект
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Бюджет</TableCell>
                <TableCell>Прогресс</TableCell>
                <TableCell>Дата окончания</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <ProjectIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {project.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.location}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{project.clientName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.clientContact}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={getTypeLabel(project.type)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(project.status)}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(project.budget)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 6,
                          bgcolor: 'grey.200',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${project.progress}%`,
                            height: '100%',
                            bgcolor: 'primary.main',
                          }}
                        />
                      </Box>
                      <Typography variant="caption">{project.progress}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {format(project.endDate, 'dd.MM.yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Просмотр">
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редактировать">
                      <IconButton size="small" onClick={() => openEditDialog(project)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirmId(project.id)}
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

      {/* Диалог создания/редактирования проекта */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProject ? 'Редактировать проект' : 'Создать новый проект'}
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
                    label="Название проекта"
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
                name="clientContact"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Контакт клиента" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="location"
                control={control}
                rules={{ required: 'Адрес обязателен' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Адрес объекта"
                    fullWidth
                    error={!!errors.location}
                    helperText={errors.location?.message}
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
                    label="Описание проекта"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Тип проекта</InputLabel>
                    <Select {...field} label="Тип проекта">
                      {Object.values(ProjectType).map((type) => (
                        <MenuItem key={type} value={type}>
                          {getTypeLabel(type)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Статус</InputLabel>
                    <Select {...field} label="Статус">
                      {Object.values(ProjectStatus).map((status) => (
                        <MenuItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="budget"
                control={control}
                rules={{ required: 'Бюджет обязателен', min: { value: 0, message: 'Бюджет должен быть положительным' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Бюджет (руб.)"
                    fullWidth
                    error={!!errors.budget}
                    helperText={errors.budget?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: 'Дата начала обязательна' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Дата начала"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="endDate"
                control={control}
                rules={{ required: 'Дата окончания обязательна' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Дата окончания"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.endDate}
                    helperText={errors.endDate?.message}
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
            onClick={handleSubmit(editingProject ? handleEditProject : handleCreateProject)}
          >
            {editingProject ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteConfirmId && handleDeleteProject(deleteConfirmId)}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsPage;