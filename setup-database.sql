-- Создание базы данных и пользователя
CREATE DATABASE IF NOT EXISTS construction_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создание пользователя root с паролем (если не существует)
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY '';
CREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED BY '';
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '';

-- Предоставление всех прав
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Обновление привилегий
FLUSH PRIVILEGES;

-- Использование базы данных
USE construction_crm;