#!/bin/bash

# Fix MySQL Root Access Script
# Исправление доступа root к MySQL

echo "🔧 Исправление доступа root к MySQL..."

# Остановка MySQL
echo "⏹️  Остановка MySQL..."
sudo systemctl stop mysql

# Создание директории для временных файлов MySQL
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld

# Запуск MySQL в безопасном режиме
echo "🔓 Запуск MySQL в безопасном режиме..."
sudo mysqld_safe --skip-grant-tables --skip-networking &
MYSQL_PID=$!

# Ожидание запуска MySQL
echo "⏳ Ожидание запуска MySQL..."
sleep 10

# Проверка что MySQL запустился
if ! pgrep mysqld > /dev/null; then
    echo "❌ Не удалось запустить MySQL в безопасном режиме"
    echo "Попробуем альтернативный метод..."
    
    # Альтернативный запуск
    sudo /usr/sbin/mysqld --skip-grant-tables --skip-networking --user=mysql &
    MYSQL_PID=$!
    sleep 10
fi

# Попытка подключения и сброса пароля
echo "🔑 Сброс пароля root..."
mysql -u root << 'EOF'
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root_password_123!@#';
FLUSH PRIVILEGES;
EXIT;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Пароль root успешно установлен"
else
    echo "⚠️  Попытка через UPDATE..."
    mysql -u root << 'EOF'
FLUSH PRIVILEGES;
UPDATE mysql.user SET authentication_string=PASSWORD('root_password_123!@#') WHERE User='root' AND Host='localhost';
UPDATE mysql.user SET plugin='mysql_native_password' WHERE User='root' AND Host='localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
fi

# Остановка безопасного режима
echo "⏹️  Остановка безопасного режима..."
sudo pkill mysqld_safe
sudo pkill mysqld
sleep 5

# Обычный запуск MySQL
echo "🚀 Запуск MySQL в обычном режиме..."
sudo systemctl start mysql
sudo systemctl enable mysql

# Проверка доступа с новым паролем
echo "🔍 Проверка доступа root..."
if mysql -u root -p'root_password_123!@#' -e "SELECT 'MySQL root access OK' AS status;" 2>/dev/null; then
    echo "✅ Доступ root к MySQL восстановлен"
    
    # Создание пользователя CRM и базы данных
    echo "🔧 Настройка CRM пользователя и базы данных..."
    mysql -u root -p'root_password_123!@#' << 'EOF'
-- Удаление старых данных (если есть)
DROP DATABASE IF EXISTS construction_crm;
DROP USER IF EXISTS 'crm_user'@'localhost';

-- Создание базы данных
CREATE DATABASE construction_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создание пользователя
CREATE USER 'crm_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'strong_password_123!@#';

-- Предоставление прав
GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'localhost';
GRANT CREATE, DROP, INDEX, ALTER ON construction_crm.* TO 'crm_user'@'localhost';

-- Очистка безопасности
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';

FLUSH PRIVILEGES;
EOF

    if [ $? -eq 0 ]; then
        echo "✅ CRM пользователь и база данных созданы"
        
        # Тестирование подключения CRM пользователя
        if mysql -u crm_user -p'strong_password_123!@#' -e "USE construction_crm; SELECT 'CRM user access OK' AS status;" 2>/dev/null; then
            echo "✅ Доступ CRM пользователя работает"
        else
            echo "❌ Проблемы с доступом CRM пользователя"
        fi
    else
        echo "❌ Ошибка создания CRM пользователя"
    fi
    
else
    echo "❌ Не удалось восстановить доступ root"
    echo "Попробуйте переустановить MySQL:"
    echo "  sudo apt-get remove --purge mysql-server"
    echo "  sudo apt-get install mysql-server"
    exit 1
fi

echo ""
echo "🎯 MySQL настроен!"
echo "📋 Информация:"
echo "  Root пароль: root_password_123!@#"
echo "  CRM пользователь: crm_user"
echo "  CRM пароль: strong_password_123!@#"
echo "  База данных: construction_crm"
echo ""
echo "🚀 Можно продолжить развертывание:"
echo "  sudo bash deploy.sh"