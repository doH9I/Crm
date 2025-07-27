import { format as formatDate } from 'date-fns';
import { ru } from 'date-fns/locale';

// Типы для экспорта
export interface ExportColumn {
  key: string;
  title: string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'date' | 'percentage';
}

export interface ExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeTimestamp?: boolean;
  metadata?: Record<string, any>;
}

// Утилиты для форматирования данных
export const formatCellValue = (value: any, format: string = 'text'): string => {
  if (value === null || value === undefined) return '';
  
  switch (format) {
    case 'currency':
      return typeof value === 'number' ? 
        value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) : 
        String(value);
    
    case 'number':
      return typeof value === 'number' ? 
        value.toLocaleString('ru-RU') : 
        String(value);
    
    case 'percentage':
      return typeof value === 'number' ? 
        `${value.toFixed(1)}%` : 
        String(value);
    
    case 'date':
      if (value instanceof Date) {
        return formatDate(value, 'dd.MM.yyyy', { locale: ru });
      }
      if (typeof value === 'string') {
        try {
          return formatDate(new Date(value), 'dd.MM.yyyy', { locale: ru });
        } catch {
          return String(value);
        }
      }
      return String(value);
    
    default:
      return String(value);
  }
};

// Экспорт в CSV
export const exportToCSV = (options: ExportOptions): void => {
  const { columns, data, filename = 'export.csv', title, includeTimestamp = true } = options;
  
  let csvContent = '';
  
  // Добавляем заголовок
  if (title) {
    csvContent += `"${title}"\n`;
  }
  
  // Добавляем временную метку
  if (includeTimestamp) {
    csvContent += `"Дата экспорта: ${formatDate(new Date(), 'dd.MM.yyyy HH:mm', { locale: ru })}"\n`;
  }
  
  csvContent += '\n';
  
  // Добавляем заголовки столбцов
  const headers = columns.map(col => `"${col.title}"`).join(',');
  csvContent += headers + '\n';
  
  // Добавляем данные
  data.forEach(row => {
    const values = columns.map(col => {
      const value = formatCellValue(row[col.key], col.format);
      return `"${value.replace(/"/g, '""')}"`;
    }).join(',');
    csvContent += values + '\n';
  });
  
  // Создаем и скачиваем файл
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Экспорт в JSON
export const exportToJSON = (options: ExportOptions): void => {
  const { data, filename = 'export.json', title, includeTimestamp = true, metadata } = options;
  
  const exportData = {
    ...(title && { title }),
    ...(includeTimestamp && { exportDate: new Date().toISOString() }),
    ...(metadata && { metadata }),
    data: data,
    recordCount: data.length
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Экспорт в Excel (требует библиотеку xlsx)
export const exportToExcel = async (options: ExportOptions): Promise<void> => {
  try {
    // Динамически импортируем xlsx только при необходимости
    const XLSX = await import('xlsx');
    
    const { columns, data, filename = 'export.xlsx', title, includeTimestamp = true } = options;
    
    // Создаем workbook
    const wb = XLSX.utils.book_new();
    
    // Подготавливаем данные для Excel
    const worksheetData: any[][] = [];
    
    // Добавляем заголовок
    if (title) {
      worksheetData.push([title]);
      worksheetData.push([]);
    }
    
    // Добавляем временную метку
    if (includeTimestamp) {
      worksheetData.push([`Дата экспорта: ${formatDate(new Date(), 'dd.MM.yyyy HH:mm', { locale: ru })}`]);
      worksheetData.push([]);
    }
    
    // Добавляем заголовки столбцов
    const headers = columns.map(col => col.title);
    worksheetData.push(headers);
    
    // Добавляем данные
    data.forEach(row => {
      const rowData = columns.map(col => {
        const value = row[col.key];
        
        // Для чисел возвращаем как есть для корректного форматирования в Excel
        if (col.format === 'number' || col.format === 'currency' || col.format === 'percentage') {
          return typeof value === 'number' ? value : 0;
        }
        
        if (col.format === 'date' && (value instanceof Date || typeof value === 'string')) {
          try {
            return value instanceof Date ? value : new Date(value);
          } catch {
            return value;
          }
        }
        
        return formatCellValue(value, col.format);
      });
      worksheetData.push(rowData);
    });
    
    // Создаем worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Устанавливаем ширину столбцов
    const colWidths = columns.map(col => ({ width: col.width || 15 }));
    ws['!cols'] = colWidths;
    
    // Форматируем заголовки
    const headerRowIndex = worksheetData.findIndex(row => 
      row.length === columns.length && row[0] === columns[0].title
    );
    
    if (headerRowIndex >= 0) {
      columns.forEach((col, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: index });
        if (!ws[cellAddress]) ws[cellAddress] = {};
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "EEEEEE" } }
        };
      });
    }
    
    // Добавляем worksheet в workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Данные');
    
    // Сохраняем файл
    XLSX.writeFile(wb, filename);
    
  } catch (error) {
    console.error('Ошибка при экспорте в Excel:', error);
    throw new Error('Не удалось экспортировать в Excel. Проверьте наличие библиотеки xlsx.');
  }
};

