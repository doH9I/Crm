#!/bin/bash

# Construction CRM Deployment Script
# Автоматическое развертывание на Ubuntu/Debian сервере

set -e  # Остановить выполнение при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для цветного вывода
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

# Проверка прав суперпользователя
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Этот скрипт должен запускаться с правами суперпользователя (sudo)"
        exit 1
    fi
}

# Обновление системы
update_system() {
    print_info "Обновление системы..."
    apt update && apt upgrade -y
    print_success "Система обновлена"
}

# Установка необходимых пакетов
install_packages() {
    print_info "Установка необходимых пакетов..."
    
    # Основные пакеты
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    # Nginx
    apt install -y nginx
    
    # MySQL Server
    apt install -y mysql-server
    
    print_success "Пакеты установлены"
}

# Установка Node.js
install_nodejs() {
    print_info "Установка Node.js..."
    
    # Добавляем NodeSource репозиторий
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Проверяем версии
    node_version=$(node --version)
    npm_version=$(npm --version)
    
    print_success "Node.js установлен: $node_version"
    print_success "npm установлен: $npm_version"
}

# Настройка MySQL
setup_mysql() {
    print_info "Настройка MySQL..."
    
    # Запуск MySQL
    systemctl start mysql
    systemctl enable mysql
    
    # Настройка безопасности MySQL (автоматически)
    print_info "Настройка безопасности MySQL..."
    mysql -u root <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root_password_123!@#';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
EOF

    # Создание базы данных и пользователя
    print_info "Создание базы данных и пользователя..."
    mysql -u root -p'root_password_123!@#' <<EOF
CREATE DATABASE IF NOT EXISTS construction_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'crm_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'strong_password_123!@#';
GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'localhost';
GRANT CREATE, DROP, INDEX, ALTER ON construction_crm.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EOF

    # Тестирование подключения
    print_info "Тестирование подключения к базе данных..."
    if mysql -u crm_user -p'strong_password_123!@#' -e "USE construction_crm; SELECT 1;" > /dev/null 2>&1; then
        print_success "MySQL настроен и подключение работает"
    else
        print_error "Ошибка подключения к MySQL"
        return 1
    fi
}

# Настройка директорий проекта
setup_directories() {
    print_info "Настройка директорий проекта..."
    
    # Создание основной директории
    mkdir -p /var/www/construction-crm
    
    # Копирование файлов проекта
    if [ -d "/root/construction-crm" ]; then
        cp -r /root/construction-crm/* /var/www/construction-crm/
    elif [ -d "/home/*/construction-crm" ]; then
        cp -r /home/*/construction-crm/* /var/www/construction-crm/
    else
        print_warning "Директория с проектом не найдена. Убедитесь, что проект загружен на сервер."
    fi
    
    # Создание необходимых директорий
    mkdir -p /var/www/construction-crm/{uploads,logs,exports}
    
    # Установка прав доступа
    chown -R www-data:www-data /var/www/construction-crm
    chmod -R 755 /var/www/construction-crm
    chmod -R 775 /var/www/construction-crm/{uploads,logs,exports}
    
    print_success "Директории настроены"
}

# Установка зависимостей Node.js
install_dependencies() {
    print_info "Установка зависимостей Node.js..."
    
    cd /var/www/construction-crm
    
    # Установка зависимостей
    sudo -u www-data npm install --production
    
    print_success "Зависимости установлены"
}

# Импорт схемы базы данных
import_database_schema() {
    print_info "Импорт схемы базы данных..."
    
    if [ -f "/var/www/construction-crm/database/schema.sql" ]; then
        # Сначала проверим подключение
        if ! mysql -u crm_user -p'strong_password_123!@#' -e "USE construction_crm;" > /dev/null 2>&1; then
            print_error "Не удается подключиться к базе данных. Попробуем через root..."
            mysql -u root -p'root_password_123!@#' construction_crm < /var/www/construction-crm/database/schema.sql
        else
            mysql -u crm_user -p'strong_password_123!@#' construction_crm < /var/www/construction-crm/database/schema.sql
        fi
        print_success "Схема базы данных импортирована"
    else
        print_warning "Файл схемы базы данных не найден"
    fi
}

# Настройка Nginx
setup_nginx() {
    print_info "Настройка Nginx..."
    
    # Удаление конфигурации по умолчанию
    rm -f /etc/nginx/sites-enabled/default
    
    # Копирование конфигурации CRM
    cp /var/www/construction-crm/nginx.conf /etc/nginx/sites-available/construction-crm
    ln -sf /etc/nginx/sites-available/construction-crm /etc/nginx/sites-enabled/
    
    # Проверка конфигурации
    nginx -t
    
    # Перезапуск Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    print_success "Nginx настроен"
}

# Настройка systemd сервиса
setup_systemd_service() {
    print_info "Настройка systemd сервиса..."
    
    # Копирование файла сервиса
    cp /var/www/construction-crm/construction-crm.service /etc/systemd/system/
    
    # Перезагрузка systemd
    systemctl daemon-reload
    
    # Включение и запуск сервиса
    systemctl enable construction-crm
    systemctl start construction-crm
    
    print_success "Systemd сервис настроен"
}

# Настройка файрвола
setup_firewall() {
    print_info "Настройка файрвола..."
    
    # Установка ufw если не установлен
    apt install -y ufw
    
    # Базовые правила
    ufw default deny incoming
    ufw default allow outgoing
    
    # Разрешаем SSH (важно!)
    ufw allow ssh
    ufw allow 22
    
    # Разрешаем HTTP и HTTPS
    ufw allow 80
    ufw allow 443
    
    # Включаем файрвол
    ufw --force enable
    
    print_success "Файрвол настроен"
}

# Проверка статуса сервисов
check_services() {
    print_info "Проверка статуса сервисов..."
    
    # Проверка MySQL
    if systemctl is-active --quiet mysql; then
        print_success "MySQL запущен"
    else
        print_error "MySQL не запущен"
    fi
    
    # Проверка Nginx
    if systemctl is-active --quiet nginx; then
        print_success "Nginx запущен"
    else
        print_error "Nginx не запущен"
    fi
    
    # Проверка Construction CRM
    if systemctl is-active --quiet construction-crm; then
        print_success "Construction CRM запущен"
    else
        print_error "Construction CRM не запущен"
    fi
}

# Создание пользователя по умолчанию
create_default_user() {
    print_info "Создание пользователя по умолчанию..."
    
    # Скрипт создания пользователя admin
    cat > /tmp/create_admin.js << 'EOF'
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
    try {
        const connection = await mysql.createConnection({
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

        console.log('Пользователь admin создан');
        console.log('Логин: admin');
        console.log('Пароль: admin123');
        console.log('Обязательно смените пароль после первого входа!');
        
        await connection.end();
    } catch (error) {
        console.error('Ошибка создания пользователя:', error);
    }
}

createAdmin();
EOF

    cd /var/www/construction-crm
    sudo -u www-data node /tmp/create_admin.js
    rm /tmp/create_admin.js
    
    print_success "Пользователь по умолчанию создан"
}

# Основная функция
main() {
    print_info "Начало развертывания Construction CRM..."
    
    check_root
    update_system
    install_packages
    install_nodejs
    setup_mysql
    setup_directories
    install_dependencies
    import_database_schema
    setup_nginx
    setup_systemd_service
    setup_firewall
    create_default_user
    check_services
    
    print_success "=========================================="
    print_success "Развертывание завершено успешно!"
    print_success "=========================================="
    print_info "Web интерфейс доступен по адресу: http://79.174.85.87"
    print_info "Логин: admin"
    print_info "Пароль: admin123"
    print_warning "ОБЯЗАТЕЛЬНО смените пароль после первого входа!"
    print_info ""
    print_info "Полезные команды:"
    print_info "- Статус сервиса: sudo systemctl status construction-crm"
    print_info "- Логи сервиса: sudo journalctl -u construction-crm -f"
    print_info "- Перезапуск: sudo systemctl restart construction-crm"
    print_info "- Статус Nginx: sudo systemctl status nginx"
    print_info "- Статус MySQL: sudo systemctl status mysql"
}

# Запуск основной функции
main "$@"