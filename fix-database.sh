#!/bin/bash

# Fix Database Import Script
# Исправление импорта схемы базы данных

echo "🔧 Исправление импорта базы данных..."

# Проверка подключения к MySQL
if ! mysql -u crm_user -p'strong_password_123!@#' -e "USE construction_crm;" >/dev/null 2>&1; then
    echo "❌ Нет подключения к базе данных. Сначала исправьте MySQL:"
    echo "sudo bash fix-mysql.sh"
    exit 1
fi

echo "✅ Подключение к базе данных работает"

# Создание безопасной версии схемы
echo "📝 Создание безопасной схемы..."
cat > /tmp/safe_schema.sql << 'EOF'
-- Безопасная схема базы данных с IF NOT EXISTS
USE construction_crm;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    phone VARCHAR(20),
    role ENUM('admin', 'general_director', 'construction_director', 'site_manager', 'foreman', 'estimator', 'pto_employee', 'procurement') NOT NULL,
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица клиентов
CREATE TABLE IF NOT EXISTS clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('individual', 'legal') NOT NULL,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    inn VARCHAR(12),
    kpp VARCHAR(9),
    ogrn VARCHAR(15),
    address TEXT,
    legal_address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    bank_name VARCHAR(255),
    bank_account VARCHAR(20),
    bank_bik VARCHAR(9),
    status ENUM('active', 'inactive', 'potential') DEFAULT 'potential',
    source VARCHAR(100),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица подрядчиков
CREATE TABLE IF NOT EXISTS contractors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    inn VARCHAR(12),
    kpp VARCHAR(9),
    ogrn VARCHAR(15),
    address TEXT,
    legal_address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    specialization TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    status ENUM('active', 'inactive', 'blacklisted') DEFAULT 'active',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица проектов
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id INT,
    project_manager_id INT,
    site_manager_id INT,
    status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0,
    address TEXT,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (project_manager_id) REFERENCES users(id),
    FOREIGN KEY (site_manager_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица задач проекта
CREATE TABLE IF NOT EXISTS project_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to INT,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2) DEFAULT 0,
    parent_task_id INT,
    order_index INT DEFAULT 0,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (parent_task_id) REFERENCES project_tasks(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица материалов склада
CREATE TABLE IF NOT EXISTS warehouse_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(20) NOT NULL,
    quantity DECIMAL(15,3) DEFAULT 0,
    min_quantity DECIMAL(15,3) DEFAULT 0,
    price DECIMAL(15,2),
    supplier VARCHAR(255),
    location VARCHAR(100),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица движения материалов
CREATE TABLE IF NOT EXISTS material_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    project_id INT,
    type ENUM('in', 'out', 'transfer', 'adjustment') NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),
    document_number VARCHAR(100),
    document_date DATE,
    supplier_contractor VARCHAR(255),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES warehouse_materials(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица табеля рабочего времени
CREATE TABLE IF NOT EXISTS timesheets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    project_id INT,
    task_id INT,
    date DATE NOT NULL,
    hours_worked DECIMAL(4,2) NOT NULL,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    description TEXT,
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (task_id) REFERENCES project_tasks(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY unique_user_date (user_id, date)
);

-- Таблица файлов
CREATE TABLE IF NOT EXISTS files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    entity_type ENUM('project', 'task', 'client', 'contractor', 'user', 'material') NOT NULL,
    entity_id INT NOT NULL,
    description TEXT,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Таблица настроек системы
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Таблица логов системы
CREATE TABLE IF NOT EXISTS system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_action (user_id, action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);

-- Создание индексов для оптимизации (с проверкой существования)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='construction_crm' AND TABLE_NAME='users' AND INDEX_NAME='idx_users_username') = 0,
    'CREATE INDEX idx_users_username ON users(username)',
    'SELECT "Index idx_users_username already exists"'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='construction_crm' AND TABLE_NAME='users' AND INDEX_NAME='idx_users_email') = 0,
    'CREATE INDEX idx_users_email ON users(email)',
    'SELECT "Index idx_users_email already exists"'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA='construction_crm' AND TABLE_NAME='users' AND INDEX_NAME='idx_users_role') = 0,
    'CREATE INDEX idx_users_role ON users(role)',
    'SELECT "Index idx_users_role already exists"'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
EOF

# Импорт безопасной схемы
echo "📥 Импорт безопасной схемы..."
if mysql -u crm_user -p'strong_password_123!@#' construction_crm < /tmp/safe_schema.sql; then
    echo "✅ Схема базы данных успешно импортирована"
else
    echo "❌ Ошибка импорта схемы"
    exit 1
fi

# Удаление временного файла
rm /tmp/safe_schema.sql

# Проверка созданных таблиц
echo ""
echo "📊 Проверка созданных таблиц:"
mysql -u crm_user -p'strong_password_123!@#' construction_crm -e "SHOW TABLES;" | sed 's/^/  /'

echo ""
echo "👤 Проверка пользователя admin:"
admin_count=$(mysql -u crm_user -p'strong_password_123!@#' construction_crm -e "SELECT COUNT(*) FROM users WHERE username='admin';" -s)
if [ "$admin_count" -gt 0 ]; then
    echo "✅ Пользователь admin существует"
else
    echo "⚠️  Пользователь admin не найден. Создание..."
    
    # Создание администратора
    cat > /tmp/create_admin_safe.js << 'EOF'
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'crm_user',
            password: 'strong_password_123!@#',
            database: 'construction_crm'
        });

        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await connection.execute(`
            INSERT IGNORE INTO users (username, email, password_hash, first_name, last_name, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, ['admin', 'admin@construction-crm.com', hashedPassword, 'Администратор', 'Системы', 'admin', true]);

        console.log('✅ Пользователь admin создан или уже существует');
        
    } catch (error) {
        console.error('❌ Ошибка создания пользователя:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createAdmin();
EOF

    # Запуск создания админа
    if [ -d "/var/www/construction-crm" ]; then
        cd /var/www/construction-crm
        sudo -u www-data node /tmp/create_admin_safe.js
    else
        node /tmp/create_admin_safe.js
    fi
    
    rm /tmp/create_admin_safe.js
fi

echo ""
echo "🎯 База данных готова к работе!"
echo ""
echo "📋 Информация о базе данных:"
echo "  База данных: construction_crm"
echo "  Пользователь: crm_user"
echo "  Администратор: admin / admin123"