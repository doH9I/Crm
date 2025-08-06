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
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Проверка обязательных переменных окружения
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Отсутствует переменная окружения: ${envVar}`);
        process.exit(1);
    }
}

// Настройка логгера
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
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
    const dirs = ['uploads', 'logs', 'exports', 'public', 'backups'];
    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
            logger.info(`Directory created: ${dir}`);
        } catch (error) {
            logger.error(`Error creating directory ${dir}:`, error);
        }
    }
}

// Подключение к базе данных
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

let db;
async function connectDB() {
    try {
        db = await mysql.createConnection(dbConfig);
        logger.info('✅ Connected to MySQL database');
        
        // Проверка подключения
        await db.execute('SELECT 1');
        logger.info('✅ Database connection verified');
        
        return true;
    } catch (error) {
        logger.error('❌ Database connection failed:', error);
        throw error;
    }
}

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(compression());
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_REQUESTS) || 100,
    message: { error: 'Слишком много запросов, попробуйте позже' }
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

// АУТЕНТИФИКАЦИЯ И АВТОРИЗАЦИЯ

// Вход в систему
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Логин и пароль обязательны' });
        }

        logger.info(`Login attempt for user: ${username}`);

        const [rows] = await db.execute(
            'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE',
            [username, username]
        );

        if (rows.length === 0) {
            logger.warn(`Login failed: user not found - ${username}`);
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            logger.warn(`Login failed: invalid password for user - ${username}`);
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }

        // Обновляем время последнего входа
        await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );

        await logAction(user.id, 'login', 'users', user.id, null, null, req);

        logger.info(`Login successful for user: ${username}`);

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
        logger.info(`User logged out: ${req.user.username}`);
        res.json({ message: 'Выход выполнен успешно' });
    } catch (error) {
        logger.error('Logout error:', error);
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
        
        // Подсчет общего количества
        let countQuery = 'SELECT COUNT(*) as total FROM clients';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const [countResult] = await db.execute(countQuery, params.slice(0, -2));

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

        logger.info(`Client created: ${clientData.name} by user ${req.user.username}`);

        res.status(201).json({ 
            message: 'Клиент создан успешно', 
            clientId: result.insertId,
            client: { id: result.insertId, ...clientData }
        });
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

        logger.info(`Client updated: ${req.params.id} by user ${req.user.username}`);

        res.json({ message: 'Клиент обновлен успешно' });
    } catch (error) {
        logger.error('Client update error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить клиента
app.delete('/api/clients/:id', authenticateToken, authorizeRoles('admin', 'general_director'), async (req, res) => {
    try {
        const [oldData] = await db.execute('SELECT * FROM clients WHERE id = ?', [req.params.id]);

        if (oldData.length === 0) {
            return res.status(404).json({ error: 'Клиент не найден' });
        }

        await db.execute('DELETE FROM clients WHERE id = ?', [req.params.id]);

        await logAction(req.user.id, 'delete_client', 'clients', req.params.id, oldData[0], null, req);

        logger.info(`Client deleted: ${req.params.id} by user ${req.user.username}`);

        res.json({ message: 'Клиент удален успешно' });
    } catch (error) {
        logger.error('Client deletion error:', error);
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
        
        let countQuery = 'SELECT COUNT(*) as total FROM contractors';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const [countResult] = await db.execute(countQuery, params.slice(0, -2));

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

        logger.info(`Contractor created: ${contractorData.name} by user ${req.user.username}`);

        res.status(201).json({ 
            message: 'Подрядчик создан успешно', 
            contractorId: result.insertId,
            contractor: { id: result.insertId, ...contractorData }
        });
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
        
        let countQuery = 'SELECT COUNT(*) as total FROM employees';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const [countResult] = await db.execute(countQuery, params.slice(0, -2));

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
        
        let countQuery = 'SELECT COUNT(*) as total FROM warehouse_items';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const [countResult] = await db.execute(countQuery, params.slice(0, -2));

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
                SUM(COALESCE(budget, 0)) as total_budget,
                SUM(COALESCE(actual_cost, 0)) as total_spent,
                AVG(COALESCE(progress, 0)) as avg_progress
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
                SUM(CASE WHEN type = 'receipt' THEN COALESCE(total_cost, 0) ELSE 0 END) as income,
                SUM(CASE WHEN type = 'issue' THEN COALESCE(total_cost, 0) ELSE 0 END) as expenses
            FROM warehouse_movements
            WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())
        `);

        dashboardData.financial = financialStats[0];

        logger.info(`Dashboard data loaded for user: ${req.user.username}`);

        res.json(dashboardData);
    } catch (error) {
        logger.error('Dashboard fetch error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обработчик ошибок
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// 404 обработчик
app.use((req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Запуск сервера
async function startServer() {
    try {
        await createDirectories();
        await connectDB();
        
        app.listen(PORT, '0.0.0.0', () => {
            logger.info(`🚀 Construction CRM Server запущен на порту ${PORT}`);
            logger.info(`📊 Web интерфейс: http://79.174.85.87:${PORT}`);
            logger.info(`📊 API доступно по адресу: http://79.174.85.87:${PORT}/api`);
            logger.info(`📁 Рабочая директория: ${process.cwd()}`);
            logger.info(`🔐 База данных: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
            
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    CONSTRUCTION CRM SERVER                   ║
║                         ЗАПУЩЕН УСПЕШНО                     ║
╠══════════════════════════════════════════════════════════════╣
║  🌐 URL: http://79.174.85.87:${PORT}                        ║
║  👤 Логин: admin                                           ║
║  🔐 Пароль: admin123                                       ║
║  📊 API: http://79.174.85.87:${PORT}/api                   ║
║  🗄️ База: ${process.env.DB_NAME}                          ║
╚══════════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        logger.error('Server startup error:', error);
        console.error('❌ Ошибка запуска сервера:', error.message);
        process.exit(1);
    }
}

startServer();