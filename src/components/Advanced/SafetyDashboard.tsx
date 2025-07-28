import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Assignment as ReportIcon,
  School as TrainingIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  Healing as InjuryIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LineChart, Line } from 'recharts';
import { SafetyIncident, Training } from '../../types';

interface SafetyDashboardProps {
  projectId?: string;
}

const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ projectId }) => {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  // Симуляция данных безопасности
  const mockIncidents: SafetyIncident[] = [
    {
      id: '1',
      projectId: 'project-1',
      reportedBy: 'user-3',
      date: new Date(),
      location: 'Стройплощадка №1',
      type: 'injury',
      severity: 'medium',
      description: 'Рабочий упал с лесов, получил ушибы',
      peopleInvolved: ['user-1', 'user-2'],
      immediateAction: 'Оказана первая помощь',
      status: 'resolved',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      projectId: 'project-2',
      reportedBy: 'user-5',
      date: new Date(),
      location: 'Стройплощадка №2, подъемник',
      type: 'injury',
      severity: 'low',
      description: 'Порез руки при работе с металлом',
      peopleInvolved: ['user-4'],
      immediateAction: 'Оказана первая помощь, отправлен в медпункт',
      status: 'investigating',
      createdAt: new Date(),
      updatedAt: new Date(),
      injuries: [{
        personId: 'user-4',
        injuryType: 'Порез',
        bodyPart: 'Правая рука',
        severity: 'minor',
        medicalAttention: true,
        hospitalName: 'Медпункт на объекте',
      }],
    },
  ];

  const mockTrainings: Training[] = [
    {
      id: '1',
      name: 'Охрана труда: Работа на высоте',
      type: 'safety',
      description: 'Обучение безопасной работе на высоте',
      duration: 4,
      startDate: new Date(),
      endDate: new Date(),
      status: 'planned',
      participants: [
        { userId: 'user-1', status: 'enrolled' },
      ],
      instructor: 'Иванов И.И.',
      location: 'Учебный класс 1',
      updatedAt: new Date(),
      isOnline: false,
      cost: 15000,
      isRequired: true,
      certificate: true,
      createdAt: new Date(),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Симуляция загрузки данных
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIncidents(mockIncidents);
        setTrainings(mockTrainings);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Статистика инцидентов по типам
  const incidentsByType = incidents.reduce((acc, incident) => {
    acc[incident.type] = (acc[incident.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const incidentTypeData = Object.entries(incidentsByType).map(([type, count]) => ({
    name: getIncidentTypeText(type),
    value: count,
    color: getIncidentTypeColor(type),
  }));

  // Статистика по месяцам
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.date);
      return incidentDate.getMonth() === date.getMonth() && 
             incidentDate.getFullYear() === date.getFullYear();
    }).length;
    
    return {
      month: date.toLocaleDateString('ru', { month: 'short' }),
      incidents: monthIncidents,
    };
  }).reverse();

  // Статистика по серьезности
  const severityData = [
    { name: 'Низкая', value: incidents.filter(i => i.severity === 'low').length, color: '#4CAF50' },
    { name: 'Средняя', value: incidents.filter(i => i.severity === 'medium').length, color: '#FF9800' },
    { name: 'Высокая', value: incidents.filter(i => i.severity === 'high').length, color: '#F44336' },
    { name: 'Критическая', value: incidents.filter(i => i.severity === 'critical').length, color: '#9C27B0' },
  ];

  function getIncidentTypeText(type: string): string {
    const types = {
      injury: 'Травма',
      near_miss: 'Почти несчастный случай',
      property_damage: 'Повреждение имущества',
      environmental: 'Экологическое нарушение',
      security: 'Нарушение безопасности',
    };
    return types[type as keyof typeof types] || type;
  }

  function getIncidentTypeColor(type: string): string {
    const colors = {
      injury: '#F44336',
      near_miss: '#FF9800',
      property_damage: '#2196F3',
      environmental: '#4CAF50',
      security: '#9C27B0',
    };
    return colors[type as keyof typeof colors] || '#757575';
  }

  function getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'reported': return 'info';
      case 'investigating': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  }

  // Расчет показателей безопасности
  const totalIncidents = incidents.length;
  const injuriesCount = incidents.filter(i => i.type === 'injury').length;
  const nearMissCount = incidents.filter(i => i.type === 'near_miss').length;
  const safetyScore = Math.max(0, 100 - (injuriesCount * 20 + nearMissCount * 5));
  const completedTrainings = trainings.filter(t => t.status === 'completed').length;
  const upcomingTrainings = trainings.filter(t => t.status === 'planned').length;

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Загрузка данных безопасности...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Дашборд безопасности
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 3 }}
        >
          Сообщить об инциденте
        </Button>
      </Box>

      {/* Основные показатели */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {safetyScore}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Индекс безопасности
                  </Typography>
                </Box>
                <SecurityIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {totalIncidents}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Всего инцидентов
                  </Typography>
                </Box>
                <ReportIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF5722 0%, #E64A19 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {injuriesCount}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Травмы
                  </Typography>
                </Box>
                <InjuryIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {completedTrainings}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Обучений завершено
                  </Typography>
                </Box>
                <TrainingIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Графики и анализ */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Инциденты по типам */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Инциденты по типам
              </Typography>
              {incidentTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incidentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incidentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography>Нет зарегистрированных инцидентов</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Инциденты по серьезности */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Инциденты по серьезности
              </Typography>
              {severityData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={severityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography>Отличная работа! Серьезных инцидентов нет</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Динамика инцидентов */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Динамика инцидентов по месяцам
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="incidents" 
                    stroke="#2196F3" 
                    strokeWidth={3}
                    dot={{ fill: '#2196F3', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Последние инциденты */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Последние инциденты
              </Typography>
              {incidents.length > 0 ? (
                <List>
                  {incidents.slice(0, 5).map((incident, index) => (
                    <React.Fragment key={incident.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ 
                            bgcolor: getIncidentTypeColor(incident.type),
                            width: 40,
                            height: 40 
                          }}>
                            {incident.type === 'injury' ? <InjuryIcon /> : <WarningIcon />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {getIncidentTypeText(incident.type)}
                              </Typography>
                              <Chip
                                size="small"
                                label={incident.severity}
                                color={getSeverityColor(incident.severity) as any}
                              />
                              <Chip
                                size="small"
                                label={incident.status}
                                color={getStatusColor(incident.status) as any}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {incident.description}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocationIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {incident.location}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ScheduleIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(incident.date).toLocaleDateString('ru')}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < incidents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Отличная работа!
                  </Typography>
                  <Typography color="text.secondary">
                    Инцидентов безопасности не зарегистрировано
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Ближайшие обучения */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Ближайшие обучения
              </Typography>
              {trainings.length > 0 ? (
                <List>
                  {trainings.filter(t => t.status === 'planned').map((training, index) => (
                    <React.Fragment key={training.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <TrainingIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {training.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(training.startDate).toLocaleDateString('ru')}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                {training.duration} часов • {training.participants.length} участников
                              </Typography>
                              {training.isRequired && (
                                <Chip
                                  size="small"
                                  label="Обязательно"
                                  color="warning"
                                  sx={{ ml: 1, mt: 0.5 }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < trainings.filter(t => t.status === 'planned').length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Нет запланированных обучений
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Рекомендации по безопасности */}
      {safetyScore < 80 && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Рекомендации по улучшению безопасности:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {injuriesCount > 0 && (
                <li>Провести дополнительный инструктаж по технике безопасности</li>
              )}
              {nearMissCount > 2 && (
                <li>Усилить контроль за соблюдением мер безопасности</li>
              )}
              {upcomingTrainings === 0 && (
                <li>Запланировать обучение по технике безопасности</li>
              )}
              <li>Регулярно проводить аудит рабочих мест</li>
            </Box>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default SafetyDashboard;