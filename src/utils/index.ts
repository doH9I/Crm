import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Утилита для объединения классов
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Форматирование валюты
export function formatCurrency(amount: number, currency = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Форматирование чисел
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(num);
}

// Форматирование процентов
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Форматирование даты
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU');
}

// Форматирование даты и времени
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ru-RU');
}

// Относительное время
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} дн. назад`;
  if (hours > 0) return `${hours} ч. назад`;
  if (minutes > 0) return `${minutes} мин. назад`;
  return 'только что';
}

// Получение диапазона дат
export function getDateRange(period: 'week' | 'month' | 'quarter' | 'year'): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return { start, end: now };
}

// Генерация цветов для графиков
export function generateColors(count: number): string[] {
  const baseColors = [
    '#1976d2', '#388e3c', '#f57c00', '#7b1fa2',
    '#c2185b', '#00796b', '#5c6bc0', '#ff5722',
    '#607d8b', '#795548', '#9c27b0', '#e91e63'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Генерация дополнительных цветов
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Золотое сечение для равномерного распределения
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return colors;
}

// Валидация email
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Валидация телефона
export function validatePhone(phone: string): boolean {
  const re = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
  return re.test(phone);
}

// Валидация ИНН
export function validateInn(inn: string): boolean {
  if (!/^\d{10}$|^\d{12}$/.test(inn)) return false;
  
  const checkDigit = (inn: string, coefficients: number[]) => {
    let sum = 0;
    for (let i = 0; i < coefficients.length; i++) {
      sum += parseInt(inn[i]) * coefficients[i];
    }
    return sum % 11 % 10;
  };
  
  if (inn.length === 10) {
    const coefficients = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    return checkDigit(inn, coefficients) === parseInt(inn[9]);
  } else {
    const coefficients1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    const coefficients2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    return checkDigit(inn, coefficients1) === parseInt(inn[10]) &&
           checkDigit(inn, coefficients2) === parseInt(inn[11]);
  }
}

// Экспорт в Excel
export async function exportToExcel(data: any[], filename: string): Promise<void> {
  try {
    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Ошибка экспорта в Excel:', error);
    throw new Error('Не удалось экспортировать в Excel');
  }
}

// Экспорт в PDF
export async function exportToPDF(content: string, filename: string): Promise<void> {
  try {
    const jsPDF = await import('jspdf');
    const doc = new jsPDF.default();
    doc.text(content, 20, 20);
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Ошибка экспорта в PDF:', error);
    throw new Error('Не удалось экспортировать в PDF');
  }
}

// Чтение файла как текст
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
}

// Чтение файла как DataURL
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsDataURL(file);
  });
}

// Генерация уникального ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Расчет прогресса
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.max((current / total) * 100, 0), 100);
}

// Получение цвета прогресса
export function getProgressColor(progress: number): string {
  if (progress >= 80) return '#4caf50'; // зеленый
  if (progress >= 60) return '#ff9800'; // оранжевый
  if (progress >= 40) return '#2196f3'; // синий
  return '#f44336'; // красный
}

// Получение цвета статуса
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: '#4caf50',
    inactive: '#f44336',
    pending: '#ff9800',
    completed: '#4caf50',
    cancelled: '#f44336',
    in_progress: '#2196f3',
    on_hold: '#ff9800',
  };
  return colors[status] || '#757575';
}

// Получение текста статуса
export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    active: 'Активный',
    inactive: 'Неактивный',
    pending: 'Ожидает',
    completed: 'Завершен',
    cancelled: 'Отменен',
    in_progress: 'В работе',
    on_hold: 'Приостановлен',
  };
  return texts[status] || status;
}

// Показ уведомления
export function showNotification(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
  // В реальном приложении здесь была бы интеграция с toast библиотекой
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
}

// Debounce функция
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Задержка
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Локальное хранилище
export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue || null;
      return JSON.parse(item);
    } catch {
      return defaultValue || null;
    }
  },
  
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error);
    }
  },
  
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Ошибка удаления из localStorage:', error);
    }
  },
  
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Ошибка очистки localStorage:', error);
    }
  }
};

// Группировка массива
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// Сортировка массива
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Поиск в тексте
export function searchInText(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

// Подсветка текста
export function highlightText(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}