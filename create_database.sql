-- Создание базы данных и пользователя для Construction CRM
-- Выполните эти команды в MySQL консоли

-- Создание базы данных
CREATE DATABASE IF NOT EXISTS construction_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создание пользователя для разных хостов
CREATE USER IF NOT EXISTS 'crm_user'@'localhost' IDENTIFIED BY 'CaMBeJI30091994';
CREATE USER IF NOT EXISTS 'crm_user'@'127.0.0.1' IDENTIFIED BY 'CaMBeJI30091994';
CREATE USER IF NOT EXISTS 'crm_user'@'%' IDENTIFIED BY 'CaMBeJI30091994';

-- Предоставление прав доступа
GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'%';

-- Применение изменений
FLUSH PRIVILEGES;

-- Проверка созданных пользователей
SELECT User, Host FROM mysql.user WHERE User = 'crm_user';

-- Проверка баз данных
SHOW DATABASES;