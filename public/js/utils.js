// Utility functions for Construction CRM

// Global variables
let currentUser = null;
let appState = {
    currentPage: 'dashboard',
    sidebarCollapsed: false,
    mobileMenuOpen: false
};

// Date formatting utilities
const DateUtils = {
    format: (date, format = 'DD.MM.YYYY') => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year)
            .replace('HH', hours)
            .replace('mm', minutes);
    },
    
    formatRelative: (date) => {
        if (!date) return '';
        const now = new Date();
        const d = new Date(date);
        const diff = now - d;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 7) return DateUtils.format(date);
        if (days > 0) return `${days} дн. назад`;
        if (hours > 0) return `${hours} ч. назад`;
        if (minutes > 0) return `${minutes} мин. назад`;
        return 'только что';
    },
    
    isToday: (date) => {
        const today = new Date();
        const d = new Date(date);
        return d.toDateString() === today.toDateString();
    },
    
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
};

// Number formatting utilities
const NumberUtils = {
    formatCurrency: (amount, currency = 'RUB') => {
        if (amount === null || amount === undefined) return '';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    },
    
    formatNumber: (number, decimals = 0) => {
        if (number === null || number === undefined) return '';
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    },
    
    parseNumber: (str) => {
        if (!str) return 0;
        return parseFloat(str.toString().replace(/\s/g, '').replace(',', '.')) || 0;
    }
};

// String utilities
const StringUtils = {
    truncate: (str, length = 50) => {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    },
    
    capitalize: (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    pluralize: (count, singular, few, many) => {
        const n = Math.abs(count);
        if (n % 10 === 1 && n % 100 !== 11) return singular;
        if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few;
        return many;
    },
    
    slug: (str) => {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9а-я]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
};

// DOM utilities
const DOMUtils = {
    createElement: (tag, attributes = {}, children = []) => {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else if (key === 'textContent') {
                element.textContent = attributes[key];
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, attributes[key]);
            } else {
                element[key] = attributes[key];
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    },
    
    toggleClass: (element, className, force) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.toggle(className, force);
        }
    },
    
    addClass: (element, className) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.add(className);
        }
    },
    
    removeClass: (element, className) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.remove(className);
        }
    },
    
    hasClass: (element, className) => {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        return element ? element.classList.contains(className) : false;
    }
};

// Local storage utilities
const StorageUtils = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// Validation utilities
const ValidationUtils = {
    isEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    isPhone: (phone) => {
        const re = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return re.test(phone);
    },
    
    isINN: (inn) => {
        if (!inn || !/^\d+$/.test(inn)) return false;
        if (inn.length !== 10 && inn.length !== 12) return false;
        
        // Simplified INN validation
        return true;
    },
    
    isKPP: (kpp) => {
        if (!kpp || !/^\d{9}$/.test(kpp)) return false;
        return true;
    },
    
    isOGRN: (ogrn) => {
        if (!ogrn || !/^\d+$/.test(ogrn)) return false;
        if (ogrn.length !== 13 && ogrn.length !== 15) return false;
        return true;
    },
    
    isEmpty: (value) => {
        return value === null || value === undefined || value === '' || 
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    },
    
    isNumber: (value) => {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
};

// File utilities
const FileUtils = {
    formatSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    getExtension: (filename) => {
        return filename.split('.').pop().toLowerCase();
    },
    
    isImage: (filename) => {
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        return imageTypes.includes(FileUtils.getExtension(filename));
    },
    
    isDocument: (filename) => {
        const docTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
        return docTypes.includes(FileUtils.getExtension(filename));
    },
    
    getFileIcon: (filename) => {
        const ext = FileUtils.getExtension(filename);
        const iconMap = {
            pdf: 'fas fa-file-pdf',
            doc: 'fas fa-file-word',
            docx: 'fas fa-file-word',
            xls: 'fas fa-file-excel',
            xlsx: 'fas fa-file-excel',
            txt: 'fas fa-file-alt',
            jpg: 'fas fa-file-image',
            jpeg: 'fas fa-file-image',
            png: 'fas fa-file-image',
            gif: 'fas fa-file-image',
            zip: 'fas fa-file-archive',
            rar: 'fas fa-file-archive'
        };
        return iconMap[ext] || 'fas fa-file';
    }
};

// URL utilities
const URLUtils = {
    getParams: () => {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },
    
    setParam: (key, value) => {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
    },
    
    removeParam: (key) => {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.replaceState({}, '', url);
    },
    
    buildQuery: (params) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                searchParams.append(key, params[key]);
            }
        });
        return searchParams.toString();
    }
};

// Color utilities
const ColorUtils = {
    getStatusColor: (status) => {
        const colorMap = {
            // Project statuses
            planning: '#6b7280',
            design: '#3b82f6',
            approval: '#f59e0b',
            construction: '#10b981',
            completion: '#8b5cf6',
            warranty: '#06b6d4',
            closed: '#64748b',
            
            // Task statuses
            pending: '#6b7280',
            in_progress: '#3b82f6',
            completed: '#10b981',
            on_hold: '#f59e0b',
            cancelled: '#ef4444',
            
            // General statuses
            active: '#10b981',
            inactive: '#6b7280',
            draft: '#6b7280',
            approved: '#10b981',
            rejected: '#ef4444',
            
            // Priority levels
            low: '#6b7280',
            normal: '#3b82f6',
            high: '#f59e0b',
            urgent: '#ef4444'
        };
        return colorMap[status] || '#6b7280';
    },
    
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    rgbToHex: (r, g, b) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
};

// Debounce utility
const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
};

// Throttle utility
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Random utilities
const RandomUtils = {
    string: (length = 8) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    number: (min = 0, max = 100) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    uuid: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

// Array utilities
const ArrayUtils = {
    chunk: (array, size) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },
    
    unique: (array, key = null) => {
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const value = item[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        }
        return [...new Set(array)];
    },
    
    sortBy: (array, key, direction = 'asc') => {
        return array.sort((a, b) => {
            const aVal = key ? a[key] : a;
            const bVal = key ? b[key] : b;
            
            if (direction === 'desc') {
                return aVal < bVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
        });
    },
    
    groupBy: (array, key) => {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }
};

// Copy to clipboard
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Скопировано в буфер обмена', 'success');
        return true;
    } catch (err) {
        console.error('Failed to copy: ', err);
        showNotification('Ошибка копирования', 'error');
        return false;
    }
};

// Download file
const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Print content
const printContent = (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Печать</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    @media print { 
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

// Export functions for global use
window.DateUtils = DateUtils;
window.NumberUtils = NumberUtils;
window.StringUtils = StringUtils;
window.DOMUtils = DOMUtils;
window.StorageUtils = StorageUtils;
window.ValidationUtils = ValidationUtils;
window.FileUtils = FileUtils;
window.URLUtils = URLUtils;
window.ColorUtils = ColorUtils;
window.RandomUtils = RandomUtils;
window.ArrayUtils = ArrayUtils;
window.debounce = debounce;
window.throttle = throttle;
window.copyToClipboard = copyToClipboard;
window.downloadFile = downloadFile;
window.printContent = printContent;