const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const winston = require('winston');
const MockDatabase = require('./mock-database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Устанавливаем JWT_SECRET если не задан
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'construction-crm-secret-key-2024';
}

// Настройка логгера
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'construction-crm' },
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
  const dirs = ['uploads', 'logs', 'exports', 'public'];
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
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
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
    logger.error('Database connection failed, using mock database:', error);
    // Используем mock базу данных при отсутствии подключения
    db = new MockDatabase();
    logger.info('Using mock database for development');
  }
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    [process.env.CORS_ORIGIN, `http://${process.env.SERVER_IP}`, `https://${process.env.SERVER_IP}`] : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_REQUESTS) || 100
});
app.use(limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

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
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
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
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ? AND is_active = TRUE', [decoded.userId]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(403).json({ error: 'Недействительный токен' });
  }
};

// Middleware для проверки ролей
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав доступа' });
    }
    next();
  };
};

// Функция логирования действий
const logAction = async (userId, action, tableName, recordId, oldValues, newValues, req) => {
  try {
    await db.execute(
      'INSERT INTO system_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, action, tableName, recordId, JSON.stringify(oldValues), JSON.stringify(newValues), req.ip, req.get('User-Agent')]
    );
  } catch (error) {
    logger.error('Logging error:', error);
  }
};

// Базовый маршрут API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Construction CRM API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      clients: '/api/clients',
      projects: '/api/projects',
      contractors: '/api/contractors',
      employees: '/api/employees',
      warehouse: '/api/warehouse',
      dashboard: '/api/dashboard'
    }
  });
});

// АУТЕНТИФИКАЦИЯ И АВТОРИЗАЦИЯ

// Вход в систему
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE',
      [username, username]
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

// Регистрация пользователя (только для администратора)
app.post('/api/auth/register', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, middleName, phone, role } = req.body;

    if (!username || !email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Обязательные поля не заполнены' });
    }

    // Проверяем уникальность
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким логином или email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, middle_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, firstName, lastName, middleName, phone, role]
    );

    await logAction(req.user.id, 'create_user', 'users', result.insertId, null, { username, email, role }, req);

    res.status(201).json({ message: 'Пользователь создан успешно', userId: result.insertId });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ПОЛЬЗОВАТЕЛИ

