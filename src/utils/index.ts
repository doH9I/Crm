import { format, parseISO, isValid, differenceInDays, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Объединение классов Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Форматирование валюты
export const formatCurrency = (amount: number, currency = 'RUB'): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Форматирование чисел
export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Форматирование процентов
export const formatPercent = (value: number, decimals = 1): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

// Работа с датами
export const formatDate = (date: Date | string, pattern = 'dd.MM.yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, pattern, { locale: ru });
  } catch {
    return '';
  }
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

export const formatRelativeDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    const now = new Date();
    const days = differenceInDays(now, dateObj);
    
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days === -1) return 'Завтра';
    if (days > 0 && days <= 7) return `${days} дн. назад`;
    if (days < 0 && days >= -7) return `Через ${Math.abs(days)} дн.`;
    
    return formatDate(dateObj);
  } catch {
    return '';
  }
};

// Вычисление периодов
export const getDateRange = (period: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return { from: now, to: now };
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return { from: weekStart, to: weekEnd };
    case 'month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
      const quarterEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      return { from: quarterStart, to: quarterEnd };
    case 'year':
      return { 
        from: new Date(now.getFullYear(), 0, 1), 
        to: new Date(now.getFullYear(), 11, 31) 
      };
    default:
      return { from: now, to: now };
  }
};

// Генерация цветов для графиков
export const generateColors = (count: number): string[] => {
  const baseColors = [
    '#1976d2', '#42a5f5', '#64b5f6', '#90caf9',
    '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
    '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a',
    '#ef4444', '#f87171', '#fca5a5', '#fecaca',
    '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Генерируем дополнительные цвета
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Золотой угол для равномерного распределения
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return colors;
};

// Валидация
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateInn = (inn: string): boolean => {
  if (!/^\d{10}$|^\d{12}$/.test(inn)) return false;
  
  const checkDigit = (inn: string, coefficients: number[]): number => {
    return coefficients.reduce((sum, coeff, index) => 
      sum + coeff * parseInt(inn[index]), 0) % 11 % 10;
  };
  
  if (inn.length === 10) {
    return checkDigit(inn, [2, 4, 10, 3, 5, 9, 4, 6, 8]) === parseInt(inn[9]);
  } else {
    return checkDigit(inn, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === parseInt(inn[10]) &&
           checkDigit(inn, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === parseInt(inn[11]);
  }
};

// Функции экспорта
export const exportToExcel = (data: any[], filename = 'export.xlsx', sheetName = 'Data') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Настройка ширины колонок
    const maxWidth = data.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
    worksheet['!cols'] = Array(maxWidth).fill({ width: 15 });
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename);
  } catch (error) {
    console.error('Ошибка экспорта в Excel:', error);
    throw new Error('Ошибка при экспорте в Excel');
  }
};

export const exportToPDF = (data: any[], filename = 'export.pdf', title = 'Отчет') => {
  try {
    const pdf = new jsPDF();
    
    // Добавляем русский шрифт (базовый)
    pdf.setFont('helvetica');
    pdf.setFontSize(16);
    pdf.text(title, 20, 20);
    
    if (data.length === 0) {
      pdf.setFontSize(12);
      pdf.text('Нет данных для отображения', 20, 40);
    } else {
      const headers = Object.keys(data[0]);
      const rows = data.map(item => headers.map(header => String(item[header] || '')));
      
      (pdf as any).autoTable({
        head: [headers],
        body: rows,
        startY: 30,
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 247, 255],
        },
        margin: { top: 30 },
      });
    }
    
    pdf.save(filename);
  } catch (error) {
    console.error('Ошибка экспорта в PDF:', error);
    throw new Error('Ошибка при экспорте в PDF');
  }
};

// Работа с файлами
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file, 'UTF-8');
  });
};

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsDataURL(file);
  });
};

// Генерация уникальных ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Функции для работы с процентами и прогрессом
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return 'success';
  if (progress >= 50) return 'warning';
  return 'error';
};

// Работа со статусами
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Проекты
    planning: 'info',
    in_progress: 'primary',
    on_hold: 'warning',
    completed: 'success',
    cancelled: 'error',
    
    // Задачи
    not_started: 'secondary',
    blocked: 'error',
    
    // Инструменты
    new: 'success',
    good: 'success',
    fair: 'warning',
    poor: 'error',
    broken: 'error',
    
    // Общие
    active: 'success',
    inactive: 'secondary',
    pending: 'warning',
  };
  
  return statusColors[status] || 'secondary';
};

export const getStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    // Проекты
    planning: 'Планирование',
    in_progress: 'В работе',
    on_hold: 'Приостановлен',
    completed: 'Завершен',
    cancelled: 'Отменен',
    
    // Задачи
    not_started: 'Не начато',
    blocked: 'Заблокировано',
    
    // Инструменты
    new: 'Новый',
    good: 'Хорошее',
    fair: 'Удовлетворительное',
    poor: 'Плохое',
    broken: 'Сломан',
    
    // Общие
    active: 'Активен',
    inactive: 'Неактивен',
    pending: 'Ожидание',
  };
  
  return statusTexts[status] || status;
};

// Функции для работы с уведомлениями
export const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // В реальном приложении здесь будет интеграция с библиотекой уведомлений
  console.log(`[${type.toUpperCase()}] ${message}`);
};

// Debounce функция
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Функция для создания задержки
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Функции для работы с локальным хранилищем
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Ошибка удаления из localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Ошибка очистки localStorage:', error);
    }
  }
};

// Функции для работы с массивами
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Функция для поиска по тексту
export const searchInText = (text: string, query: string): boolean => {
  return text.toLowerCase().includes(query.toLowerCase());
};

export const highlightText = (text: string, query: string): string => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};