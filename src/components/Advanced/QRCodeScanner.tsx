import React, { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  QrCodeScanner as QrIcon,
  Close as CloseIcon,
  FlashOn as FlashOnIcon,
  FlashOff as FlashOffIcon,
  CameraAlt as CameraIcon,
  Inventory as InventoryIcon,
  Build as ToolIcon,
} from '@mui/icons-material';

interface QRCodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: QRScanResult) => void;
  scanType?: 'material' | 'tool' | 'equipment' | 'all';
}

interface QRScanResult {
  type: 'material' | 'tool' | 'equipment';
  id: string;
  name: string;
  category: string;
  location?: string;
  status?: string;
  lastUpdated: Date;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  open,
  onClose,
  onScan,
  scanType = 'all'
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanResult, setLastScanResult] = useState<QRScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Симуляция QR кода (в реальности здесь был бы QR-сканер)
  const mockQRData: { [key: string]: QRScanResult } = {
    'MAT001': {
      type: 'material',
      id: 'MAT001',
      name: 'Цемент М400',
      category: 'Сухие смеси',
      location: 'Склад А, полка 1',
      status: 'В наличии',
      lastUpdated: new Date(),
    },
    'TOOL001': {
      type: 'tool',
      id: 'TOOL001',
      name: 'Дрель Bosch GSB 13 RE',
      category: 'Электроинструмент',
      location: 'Инструментальная',
      status: 'Свободен',
      lastUpdated: new Date(),
    },
    'EQ001': {
      type: 'equipment',
      id: 'EQ001',
      name: 'Экскаватор CAT 320D',
      category: 'Тяжелая техника',
      location: 'Стройплощадка №1',
      status: 'В работе',
      lastUpdated: new Date(),
    },
  };

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Задняя камера
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      setError('Не удалось получить доступ к камере');
      setIsScanning(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const toggleFlash = useCallback(async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled }]
          });
          setFlashEnabled(!flashEnabled);
        } catch (err) {
          console.error('Не удалось включить/выключить вспышку:', err);
        }
      }
    }
  }, [flashEnabled]);

  // Симуляция сканирования QR кода
  const simulateScan = useCallback(() => {
    const qrCodes = Object.keys(mockQRData);
    const randomCode = qrCodes[Math.floor(Math.random() * qrCodes.length)];
    const result = mockQRData[randomCode];
    
    if (scanType === 'all' || result.type === scanType) {
      setLastScanResult(result);
      onScan(result);
    } else {
      setError(`QR код не соответствует типу сканирования: ${scanType}`);
    }
  }, [scanType, onScan]);

  React.useEffect(() => {
    if (open && !isScanning) {
      startCamera();
    } else if (!open) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera, isScanning]);

  const handleClose = () => {
    stopCamera();
    setError(null);
    setLastScanResult(null);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'material':
        return <InventoryIcon fontSize="small" />;
      case 'tool':
        return <ToolIcon fontSize="small" />;
      case 'equipment':
        return <CameraIcon fontSize="small" />;
      default:
        return <QrIcon fontSize="small" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'material':
        return 'primary';
      case 'tool':
        return 'secondary';
      case 'equipment':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'material':
        return 'Материал';
      case 'tool':
        return 'Инструмент';
      case 'equipment':
        return 'Оборудование';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrIcon />
          <Typography variant="h6">
            QR Сканер
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Область сканирования */}
        <Box sx={{ position: 'relative', backgroundColor: '#000', height: 300 }}>
          {isScanning ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              
              {/* Рамка для QR кода */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 200,
                  height: 200,
                  border: '2px solid #fff',
                  borderRadius: 2,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    width: 20,
                    height: 20,
                    borderTop: '4px solid #2196f3',
                    borderLeft: '4px solid #2196f3',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderTop: '4px solid #2196f3',
                    borderRight: '4px solid #2196f3',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    left: -2,
                    width: 20,
                    height: 20,
                    borderBottom: '4px solid #2196f3',
                    borderLeft: '4px solid #2196f3',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderBottom: '4px solid #2196f3',
                    borderRight: '4px solid #2196f3',
                  }}
                />
              </Box>

              {/* Кнопка вспышки */}
              <IconButton
                onClick={toggleFlash}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                {flashEnabled ? <FlashOnIcon /> : <FlashOffIcon />}
              </IconButton>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              flexDirection: 'column',
              gap: 2,
              color: '#fff'
            }}>
              <CircularProgress color="inherit" />
              <Typography>Подключение к камере...</Typography>
            </Box>
          )}
        </Box>

        {/* Инструкции */}
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            Наведите камеру на QR код для сканирования
          </Typography>

          {scanType !== 'all' && (
            <Chip
              icon={getTypeIcon(scanType)}
              label={`Сканирование: ${getTypeText(scanType)}`}
              color={getTypeColor(scanType) as any}
              sx={{ mb: 2 }}
            />
          )}

          {/* Ошибка */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Результат последнего сканирования */}
          {lastScanResult && (
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    icon={getTypeIcon(lastScanResult.type)}
                    label={getTypeText(lastScanResult.type)}
                    color={getTypeColor(lastScanResult.type) as any}
                    size="small"
                  />
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                    Успешно отсканировано
                  </Typography>
                </Box>
                
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {lastScanResult.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ID: {lastScanResult.id} • {lastScanResult.category}
                </Typography>
                
                {lastScanResult.location && (
                  <Typography variant="body2" color="text.secondary">
                    📍 {lastScanResult.location}
                  </Typography>
                )}
                
                {lastScanResult.status && (
                  <Typography variant="body2" color="text.secondary">
                    🔧 {lastScanResult.status}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Кнопка для тестирования */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={simulateScan}
              sx={{ mr: 1 }}
            >
              Симулировать сканирование
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Для демонстрации функционала
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeScanner;