#!/bin/bash

echo "=== MySQL Setup and Diagnostic Script ==="
echo "Проверяем и настраиваем MySQL для Construction CRM"

# Функция для проверки статуса MySQL
check_mysql_status() {
    echo "1. Проверяем статус MySQL..."
    if systemctl is-active --quiet mysql; then
        echo "✓ MySQL запущен"
    else
        echo "✗ MySQL не запущен"
        return 1
    fi
}

# Функция для проверки подключения
check_mysql_connection() {
    echo "2. Проверяем подключение к MySQL..."
    if mysql -u root -p -e "SELECT 1;" 2>/dev/null; then
        echo "✓ Подключение к MySQL работает"
    else
        echo "✗ Не удается подключиться к MySQL"
        return 1
    fi
}

# Функция для проверки пользователя
check_user() {
    echo "3. Проверяем пользователя crm_user..."
    if mysql -u root -p -e "SELECT User FROM mysql.user WHERE User='crm_user';" 2>/dev/null | grep -q crm_user; then
        echo "✓ Пользователь crm_user существует"
    else
        echo "✗ Пользователь crm_user не найден"
        return 1
    fi
}

# Функция для проверки базы данных
check_database() {
    echo "4. Проверяем базу данных construction_crm..."
    if mysql -u root -p -e "SHOW DATABASES;" 2>/dev/null | grep -q construction_crm; then
        echo "✓ База данных construction_crm существует"
    else
        echo "✗ База данных construction_crm не найдена"
        return 1
    fi
}

# Команды для установки MySQL (если не установлен)
install_mysql() {
    echo "Устанавливаем MySQL..."
    apt update
    apt install -y mysql-server mysql-client
    systemctl start mysql
    systemctl enable mysql
    mysql_secure_installation
}

# Команды для создания пользователя и базы данных
setup_database() {
    echo "Настраиваем базу данных..."
    echo "Выполните следующие команды в MySQL:"
    echo ""
    echo "mysql -u root -p"
    echo ""
    echo "-- В MySQL консоли выполните:"
    echo "CREATE DATABASE IF NOT EXISTS construction_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo "CREATE USER IF NOT EXISTS 'crm_user'@'localhost' IDENTIFIED BY 'CaMBeJI30091994';"
    echo "CREATE USER IF NOT EXISTS 'crm_user'@'127.0.0.1' IDENTIFIED BY 'CaMBeJI30091994';"
    echo "CREATE USER IF NOT EXISTS 'crm_user'@'%' IDENTIFIED BY 'CaMBeJI30091994';"
    echo "GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'localhost';"
    echo "GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'127.0.0.1';"
    echo "GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'%';"
    echo "FLUSH PRIVILEGES;"
    echo "EXIT;"
}

# Основная логика
main() {
    echo "Начинаем диагностику..."
    
    # Проверяем установку MySQL
    if ! command -v mysql &> /dev/null; then
        echo "MySQL не установлен!"
        echo "Хотите установить? (y/n)"
        read -r response
        if [[ "$response" == "y" ]]; then
            install_mysql
        else
            echo "Установите MySQL вручную: apt install mysql-server"
            exit 1
        fi
    fi
    
    # Проверяем статус
    if ! check_mysql_status; then
        echo "Запускаем MySQL..."
        systemctl start mysql
        sleep 3
    fi
    
    # Показываем информацию для настройки
    echo ""
    echo "=== ИНФОРМАЦИЯ ДЛЯ НАСТРОЙКИ ==="
    echo "Если база данных не настроена, выполните:"
    setup_database
    
    echo ""
    echo "=== КОМАНДЫ ДЛЯ ДИАГНОСТИКИ ==="
    echo "Проверить статус MySQL:"
    echo "  systemctl status mysql"
    echo ""
    echo "Проверить процессы MySQL:"
    echo "  ps aux | grep mysql"
    echo ""
    echo "Проверить порты:"
    echo "  netstat -tulpn | grep :3306"
    echo ""
    echo "Подключиться к MySQL:"
    echo "  mysql -u root -p"
    echo ""
    echo "Проверить пользователей:"
    echo "  mysql -u root -p -e \"SELECT User, Host FROM mysql.user;\""
    echo ""
    echo "Проверить базы данных:"
    echo "  mysql -u root -p -e \"SHOW DATABASES;\""
    echo ""
    echo "Тестировать подключение с пользователем crm_user:"
    echo "  mysql -u crm_user -p -h 127.0.0.1 construction_crm"
}

# Запускаем основную функцию
main