// Экспорт в PDF (требует библиотеку jspdf)
export const exportToPDF = async (options: ExportOptions): Promise<void> => {
  try {
    // Динамически импортируем jspdf только при необходимости
    const { jsPDF } = await import('jspdf');
    const autoTable = await import('jspdf-autotable');
    
    const { columns, data, filename = 'export.pdf', title, subtitle, includeTimestamp = true } = options;
    
    // Создаем PDF документ
    const doc = new jsPDF({
      orientation: columns.length > 5 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Устанавливаем шрифт для поддержки русского языка
    doc.setFont('helvetica');
    
    let yPos = 20;
    
    // Добавляем заголовок
    if (title) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, yPos);
      yPos += 10;
    }
    
    // Добавляем подзаголовок
    if (subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 20, yPos);
      yPos += 8;
    }
    
    // Добавляем временную метку
    if (includeTimestamp) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Дата экспорта: ${formatDate(new Date(), 'dd.MM.yyyy HH:mm', { locale: ru })}`, 20, yPos);
      yPos += 15;
    }
    
    // Подготавливаем данные для таблицы
    const tableHeaders = columns.map(col => col.title);
    const tableData = data.map(row => 
      columns.map(col => formatCellValue(row[col.key], col.format))
    );
    
    // Добавляем таблицу
    autoTable.default(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: yPos,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      columnStyles: columns.reduce((styles, col, index) => {
        if (col.format === 'currency' || col.format === 'number') {
          styles[index] = { halign: 'right' };
        } else if (col.format === 'percentage') {
          styles[index] = { halign: 'center' };
        }
        return styles;
      }, {} as Record<number, any>),
      margin: { left: 20, right: 20 },
    });
    
    // Добавляем информацию о количестве записей
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    doc.setFontSize(8);
    doc.text(`Всего записей: ${data.length}`, 20, finalY + 10);
    
    // Сохраняем PDF
    doc.save(filename);
    
  } catch (error) {
    console.error('Ошибка при экспорте в PDF:', error);
    throw new Error('Не удалось экспортировать в PDF. Проверьте наличие библиотеки jspdf.');
  }
};

// Универсальная функция экспорта
export const exportData = async (options: ExportOptions): Promise<void> => {
  try {
    switch (options.format) {
      case 'csv':
        exportToCSV(options);
        break;
      case 'json':
        exportToJSON(options);
        break;
      case 'excel':
        await exportToExcel(options);
        break;
      case 'pdf':
        await exportToPDF(options);
        break;
      default:
        throw new Error(`Неподдерживаемый формат экспорта: ${options.format}`);
    }
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    throw error;
  }
};

// Предустановленные конфигурации для разных типов данных
export const getProjectExportConfig = (): Partial<ExportOptions> => ({
  columns: [
    { key: 'name', title: 'Название проекта', width: 25 },
    { key: 'client', title: 'Клиент', width: 20 },
    { key: 'status', title: 'Статус', width: 15 },
    { key: 'startDate', title: 'Дата начала', format: 'date', width: 15 },
    { key: 'endDate', title: 'Дата окончания', format: 'date', width: 15 },
    { key: 'budget', title: 'Бюджет', format: 'currency', width: 15 },
    { key: 'progress', title: 'Прогресс', format: 'percentage', width: 10 },
  ],
  title: 'Отчет по проектам',
});

export const getFinancialExportConfig = (): Partial<ExportOptions> => ({
  columns: [
    { key: 'date', title: 'Дата', format: 'date', width: 15 },
    { key: 'description', title: 'Описание', width: 30 },
    { key: 'category', title: 'Категория', width: 15 },
    { key: 'type', title: 'Тип', width: 10 },
    { key: 'amount', title: 'Сумма', format: 'currency', width: 15 },
    { key: 'status', title: 'Статус', width: 10 },
  ],
  title: 'Финансовый отчет',
});

export const getMaterialExportConfig = (): Partial<ExportOptions> => ({
  columns: [
    { key: 'name', title: 'Наименование', width: 25 },
    { key: 'category', title: 'Категория', width: 15 },
    { key: 'unit', title: 'Ед. изм.', width: 10 },
    { key: 'currentStock', title: 'Остаток', format: 'number', width: 12 },
    { key: 'minStock', title: 'Мин. остаток', format: 'number', width: 12 },
    { key: 'unitPrice', title: 'Цена за ед.', format: 'currency', width: 15 },
    { key: 'supplier', title: 'Поставщик', width: 20 },
  ],
  title: 'Отчет по материалам',
});

export const getEmployeeExportConfig = (): Partial<ExportOptions> => ({
  columns: [
    { key: 'name', title: 'ФИО', width: 25 },
    { key: 'position', title: 'Должность', width: 20 },
    { key: 'department', title: 'Отдел', width: 15 },
    { key: 'email', title: 'Email', width: 20 },
    { key: 'phone', title: 'Телефон', width: 15 },
    { key: 'hireDate', title: 'Дата приема', format: 'date', width: 15 },
    { key: 'salary', title: 'Зарплата', format: 'currency', width: 15 },
  ],
  title: 'Отчет по сотрудникам',
});

// Утилита для генерации имени файла
export const generateFilename = (baseName: string, format: string, includeDate: boolean = true): string => {
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9а-яА-Я\s]/g, '').replace(/\s+/g, '_');
  const dateString = includeDate ? `_${formatDate(new Date(), 'yyyy-MM-dd', { locale: ru })}` : '';
  return `${sanitizedBaseName}${dateString}.${format}`;
};

// Утилита для валидации данных перед экспортом
export const validateExportData = (options: ExportOptions): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!options.columns || options.columns.length === 0) {
    errors.push('Не указаны столбцы для экспорта');
  }
  
  if (!options.data || options.data.length === 0) {
    errors.push('Нет данных для экспорта');
  }
  
  if (!['pdf', 'excel', 'csv', 'json'].includes(options.format)) {
    errors.push('Неподдерживаемый формат экспорта');
  }
  
  // Проверяем наличие всех ключей в данных
  if (options.data && options.columns) {
    const missingKeys = options.columns.filter(col => 
      !options.data.some(row => row.hasOwnProperty(col.key))
    );
    
    if (missingKeys.length > 0) {
      errors.push(`Отсутствуют данные для столбцов: ${missingKeys.map(k => k.title).join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};