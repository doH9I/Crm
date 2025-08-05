#!/bin/bash

# Скрипт для настройки базы данных CRM системы
echo "=== Настройка базы данных CRM системы ==="

# Проверяем, что MySQL запущен
if ! systemctl is-active --quiet mysql; then
    echo "Запускаем MySQL..."
    systemctl start mysql
    systemctl enable mysql
fi

# Запрашиваем пароль для пользователя базы данных
echo "Введите пароль для пользователя базы данных (crm_user):"
read -s DB_PASSWORD

# Создаем SQL файл для настройки базы данных
cat > setup_db.sql << EOF
-- Удаляем существующего пользователя (если есть)
DROP USER IF EXISTS 'crm_user'@'localhost';

-- Создаём базу данных
CREATE DATABASE IF NOT EXISTS construction_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создаём пользователя
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';

-- Даём права на базу данных
GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'localhost';

-- Применяем изменения
FLUSH PRIVILEGES;

-- Показываем результат
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'crm_user';
EOF

# Выполняем SQL скрипт
echo "Настраиваем базу данных..."
mysql -u root -p < setup_db.sql

# Импортируем структуру базы данных
if [ -f "database/schema.sql" ]; then
    echo "Импортируем структуру базы данных..."
    mysql -u crm_user -p$DB_PASSWORD construction_crm < database/schema.sql
    echo "Структура базы данных импортирована успешно!"
else
    echo "Файл database/schema.sql не найден!"
fi

# Удаляем временный файл
rm setup_db.sql

echo "=== Настройка базы данных завершена ==="
echo "Теперь обновите файл .env, заменив ВАШ_ПАРОЛЬ_ДЛЯ_БАЗЫ_ДАННЫХ на: $DB_PASSWORD"