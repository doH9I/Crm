const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Конфигурация базы данных
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'crm_user',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4'
};

// Конфигурация с базой данных
const dbConfigWithDB = {
  ...dbConfig,
  database: process.env.DB_NAME || 'construction_crm'
};

async function createDatabase() {
  console.log('🗄️  Создание базы данных...');
  
  let connection;
  try {
    // Подключаемся без указания базы данных
    connection = await mysql.createConnection(dbConfig);
    
    // Создаем базу данных если не существует
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'construction_crm'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ База данных создана/проверена');
    
  } catch (error) {
    console.error('❌ Ошибка создания базы данных:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

async function createTables() {
  console.log('📋 Создание таблиц...');
  
  let connection;
  try {
    // Подключаемся к созданной базе данных
    connection = await mysql.createConnection(dbConfigWithDB);
    
    // Читаем SQL схему
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    
    // Разбиваем на отдельные запросы
    const queries = schemaSQL
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--') && !query.toLowerCase().includes('create database') && !query.toLowerCase().includes('use '));
    
    console.log(`📝 Выполнение ${queries.length} SQL запросов...`);
    
    for (const query of queries) {
      if (query.trim()) {
        try {
          await connection.execute(query);
        } catch (error) {
          // Игнорируем ошибки "таблица уже существует"
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️  Предупреждение при выполнении запроса: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Таблицы созданы/обновлены');
    
  } catch (error) {
    console.error('❌ Ошибка создания таблиц:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

async function createAdminUser() {
  console.log('👤 Создание администратора...');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfigWithDB);
    
    // Проверяем, есть ли уже пользователи
    const [existingUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers[0].count > 0) {
      console.log('✅ Пользователи уже существуют, пропускаем создание администратора');
      return;
    }
    
    // Запрашиваем данные администратора
    console.log('\n🔐 Необходимо создать первого администратора:');
    
    // Создаем администратора с заданными данными
    const adminData = {
      username: 'admin',
      email: 'nazarian.samvel@yandex.ru',
      password: 'CaMBeJI30091994',
      firstName: 'Самвел',
      lastName: 'Назарян',
      middleName: '',
      phone: '+79919319794',
      role: 'admin'
    };
    
    // Хешируем пароль
    const passwordHash = await bcrypt.hash(adminData.password, 10);
    
    // Создаем пользователя
    await connection.execute(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, middle_name, phone, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)`,
      [
        adminData.username,
        adminData.email,
        passwordHash,
        adminData.firstName,
        adminData.lastName,
        adminData.middleName,
        adminData.phone,
        adminData.role
      ]
    );
    
    console.log('✅ Администратор создан:');
    console.log(`   Логин: ${adminData.username}`);
    console.log(`   Пароль: ${adminData.password}`);
    console.log(`   Email: ${adminData.email}`);
    console.log('\n⚠️  ОБЯЗАТЕЛЬНО смените пароль после первого входа!');
    
  } catch (error) {
    console.error('❌ Ошибка создания администратора:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

async function testConnection() {
  console.log('🔌 Тестирование подключения...');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfigWithDB);
    const [result] = await connection.execute('SELECT 1 as test');
    
    if (result[0].test === 1) {
      console.log('✅ Подключение к базе данных работает');
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

async function initializeDatabase() {
  console.log('🚀 Инициализация базы данных Construction CRM\n');
  
  try {
    console.log('📊 Настройки подключения:');
    console.log(`   Хост: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Пользователь: ${dbConfig.user}`);
    console.log(`   База данных: ${process.env.DB_NAME || 'construction_crm'}\n`);
    
    await createDatabase();
    await createTables();
    await createAdminUser();
    await testConnection();
    
    console.log('\n🎉 Инициализация завершена успешно!');
    console.log('🌐 Теперь можно запускать сервер');
    
  } catch (error) {
    console.error('\n💥 Ошибка инициализации:', error.message);
    process.exit(1);
  }
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };