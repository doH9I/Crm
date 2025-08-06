#!/bin/bash

# Полная настройка MySQL для Construction CRM
# Пароли и настройки

echo "🔧 Настройка MySQL для Construction CRM..."

# Установка MySQL если не установлен
if ! command -v mysql &> /dev/null; then
    echo "📦 Установка MySQL Server..."
    apt update
    apt install -y mysql-server mysql-client
fi

# Запуск MySQL
systemctl start mysql
systemctl enable mysql

# Пароли (ВАЖНО: сохраните эти пароли!)
DB_ROOT_PASSWORD="ConstructionCRM2024Root!"
DB_USER="construction_admin"
DB_PASSWORD="CRM_Admin_2024#Secure"
DB_NAME="construction_crm"

echo "🔐 Настройка безопасности MySQL..."

# Настройка root пароля и безопасности
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_ROOT_PASSWORD}';"
mysql -u root -p${DB_ROOT_PASSWORD} -e "DELETE FROM mysql.user WHERE User='';"
mysql -u root -p${DB_ROOT_PASSWORD} -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -u root -p${DB_ROOT_PASSWORD} -e "DROP DATABASE IF EXISTS test;"
mysql -u root -p${DB_ROOT_PASSWORD} -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -u root -p${DB_ROOT_PASSWORD} -e "FLUSH PRIVILEGES;"

echo "🗄️ Создание базы данных и пользователя..."

# Создание базы данных и пользователя
mysql -u root -p${DB_ROOT_PASSWORD} << EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';

GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'%';

FLUSH PRIVILEGES;
EOF

echo "📋 Создание таблиц..."

# Выполнение SQL схемы
mysql -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} < database/schema.sql

echo "👤 Создание администратора..."

# Создание пользователя admin
ADMIN_PASSWORD_HASH=$(node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));")

mysql -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} << EOF
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active) 
VALUES ('admin', 'admin@construction-crm.local', '${ADMIN_PASSWORD_HASH}', 'Администратор', 'Системы', 'admin', TRUE)
ON DUPLICATE KEY UPDATE 
password_hash = '${ADMIN_PASSWORD_HASH}',
is_active = TRUE;
EOF

echo "📝 Создание файла конфигурации..."

# Создание .env файла
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# JWT Configuration
JWT_SECRET=ConstructionCRM2024_JWT_Secret_Key_Very_Secure_Random_String_12345
JWT_EXPIRE=24h

# Server Configuration
PORT=3000
NODE_ENV=production

# Security
CORS_ORIGIN=http://79.174.85.87:3000,http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_REQUESTS=100

# File Upload
MAX_FILE_SIZE=52428800

# Email Configuration (настройте для вашего SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Company Information
COMPANY_NAME=ООО "СтройМонтаж"
COMPANY_ADDRESS=г. Москва, ул. Строительная, д. 1
COMPANY_PHONE=+7 (495) 123-45-67
COMPANY_EMAIL=info@construction-crm.local
EOF

echo "✅ MySQL настроен успешно!"
echo ""
echo "📋 ВАЖНАЯ ИНФОРМАЦИЯ - СОХРАНИТЕ ЭТИ ДАННЫЕ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 MySQL Root пароль: ${DB_ROOT_PASSWORD}"
echo "👤 Пользователь БД: ${DB_USER}"
echo "🔑 Пароль БД: ${DB_PASSWORD}"
echo "🗄️ База данных: ${DB_NAME}"
echo "👨‍💼 Логин админа: admin"
echo "🔐 Пароль админа: admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Теперь можно запускать сервер: node server.js"