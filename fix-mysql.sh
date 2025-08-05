#!/bin/bash

# Fix MySQL issues for Construction CRM
# Исправление проблем с MySQL

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info "Исправление проблем с MySQL..."

# Остановка MySQL
print_info "Остановка MySQL..."
systemctl stop mysql || true

# Запуск MySQL без проверки паролей
print_info "Запуск MySQL в безопасном режиме..."
mysqld_safe --skip-grant-tables --skip-networking &
MYSQL_PID=$!

# Ждем запуска
sleep 5

# Сброс пароля root
print_info "Сброс пароля root..."
mysql -u root <<EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root_password_123!@#';
FLUSH PRIVILEGES;
EOF

# Останавливаем безопасный режим
kill $MYSQL_PID 2>/dev/null || true
sleep 3

# Запускаем MySQL нормально
print_info "Запуск MySQL в нормальном режиме..."
systemctl start mysql
systemctl enable mysql

# Настройка безопасности
print_info "Настройка безопасности MySQL..."
mysql -u root -p'root_password_123!@#' <<EOF
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
EOF

# Создание базы данных и пользователя
print_info "Создание базы данных и пользователя..."
mysql -u root -p'root_password_123!@#' <<EOF
DROP DATABASE IF EXISTS construction_crm;
DROP USER IF EXISTS 'crm_user'@'localhost';
CREATE DATABASE construction_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'strong_password_123!@#';
GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'localhost';
GRANT CREATE, DROP, INDEX, ALTER ON construction_crm.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Тестирование подключения
print_info "Тестирование подключения..."
if mysql -u crm_user -p'strong_password_123!@#' -e "USE construction_crm; SELECT 1;" > /dev/null 2>&1; then
    print_success "MySQL настроен корректно!"
else
    print_error "Ошибка подключения к MySQL"
    exit 1
fi

# Импорт схемы базы данных
print_info "Импорт схемы базы данных..."
if [ -f "/var/www/construction-crm/database/schema.sql" ]; then
    mysql -u crm_user -p'strong_password_123!@#' construction_crm < /var/www/construction-crm/database/schema.sql
    print_success "Схема базы данных импортирована"
elif [ -f "database/schema.sql" ]; then
    mysql -u crm_user -p'strong_password_123!@#' construction_crm < database/schema.sql
    print_success "Схема базы данных импортирована"
else
    print_warning "Файл схемы базы данных не найден"
fi

# Создание администратора
print_info "Создание пользователя администратора..."

# Временный скрипт для создания админа
cat > /tmp/create_admin_fix.js << 'EOF'
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

        console.log('✅ Пользователь admin создан');
        console.log('📧 Email: admin@construction-crm.com');
        console.log('👤 Логин: admin');
        console.log('🔑 Пароль: admin123');
        console.log('⚠️  ОБЯЗАТЕЛЬНО смените пароль после первого входа!');
        
    } catch (error) {
        console.error('❌ Ошибка создания пользователя:', error.message);
        process.exit(1);
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
    sudo -u www-data node /tmp/create_admin_fix.js
else
    node /tmp/create_admin_fix.js
fi

rm /tmp/create_admin_fix.js

print_success "=========================================="
print_success "MySQL исправлен и настроен!"
print_success "=========================================="
print_info "База данных: construction_crm"
print_info "Пользователь БД: crm_user"
print_info "Пароль БД: strong_password_123!@#"
print_info ""
print_info "Администратор системы:"
print_info "Логин: admin"
print_info "Пароль: admin123"
print_warning "ОБЯЗАТЕЛЬНО смените пароль!"