const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Настройка логгера
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'construction-crm-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Создание директорий
async function createDirectories() {
  const dirs = ['uploads', 'logs', 'exports'];
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      logger.error(`Error creating directory ${dir}:`, error);
    }
  }
}

// Подключение к базе данных
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'crm_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'construction_crm',
  charset: 'utf8mb4'
};

let db;
async function connectDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    logger.info('Connected to MySQL database');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Middleware
app.use(compression());

// CORS настройки для работы с Nginx
app.use(cors({
  origin: ['http://79.174.85.87', 'http://79.174.85.87:80', 'http://localhost', 'http://127.0.0.1'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting только для API
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_REQUESTS) || 100,
  message: { error: 'Слишком много запросов, попробуйте позже' }
});
app.use('/api/', limiter);

// Парсинг данных
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|dwg|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Недопустимый тип файла'));
    }
  }
});

// Middleware для аутентификации
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа отсутствует' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверяем, существует ли пользователь
    const [rows] = await db.execute(
      'SELECT id, username, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0 || !rows[0].is_active) {
      return res.status(401).json({ error: 'Недействительный токен' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    return res.status(403).json({ error: 'Недействительный токен' });
  }
};

// Функция логирования действий
const logAction = async (userId, action, tableName, recordId, oldData, newData, req) => {
  try {
    await db.execute(
      'INSERT INTO system_logs (user_id, action, table_name, record_id, old_data, new_data, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        action,
        tableName,
        recordId,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      ]
    );
  } catch (error) {
    logger.error('Error logging action:', error);
  }
};

// === API МАРШРУТЫ ===

// Проверка работоспособности API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Construction CRM API'
  });
});

// Аутентификация
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ? AND is_active = true',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    // Обновляем время последнего входа
    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    await logAction(user.id, 'login', 'users', user.id, null, null, req);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Выход из системы
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    await logAction(req.user.id, 'logout', 'users', req.user.id, null, null, req);
    res.json({ message: 'Выход выполнен успешно' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Проверка токена
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Получение информации о пользователе
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, username, email, first_name, last_name, middle_name, phone, role, avatar, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      middleName: user.middle_name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.created_at
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение статистики для дашборда
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Базовая статистика
    const [clientsCount] = await db.execute('SELECT COUNT(*) as count FROM clients WHERE status = "active"');
    const [projectsCount] = await db.execute('SELECT COUNT(*) as count FROM projects WHERE status IN ("active", "planning")');
    const [employeesCount] = await db.execute('SELECT COUNT(*) as count FROM employees WHERE status = "active"');
    
    res.json({
      clients: clientsCount[0].count,
      projects: projectsCount[0].count,
      employees: employeesCount[0].count,
      revenue: 0 // Заглушка, можно вычислить из проектов
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Обработка ошибок
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// 404 для неизвестных API маршрутов
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API маршрут не найден' });
});

// Запуск сервера только для API
async function startServer() {
  try {
    await createDirectories();
    await connectDB();
    
    app.listen(PORT, '127.0.0.1', () => {
      logger.info(`API Server is running on port ${PORT}`);
      console.log(`🚀 Construction CRM API запущен на порту ${PORT}`);
      console.log(`📊 API доступно по адресу: http://127.0.0.1:${PORT}/api`);
      console.log(`🌐 Фронтенд должен обслуживаться через Nginx на порту 80`);
    });
  } catch (error) {
    logger.error('Server startup error:', error);
    process.exit(1);
  }
}

startServer();