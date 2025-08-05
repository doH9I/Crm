// ДОПОЛНЕНИЯ ДЛЯ SERVER.JS
// Добавить в начало файла после других require:

const MockDatabase = require('./mock-database');

// Заменить функцию connectDB:

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

// Добавить после объявления PORT:

// Устанавливаем JWT_SECRET если не задан
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'construction-crm-secret-key-2024';
}

// ДОБАВИТЬ НОВЫЕ API ЭНДПОИНТЫ ПЕРЕД РАЗДЕЛОМ "// ДАШБОРД":

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