// Получить список пользователей
app.get('/api/users', authenticateToken, authorizeRoles('admin', 'general_director', 'construction_director'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, username, email, first_name, last_name, middle_name, phone, role, avatar, is_active, last_login, created_at FROM users';
    let params = [];
    let conditions = [];

    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }

    if (status) {
      conditions.push('is_active = ?');
      params.push(status === 'active');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(query, params);
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM users' + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''), params.slice(0, -2));

    res.json({
      users: rows,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Users fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить профиль пользователя
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, username, email, first_name, last_name, middle_name, phone, role, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(rows[0]);
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить профиль пользователя
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, middleName, phone, email } = req.body;

    // Проверяем уникальность email
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email уже используется другим пользователем' });
    }

    const [oldData] = await db.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);

    await db.execute(
      'UPDATE users SET first_name = ?, last_name = ?, middle_name = ?, phone = ?, email = ? WHERE id = ?',
      [firstName, lastName, middleName, phone, email, req.user.id]
    );

    await logAction(req.user.id, 'update_profile', 'users', req.user.id, oldData[0], { firstName, lastName, middleName, phone, email }, req);

    res.json({ message: 'Профиль обновлен успешно' });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// КЛИЕНТЫ

// Получить список клиентов
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM clients';
    let params = [];
    let conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }

    if (search) {
      conditions.push('(name LIKE ? OR legal_name LIKE ? OR phone LIKE ? OR email LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(query, params);
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM clients' + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''), params.slice(0, -2));

    res.json({
      clients: rows,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Clients fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать клиента
app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    const clientData = {
      type: req.body.type,
      name: req.body.name,
      legal_name: req.body.legalName,
      inn: req.body.inn,
      kpp: req.body.kpp,
      ogrn: req.body.ogrn,
      address: req.body.address,
      legal_address: req.body.legalAddress,
      phone: req.body.phone,
      email: req.body.email,
      contact_person: req.body.contactPerson,
      contact_phone: req.body.contactPhone,
      contact_email: req.body.contactEmail,
      bank_name: req.body.bankName,
      bank_account: req.body.bankAccount,
      bank_bik: req.body.bankBik,
      status: req.body.status || 'potential',
      source: req.body.source,
      notes: req.body.notes,
      created_by: req.user.id
    };

    const fields = Object.keys(clientData).join(', ');
    const placeholders = Object.keys(clientData).map(() => '?').join(', ');
    const values = Object.values(clientData);

    const [result] = await db.execute(
      `INSERT INTO clients (${fields}) VALUES (${placeholders})`,
      values
    );

    await logAction(req.user.id, 'create_client', 'clients', result.insertId, null, clientData, req);

    res.status(201).json({ message: 'Клиент создан успешно', clientId: result.insertId });
  } catch (error) {
    logger.error('Client creation error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить клиента по ID
app.get('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM clients WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    res.json(rows[0]);
  } catch (error) {
    logger.error('Client fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить клиента
app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const [oldData] = await db.execute('SELECT * FROM clients WHERE id = ?', [req.params.id]);

    if (oldData.length === 0) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    const clientData = {
      type: req.body.type,
      name: req.body.name,
      legal_name: req.body.legalName,
      inn: req.body.inn,
      kpp: req.body.kpp,
      ogrn: req.body.ogrn,
      address: req.body.address,
      legal_address: req.body.legalAddress,
      phone: req.body.phone,
      email: req.body.email,
      contact_person: req.body.contactPerson,
      contact_phone: req.body.contactPhone,
      contact_email: req.body.contactEmail,
      bank_name: req.body.bankName,
      bank_account: req.body.bankAccount,
      bank_bik: req.body.bankBik,
      status: req.body.status,
      source: req.body.source,
      notes: req.body.notes
    };

    const setClause = Object.keys(clientData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(clientData), req.params.id];

    await db.execute(
      `UPDATE clients SET ${setClause} WHERE id = ?`,
      values
    );

    await logAction(req.user.id, 'update_client', 'clients', req.params.id, oldData[0], clientData, req);

    res.json({ message: 'Клиент обновлен успешно' });
  } catch (error) {
    logger.error('Client update error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ПРОЕКТЫ

// Получить список проектов
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, managerId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as client_name, 
             pm.first_name as pm_first_name, pm.last_name as pm_last_name,
             sm.first_name as sm_first_name, sm.last_name as sm_last_name,
             f.first_name as f_first_name, f.last_name as f_last_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users pm ON p.project_manager_id = pm.id
      LEFT JOIN users sm ON p.site_manager_id = sm.id
      LEFT JOIN users f ON p.foreman_id = f.id
    `;
    
    let params = [];
    let conditions = [];

    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    if (type) {
      conditions.push('p.type = ?');
      params.push(type);
    }

    if (managerId) {
      conditions.push('(p.project_manager_id = ? OR p.site_manager_id = ? OR p.foreman_id = ?)');
      params.push(managerId, managerId, managerId);
    }

    // Ограничиваем доступ по ролям
    if (!['admin', 'general_director', 'construction_director'].includes(req.user.role)) {
      conditions.push('(p.project_manager_id = ? OR p.site_manager_id = ? OR p.foreman_id = ?)');
      params.push(req.user.id, req.user.id, req.user.id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(query, params);
    
    // Подсчет общего количества
    let countQuery = 'SELECT COUNT(*) as total FROM projects p';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const [countResult] = await db.execute(countQuery, params.slice(0, -2));

    res.json({
      projects: rows,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Projects fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать проект
app.post('/api/projects', authenticateToken, authorizeRoles('admin', 'general_director', 'construction_director'), async (req, res) => {
  try {
    const projectData = {
      name: req.body.name,
      description: req.body.description,
      client_id: req.body.clientId,
      type: req.body.type,
      status: req.body.status || 'planning',
      priority: req.body.priority || 'normal',
      start_date: req.body.startDate,
      planned_end_date: req.body.plannedEndDate,
      budget: req.body.budget,
      address: req.body.address,
      total_area: req.body.totalArea,
      building_floors: req.body.buildingFloors,
      project_manager_id: req.body.projectManagerId,
      site_manager_id: req.body.siteManagerId,
      foreman_id: req.body.foremanId,
      notes: req.body.notes,
      created_by: req.user.id
    };

    const fields = Object.keys(projectData).join(', ');
    const placeholders = Object.keys(projectData).map(() => '?').join(', ');
    const values = Object.values(projectData);

    const [result] = await db.execute(
      `INSERT INTO projects (${fields}) VALUES (${placeholders})`,
      values
    );

    await logAction(req.user.id, 'create_project', 'projects', result.insertId, null, projectData, req);

    res.status(201).json({ message: 'Проект создан успешно', projectId: result.insertId });
  } catch (error) {
    logger.error('Project creation error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить проект по ID
app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT p.*, c.name as client_name, c.type as client_type, c.phone as client_phone, c.email as client_email,
             pm.first_name as pm_first_name, pm.last_name as pm_last_name,
             sm.first_name as sm_first_name, sm.last_name as sm_last_name,
             f.first_name as f_first_name, f.last_name as f_last_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users pm ON p.project_manager_id = pm.id
      LEFT JOIN users sm ON p.site_manager_id = sm.id
      LEFT JOIN users f ON p.foreman_id = f.id
      WHERE p.id = ?
    `;

    const [rows] = await db.execute(query, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    // Проверяем права доступа
    const project = rows[0];
    if (!['admin', 'general_director', 'construction_director'].includes(req.user.role)) {
      if (project.project_manager_id !== req.user.id && 
          project.site_manager_id !== req.user.id && 
          project.foreman_id !== req.user.id) {
        return res.status(403).json({ error: 'Недостаточно прав доступа' });
      }
    }

    res.json(project);
  } catch (error) {
    logger.error('Project fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ПОДРЯДЧИКИ

// Получить список подрядчиков
app.get('/api/contractors', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM contractors';
    let params = [];
    let conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(name LIKE ? OR legal_name LIKE ? OR phone LIKE ? OR email LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(query, params);
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM contractors' + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''), params.slice(0, -2));

    res.json({
      contractors: rows,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Contractors fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать подрядчика
app.post('/api/contractors', authenticateToken, async (req, res) => {
  try {
    const contractorData = {
      name: req.body.name,
      legal_name: req.body.legalName,
      inn: req.body.inn,
      kpp: req.body.kpp,
      ogrn: req.body.ogrn,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      contact_person: req.body.contactPerson,
      contact_phone: req.body.contactPhone,
      contact_email: req.body.contactEmail,
      bank_name: req.body.bankName,
      bank_account: req.body.bankAccount,
      bank_bik: req.body.bankBik,
      specialization: req.body.specialization,
      rating: req.body.rating || 0.00,
      status: req.body.status || 'active',
      notes: req.body.notes,
      created_by: req.user.id
    };

    const fields = Object.keys(contractorData).join(', ');
    const placeholders = Object.keys(contractorData).map(() => '?').join(', ');
    const values = Object.values(contractorData);

    const [result] = await db.execute(
      `INSERT INTO contractors (${fields}) VALUES (${placeholders})`,
      values
    );

    await logAction(req.user.id, 'create_contractor', 'contractors', result.insertId, null, contractorData, req);

    res.status(201).json({ message: 'Подрядчик создан успешно', contractorId: result.insertId });
  } catch (error) {
    logger.error('Contractor creation error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// СОТРУДНИКИ

// Получить список сотрудников
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM employees';
    let params = [];
    let conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(first_name LIKE ? OR last_name LIKE ? OR position LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(query, params);
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM employees' + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''), params.slice(0, -2));

    res.json({
      employees: rows,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Employees fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// СКЛАД

// Получить складские позиции
app.get('/api/warehouse/items', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM warehouse_items';
    let params = [];
    let conditions = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ? OR article LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.execute(query, params);
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM warehouse_items' + (conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''), params.slice(0, -2));

    res.json({
      items: rows,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Warehouse items fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ДАШБОРД

// Получить данные для дашборда
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const dashboardData = {};

    // Общая статистика проектов
    const [projectStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning_projects,
        SUM(CASE WHEN status = 'construction' THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
        SUM(budget) as total_budget,
        SUM(actual_cost) as total_spent,
        AVG(progress) as avg_progress
      FROM projects
    `);

    dashboardData.projects = projectStats[0];

    // Статистика клиентов
    const [clientStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_clients,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_clients,
        SUM(CASE WHEN status = 'potential' THEN 1 ELSE 0 END) as potential_clients
      FROM clients
    `);

    dashboardData.clients = clientStats[0];

    // Статистика сотрудников
    const [employeeStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_employees,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_employees,
        SUM(CASE WHEN status = 'vacation' THEN 1 ELSE 0 END) as on_vacation
      FROM employees
    `);

    dashboardData.employees = employeeStats[0];

    // Последние проекты
    const [recentProjects] = await db.execute(`
      SELECT p.id, p.name, p.status, p.progress, c.name as client_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    dashboardData.recentProjects = recentProjects;

    // Задачи требующие внимания
    const [urgentTasks] = await db.execute(`
      SELECT pt.id, pt.name, pt.status, pt.end_date, p.name as project_name
      FROM project_tasks pt
      LEFT JOIN projects p ON pt.project_id = p.id
      WHERE pt.status IN ('pending', 'in_progress') 
      AND (pt.end_date <= DATE_ADD(NOW(), INTERVAL 7 DAY) OR pt.priority = 'urgent')
      ORDER BY pt.end_date ASC
      LIMIT 10
    `);

    dashboardData.urgentTasks = urgentTasks;

    // Складские остатки (критически низкие)
    const [lowStock] = await db.execute(`
      SELECT name, current_quantity, min_quantity, unit
      FROM warehouse_items
      WHERE current_quantity <= min_quantity AND status = 'active'
      ORDER BY (current_quantity - min_quantity) ASC
      LIMIT 10
    `);

    dashboardData.lowStock = lowStock;

    // Финансовая статистика за текущий месяц
    const [financialStats] = await db.execute(`
      SELECT 
        SUM(CASE WHEN type = 'receipt' THEN total_cost ELSE 0 END) as income,
        SUM(CASE WHEN type = 'issue' THEN total_cost ELSE 0 END) as expenses
      FROM warehouse_movements
      WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())
    `);

    dashboardData.financial = financialStats[0];

    res.json(dashboardData);
  } catch (error) {
    logger.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ЗАДАЧИ ПРОЕКТА

// Получить задачи проекта
app.get('/api/projects/:id/tasks', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT pt.*, u.first_name, u.last_name, c.name as contractor_name
      FROM project_tasks pt
      LEFT JOIN users u ON pt.assigned_to = u.id
      LEFT JOIN contractors c ON pt.contractor_id = c.id
      WHERE pt.project_id = ?
      ORDER BY pt.created_at DESC
    `;

    const [rows] = await db.execute(query, [req.params.id]);
    res.json(rows);
  } catch (error) {
    logger.error('Project tasks fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать задачу проекта
app.post('/api/projects/:id/tasks', authenticateToken, async (req, res) => {
  try {
    const taskData = {
      project_id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      status: req.body.status || 'pending',
      priority: req.body.priority || 'normal',
      assigned_to: req.body.assignedTo,
      contractor_id: req.body.contractorId,
      start_date: req.body.startDate,
      end_date: req.body.endDate,
      estimated_hours: req.body.estimatedHours,
      dependencies: req.body.dependencies,
      notes: req.body.notes,
      created_by: req.user.id
    };

    const fields = Object.keys(taskData).join(', ');
    const placeholders = Object.keys(taskData).map(() => '?').join(', ');
    const values = Object.values(taskData);

    const [result] = await db.execute(
      `INSERT INTO project_tasks (${fields}) VALUES (${placeholders})`,
      values
    );

    await logAction(req.user.id, 'create_task', 'project_tasks', result.insertId, null, taskData, req);

    res.status(201).json({ message: 'Задача создана успешно', taskId: result.insertId });
  } catch (error) {
    logger.error('Task creation error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить задачу
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const [oldData] = await db.execute('SELECT * FROM project_tasks WHERE id = ?', [req.params.id]);

    if (oldData.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    const taskData = {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      status: req.body.status,
      priority: req.body.priority,
      assigned_to: req.body.assignedTo,
      contractor_id: req.body.contractorId,
      start_date: req.body.startDate,
      end_date: req.body.endDate,
      estimated_hours: req.body.estimatedHours,
      actual_hours: req.body.actualHours,
      progress: req.body.progress,
      dependencies: req.body.dependencies,
      notes: req.body.notes
    };

    const setClause = Object.keys(taskData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(taskData), req.params.id];

    await db.execute(
      `UPDATE project_tasks SET ${setClause} WHERE id = ?`,
      values
    );

    // Обновляем прогресс проекта
    const [projectProgress] = await db.execute(
      'SELECT AVG(progress) as avg_progress FROM project_tasks WHERE project_id = ?',
      [oldData[0].project_id]
    );

    await db.execute(
      'UPDATE projects SET progress = ? WHERE id = ?',
      [projectProgress[0].avg_progress || 0, oldData[0].project_id]
    );

    await logAction(req.user.id, 'update_task', 'project_tasks', req.params.id, oldData[0], taskData, req);

    res.json({ message: 'Задача обновлена успешно' });
  } catch (error) {
    logger.error('Task update error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// СМЕТЫ

// Получить сметы проекта
app.get('/api/projects/:id/estimates', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT e.*, u.first_name, u.last_name, a.first_name as approved_first_name, a.last_name as approved_last_name
      FROM estimates e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.project_id = ?
      ORDER BY e.created_at DESC
    `;

    const [rows] = await db.execute(query, [req.params.id]);
    res.json(rows);
  } catch (error) {
    logger.error('Estimates fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать смету
app.post('/api/projects/:id/estimates', authenticateToken, authorizeRoles('admin', 'general_director', 'construction_director', 'estimator'), async (req, res) => {
  try {
    const estimateData = {
      project_id: req.params.id,
      name: req.body.name,
      type: req.body.type || 'preliminary',
      profit_margin: req.body.profitMargin || 20.00,
      overhead_costs: req.body.overheadCosts || 15.00,
      vat_rate: req.body.vatRate || 20.00,
      valid_until: req.body.validUntil,
      notes: req.body.notes,
      created_by: req.user.id
    };

    const fields = Object.keys(estimateData).join(', ');
    const placeholders = Object.keys(estimateData).map(() => '?').join(', ');
    const values = Object.values(estimateData);

    const [result] = await db.execute(
      `INSERT INTO estimates (${fields}) VALUES (${placeholders})`,
      values
    );

    await logAction(req.user.id, 'create_estimate', 'estimates', result.insertId, null, estimateData, req);

    res.status(201).json({ message: 'Смета создана успешно', estimateId: result.insertId });
  } catch (error) {
    logger.error('Estimate creation error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить позиции сметы
app.get('/api/estimates/:id/items', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM estimate_items WHERE estimate_id = ? ORDER BY sort_order, id',
      [req.params.id]
    );

    res.json(rows);
  } catch (error) {
    logger.error('Estimate items fetch error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить позицию в смету
app.post('/api/estimates/:id/items', authenticateToken, authorizeRoles('admin', 'general_director', 'construction_director', 'estimator'), async (req, res) => {
  try {
    const itemData = {
      estimate_id: req.params.id,
      category: req.body.category,
      name: req.body.name,
      description: req.body.description,
      unit: req.body.unit,
      quantity: req.body.quantity,
      unit_price: req.body.unitPrice,
      total_price: parseFloat(req.body.quantity) * parseFloat(req.body.unitPrice),
      labor_cost: req.body.laborCost,
      material_cost: req.body.materialCost,
      equipment_cost: req.body.equipmentCost,
      gost_code: req.body.gostCode,
      sort_order: req.body.sortOrder || 0,
      notes: req.body.notes
    };

    const fields = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    const [result] = await db.execute(
      `INSERT INTO estimate_items (${fields}) VALUES (${placeholders})`,
      values
    );

    // Пересчитываем общую стоимость сметы
    await recalculateEstimateTotal(req.params.id);

    await logAction(req.user.id, 'create_estimate_item', 'estimate_items', result.insertId, null, itemData, req);

    res.status(201).json({ message: 'Позиция добавлена успешно', itemId: result.insertId });
  } catch (error) {
    logger.error('Estimate item creation error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Функция пересчета общей стоимости сметы
async function recalculateEstimateTotal(estimateId) {
  try {
    const [items] = await db.execute(
      'SELECT SUM(total_price) as total FROM estimate_items WHERE estimate_id = ?',
      [estimateId]
    );

    const [estimate] = await db.execute(
      'SELECT profit_margin, overhead_costs, vat_rate FROM estimates WHERE id = ?',
      [estimateId]
    );

    if (estimate.length > 0) {
      const totalCost = items[0].total || 0;
      const profitMargin = estimate[0].profit_margin || 0;
      const overheadCosts = estimate[0].overhead_costs || 0;
      const vatRate = estimate[0].vat_rate || 0;

      const withProfit = totalCost * (1 + profitMargin / 100);
      const withOverhead = withProfit * (1 + overheadCosts / 100);
      const finalAmount = withOverhead * (1 + vatRate / 100);

      await db.execute(
        'UPDATE estimates SET total_cost = ?, final_amount = ? WHERE id = ?',
        [totalCost, finalAmount, estimateId]
      );
    }
  } catch (error) {
    logger.error('Estimate recalculation error:', error);
  }
}

// ЭКСПОРТ ДАННЫХ

// Экспорт проектов в Excel
app.get('/api/export/projects/excel', authenticateToken, async (req, res) => {
  try {
    const [projects] = await db.execute(`
      SELECT p.*, c.name as client_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Проекты');

    // Заголовки
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Название', key: 'name', width: 30 },
      { header: 'Клиент', key: 'client_name', width: 25 },
      { header: 'Тип', key: 'type', width: 15 },
      { header: 'Статус', key: 'status', width: 15 },
      { header: 'Бюджет', key: 'budget', width: 15 },
      { header: 'Прогресс', key: 'progress', width: 10 },
      { header: 'Дата создания', key: 'created_at', width: 20 }
    ];

    // Данные
    projects.forEach(project => {
      worksheet.addRow({
        id: project.id,
        name: project.name,
        client_name: project.client_name,
        type: project.type,
        status: project.status,
        budget: project.budget,
        progress: project.progress,
        created_at: project.created_at
      });
    });

    // Стили
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    const fileName = `projects_${Date.now()}.xlsx`;
    const filePath = path.join('exports', fileName);

    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error('File download error:', err);
      }
      // Удаляем файл после скачивания
      fs.unlink(filePath).catch(console.error);
    });
  } catch (error) {
    logger.error('Projects export error:', error);
    res.status(500).json({ error: 'Ошибка экспорта' });
  }
});

// Экспорт сметы в PDF
app.get('/api/estimates/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const [estimate] = await db.execute(`
      SELECT e.*, p.name as project_name, c.name as client_name
      FROM estimates e
      LEFT JOIN projects p ON e.project_id = p.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (estimate.length === 0) {
      return res.status(404).json({ error: 'Смета не найдена' });
    }

    const [items] = await db.execute(
      'SELECT * FROM estimate_items WHERE estimate_id = ? ORDER BY sort_order, id',
      [req.params.id]
    );

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `estimate_${req.params.id}_${Date.now()}.pdf`;
    const filePath = path.join('exports', fileName);

    doc.pipe(require('fs').createWriteStream(filePath));

    // Заголовок
    doc.fontSize(20).text('СМЕТА', { align: 'center' });
    doc.moveDown();

    // Информация о смете
    doc.fontSize(12);
    doc.text(`Проект: ${estimate[0].project_name}`);
    doc.text(`Клиент: ${estimate[0].client_name}`);
    doc.text(`Название: ${estimate[0].name}`);
    doc.text(`Тип: ${estimate[0].type}`);
    doc.text(`Дата создания: ${new Date(estimate[0].created_at).toLocaleDateString('ru-RU')}`);
    doc.moveDown();

    // Таблица позиций
    let yPosition = doc.y;
    
    // Заголовки таблицы
    doc.text('№', 50, yPosition, { width: 30 });
    doc.text('Наименование', 80, yPosition, { width: 200 });
    doc.text('Ед.изм.', 280, yPosition, { width: 50 });
    doc.text('Кол-во', 330, yPosition, { width: 50 });
    doc.text('Цена', 380, yPosition, { width: 70 });
    doc.text('Сумма', 450, yPosition, { width: 70 });

    yPosition += 20;

    // Позиции сметы
    items.forEach((item, index) => {
      doc.text((index + 1).toString(), 50, yPosition, { width: 30 });
      doc.text(item.name, 80, yPosition, { width: 200 });
      doc.text(item.unit, 280, yPosition, { width: 50 });
      doc.text(item.quantity.toString(), 330, yPosition, { width: 50 });
      doc.text(item.unit_price.toFixed(2), 380, yPosition, { width: 70 });
      doc.text(item.total_price.toFixed(2), 450, yPosition, { width: 70 });
      yPosition += 15;

      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
    });

    // Итоги
    doc.moveDown();
    doc.text(`Итого: ${estimate[0].total_cost.toFixed(2)} руб.`, { align: 'right' });
    doc.text(`С наценкой и накладными: ${estimate[0].final_amount.toFixed(2)} руб.`, { align: 'right' });

    doc.end();

    // Ждем завершения записи файла
    setTimeout(() => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          logger.error('PDF download error:', err);
        }
        // Удаляем файл после скачивания
        fs.unlink(filePath).catch(console.error);
      });
    }, 1000);

  } catch (error) {
    logger.error('Estimate PDF export error:', error);
    res.status(500).json({ error: 'Ошибка экспорта' });
  }
});

// Загрузка файлов
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не выбран' });
    }

    const documentData = {
      name: req.body.name || req.file.originalname,
      description: req.body.description,
      type: req.body.type || 'document',
      file_path: req.file.path,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      related_type: req.body.relatedType,
      related_id: req.body.relatedId,
      is_public: req.body.isPublic === 'true',
      uploaded_by: req.user.id
    };

    const fields = Object.keys(documentData).join(', ');
    const placeholders = Object.keys(documentData).map(() => '?').join(', ');
    const values = Object.values(documentData);

    const [result] = await db.execute(
      `INSERT INTO documents (${fields}) VALUES (${placeholders})`,
      values
    );

    await logAction(req.user.id, 'upload_document', 'documents', result.insertId, null, documentData, req);

    res.json({ 
      message: 'Файл загружен успешно', 
      documentId: result.insertId,
      fileName: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
});

// Обработчик ошибок
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// 404 обработчик
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Запуск сервера
async function startServer() {
  try {
    await createDirectories();
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server is running on port ${PORT}`);
      console.log(`🚀 Construction CRM Server запущен на порту ${PORT}`);
      console.log(`📊 Web интерфейс: http://${process.env.SERVER_IP || 'localhost'}:${PORT}`);
      console.log(`📊 API доступно по адресу: http://${process.env.SERVER_IP || 'localhost'}:${PORT}/api`);
      console.log(`📁 Рабочая директория: ${process.cwd()}`);
    });
  } catch (error) {
    logger.error('Server startup error:', error);
    process.exit(1);
  }
}

startServer();