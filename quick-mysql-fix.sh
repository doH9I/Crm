#!/bin/bash

# Quick MySQL Socket Fix
# Быстрое исправление ошибки сокета MySQL

echo "🔧 Быстрое исправление ошибки сокета MySQL..."

# Остановка MySQL
echo "Остановка MySQL..."
sudo systemctl stop mysql 2>/dev/null || true
sudo pkill mysqld 2>/dev/null || true

# Создание необходимых директорий и файлов
echo "Создание директорий и файлов..."
sudo mkdir -p /var/run/mysqld
sudo mkdir -p /var/lib/mysql
sudo mkdir -p /var/log/mysql

# Установка правильных прав доступа
echo "Установка прав доступа..."
sudo chown mysql:mysql /var/run/mysqld
sudo chown mysql:mysql /var/lib/mysql  
sudo chown mysql:mysql /var/log/mysql

sudo chmod 755 /var/run/mysqld
sudo chmod 700 /var/lib/mysql
sudo chmod 750 /var/log/mysql

# Создание файла сокета
sudo touch /var/run/mysqld/mysqld.sock
sudo chown mysql:mysql /var/run/mysqld/mysqld.sock
sudo chmod 660 /var/run/mysqld/mysqld.sock

# Проверка и создание пользователя mysql
if ! id mysql >/dev/null 2>&1; then
    echo "Создание пользователя mysql..."
    sudo useradd --system --home-dir /var/lib/mysql --shell /bin/false mysql
fi

# Инициализация базы данных если нужно
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "Инициализация базы данных MySQL..."
    sudo mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql
fi

# Запуск MySQL
echo "Запуск MySQL..."
sudo systemctl enable mysql
sudo systemctl start mysql

# Проверка статуса
sleep 3
if sudo systemctl is-active --quiet mysql; then
    echo "✅ MySQL успешно запущен!"
    
    # Проверка подключения
    if mysql -u root -e "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ Подключение к MySQL работает!"
        echo ""
        echo "Теперь можно продолжить:"
        echo "sudo bash fix-mysql.sh"
    else
        echo "⚠️  MySQL запущен, но нужна настройка паролей"
        echo "Запустите: sudo bash fix-mysql.sh"
    fi
else
    echo "❌ MySQL не удалось запустить"
    echo "Запустите полную диагностику: sudo bash mysql-diagnose.sh"
fi