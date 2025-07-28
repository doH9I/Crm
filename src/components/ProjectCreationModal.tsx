import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { ProjectType, ProjectStatus } from '../types';

interface ProjectCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

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
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
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
    },
  });

  const handleFormSubmit = (data: ProjectFormData) => {
    onSubmit(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Создать новый проект
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
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
                  label="Клиент"
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
                  rows={2}
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
              rules={{ 
                required: 'Бюджет обязателен', 
                min: { value: 0, message: 'Бюджет должен быть положительным' } 
              }}
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
        <Button onClick={handleClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(handleFormSubmit)}
          sx={{ borderRadius: 2 }}
        >
          Создать проект
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectCreationModal;