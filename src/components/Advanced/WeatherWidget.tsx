import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Cloud as CloudyIcon,
  Grain as RainIcon,
  AcUnit as SnowIcon,
  Air as WindIcon,
  Opacity as HumidityIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { WeatherForecast } from '../../types';
import { useProjectFilterStore, useProjectStore } from '../../store';

interface WeatherWidgetProps {
  location?: string;
  compact?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  location = 'Москва', 
  compact = false 
}) => {
  const { selectedProjectId, getProjectById } = useProjectFilterStore();
  const { projects } = useProjectStore();
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Определяем локацию на основе выбранного проекта
  const currentLocation = React.useMemo(() => {
    if (selectedProjectId) {
      const project = getProjectById(selectedProjectId);
      if (project) {
        // Извлекаем город из адреса проекта
        const addressParts = project.address.split(',');
        return addressParts[0].replace('г. ', '').trim();
      }
    }
    return location || 'Москва';
  }, [selectedProjectId, getProjectById, location]);

  // Симуляция получения данных о погоде
  const mockWeatherData: WeatherForecast = {
    id: '1',
    location: currentLocation,
    date: new Date(),
    temperature: { min: -5, max: 2 },
    humidity: 75,
    windSpeed: 12,
    precipitation: 0,
    condition: 'cloudy',
    visibility: 8,
    uvIndex: 1,
    workRecommendation: 'limited',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockForecastData: WeatherForecast[] = [
    {
      ...mockWeatherData,
      id: '2',
      date: new Date(Date.now() + 86400000),
      temperature: { min: -3, max: 5 },
      condition: 'sunny',
      precipitation: 0,
      workRecommendation: 'good',
    },
    {
      ...mockWeatherData,
      id: '3',
      date: new Date(Date.now() + 172800000),
      temperature: { min: 0, max: 8 },
      condition: 'rainy',
      precipitation: 65,
      workRecommendation: 'not_recommended',
    },
    {
      ...mockWeatherData,
      id: '4',
      date: new Date(Date.now() + 259200000),
      temperature: { min: 2, max: 10 },
      condition: 'partly_cloudy',
      precipitation: 20,
      workRecommendation: 'ideal',
    },
  ];

  useEffect(() => {
    fetchWeatherData();
  }, [currentLocation]);

  // Функция для генерации URL карты
  const getMapUrl = () => {
    if (selectedProjectId) {
      const project = getProjectById(selectedProjectId);
      if (project) {
        // URL для конкретного проекта
        return `ll=${getCoordinatesForAddress(project.address)}&pt=${getCoordinatesForAddress(project.address)},pm2rdm&z=14`;
      }
    }
    
    // URL для всех объектов
    const allProjects = projects.filter(p => p.address);
    if (allProjects.length > 0) {
      const points = allProjects.map(p => {
        const coords = getCoordinatesForAddress(p.address);
        return `${coords},pm2rdm`;
      }).join('~');
      return `pt=${points}&z=10`;
    }
    
    // Москва по умолчанию
    return `ll=37.617734,55.755826&pt=37.617734,55.755826,pm2rdm&z=10`;
  };

  // Функция для получения координат по адресу (заглушка)
  const getCoordinatesForAddress = (address: string) => {
    // Простая заглушка для координат городов
    const cityCoords: {[key: string]: string} = {
      'Москва': '37.617734,55.755826',
      'Санкт-Петербург': '30.335027,59.934280',
      'Екатеринбург': '60.612234,56.837430',
    };
    
    const city = address.split(',')[0].replace('г. ', '').trim();
    return cityCoords[city] || cityCoords['Москва'];
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWeather(mockWeatherData);
      setForecast(mockForecastData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <SunnyIcon sx={{ color: '#FFA726', fontSize: compact ? 24 : 32 }} />;
      case 'cloudy':
      case 'partly_cloudy':
        return <CloudyIcon sx={{ color: '#78909C', fontSize: compact ? 24 : 32 }} />;
      case 'rainy':
        return <RainIcon sx={{ color: '#42A5F5', fontSize: compact ? 24 : 32 }} />;
      case 'snowy':
        return <SnowIcon sx={{ color: '#E3F2FD', fontSize: compact ? 24 : 32 }} />;
      default:
        return <CloudyIcon sx={{ color: '#78909C', fontSize: compact ? 24 : 32 }} />;
    }
  };

  const getConditionText = (condition: string) => {
    const conditions = {
      sunny: 'Солнечно',
      cloudy: 'Облачно',
      partly_cloudy: 'Переменная облачность',
      rainy: 'Дождь',
      snowy: 'Снег',
    };
    return conditions[condition as keyof typeof conditions] || 'Неизвестно';
  };

  const getWorkRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'ideal':
        return 'success';
      case 'good':
        return 'info';
      case 'limited':
        return 'warning';
      case 'not_recommended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getWorkRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'ideal':
        return 'Отличные условия';
      case 'good':
        return 'Хорошие условия';
      case 'limited':
        return 'Ограниченные условия';
      case 'not_recommended':
        return 'Не рекомендуется';
      default:
        return 'Неизвестно';
    }
  };

  const getWorkRecommendationIcon = (recommendation: string): React.ReactElement => {
    switch (recommendation) {
      case 'good':
        return <CheckIcon fontSize="small" />;
      case 'limited':
      case 'not_recommended':
        return <WarningIcon fontSize="small" />;
      default:
        return <span />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Погода
            </Typography>
          </Box>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Не удалось загрузить данные о погоде
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getWeatherIcon(weather.condition)}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {weather.temperature.max}°
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getConditionText(weather.condition)}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={getWorkRecommendationText(weather.workRecommendation)}
              color={getWorkRecommendationColor(weather.workRecommendation) as any}
              icon={getWorkRecommendationIcon(weather.workRecommendation)}
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Погода - {currentLocation}
          </Typography>
          <Tooltip title="Обновить">
            <IconButton size="small" onClick={fetchWeatherData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Текущая погода */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          {getWeatherIcon(weather.condition)}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {weather.temperature.max}°
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {getConditionText(weather.condition)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ощущается как {weather.temperature.min}° - {weather.temperature.max}°
            </Typography>
          </Box>
        </Box>

        {/* Рекомендация для работ */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={getWorkRecommendationText(weather.workRecommendation)}
            color={getWorkRecommendationColor(weather.workRecommendation) as any}
            icon={getWorkRecommendationIcon(weather.workRecommendation)}
            sx={{ mb: 2 }}
          />
          
          {weather.workRecommendation === 'not_recommended' && (
            <Alert severity="warning" sx={{ fontSize: '0.875rem' }}>
              Не рекомендуется проводить наружные работы из-за неблагоприятных погодных условий
            </Alert>
          )}
          
          {weather.workRecommendation === 'limited' && (
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              Возможны ограничения для некоторых видов работ. Соблюдайте меры предосторожности
            </Alert>
          )}
        </Box>

        {/* Детали погоды */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WindIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Ветер
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {weather.windSpeed} м/с
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HumidityIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Влажность
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {weather.humidity}%
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Видимость
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {weather.visibility} км
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RainIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Осадки
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {weather.precipitation}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Прогноз на 4 дня */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Прогноз на 4 дня
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
            {forecast.map((day, index) => (
              <Box
                key={day.id}
                sx={{
                  minWidth: 80,
                  textAlign: 'center',
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(25, 118, 210, 0.05)',
                  border: '1px solid rgba(25, 118, 210, 0.1)',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  {index === 0 ? 'Завтра' : new Date(day.date).toLocaleDateString('ru', { weekday: 'short' })}
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  {getWeatherIcon(day.condition)}
                </Box>
                
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {day.temperature.max}°
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                  {day.temperature.min}°
                </Typography>
                
                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    label={day.workRecommendation === 'ideal' ? '✓' : 
                           day.workRecommendation === 'good' ? '○' :
                           day.workRecommendation === 'limited' ? '!' : '✗'}
                    color={getWorkRecommendationColor(day.workRecommendation) as any}
                    sx={{ 
                      minWidth: 'auto',
                      width: 24,
                      height: 20,
                      fontSize: '0.7rem',
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Карта объектов */}
        {!compact && (
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {selectedProjectId ? 'Местоположение проекта' : 'Все объекты'}
            </Typography>
            <Box 
              sx={{ 
                height: 200, 
                bgcolor: 'grey.100', 
                borderRadius: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid',
                borderColor: 'grey.300',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Заглушка карты Яндекс */}
              <iframe
                src={`https://yandex.ru/map-widget/v1/?um=constructor%3A${encodeURIComponent(getMapUrl())}&amp;source=constructor`}
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 'none' }}
                title={`Карта - ${currentLocation}`}
              />
              
              {/* Overlay с информацией */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                📍 {currentLocation}
              </Box>
            </Box>
          </Box>
        )}

        {/* Время обновления */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
          Обновлено: {lastUpdated.toLocaleTimeString('ru')}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;