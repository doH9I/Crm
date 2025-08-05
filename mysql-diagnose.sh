#!/bin/bash

# MySQL Diagnostic and Fix Script
# Диагностика и исправление проблем с MySQL

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

print_info "🔍 Диагностика проблем с MySQL..."

# Проверка установки MySQL
check_mysql_installed() {
    print_info "Проверка установки MySQL..."
    
    if dpkg -l | grep -q mysql-server; then
        print_success "MySQL Server установлен"
        return 0
    else
        print_error "MySQL Server не установлен"
        return 1
    fi
}

# Проверка статуса сервиса
check_mysql_status() {
    print_info "Проверка статуса сервиса MySQL..."
    
    if systemctl is-active --quiet mysql; then
        print_success "MySQL запущен"
        return 0
    elif systemctl is-enabled --quiet mysql; then
        print_warning "MySQL включен, но не запущен"
        return 1
    else
        print_error "MySQL не включен в автозапуск"
        return 2
    fi
}

# Проверка логов MySQL
check_mysql_logs() {
    print_info "Проверка логов MySQL..."
    
    if [ -f "/var/log/mysql/error.log" ]; then
        print_info "Последние ошибки MySQL:"
        tail -10 /var/log/mysql/error.log | sed 's/^/  /'
    else
        print_warning "Файл логов MySQL не найден"
    fi
    
    echo ""
    print_info "Статус сервиса MySQL:"
    systemctl status mysql --no-pager -l | sed 's/^/  /'
}

# Проверка файлов конфигурации
check_mysql_config() {
    print_info "Проверка конфигурации MySQL..."
    
    if [ -f "/etc/mysql/mysql.conf.d/mysqld.cnf" ]; then
        print_success "Основной файл конфигурации найден"
    else
        print_warning "Основной файл конфигурации не найден"
    fi
    
    # Проверка прав доступа к директориям
    print_info "Проверка прав доступа..."
    
    directories=(
        "/var/lib/mysql"
        "/var/run/mysqld"
        "/var/log/mysql"
    )
    
    for dir in "${directories[@]}"; do
        if [ -d "$dir" ]; then
            owner=$(stat -c '%U:%G' "$dir")
            perms=$(stat -c '%a' "$dir")
            print_info "$dir - $owner ($perms)"
        else
            print_warning "Директория $dir не существует"
        fi
    done
}

# Проверка дискового пространства
check_disk_space() {
    print_info "Проверка дискового пространства..."
    
    available=$(df /var | tail -1 | awk '{print $4}')
    if [ "$available" -lt 1048576 ]; then  # Менее 1GB
        print_error "Недостаточно места на диске: $(($available / 1024))MB доступно"
        return 1
    else
        print_success "Достаточно места на диске: $(($available / 1024))MB доступно"
        return 0
    fi
}

# Исправление проблем с правами доступа
fix_permissions() {
    print_info "Исправление прав доступа..."
    
    # Создание необходимых директорий
    mkdir -p /var/run/mysqld
    mkdir -p /var/lib/mysql
    mkdir -p /var/log/mysql
    
    # Установка правильных прав
    chown mysql:mysql /var/run/mysqld
    chown mysql:mysql /var/lib/mysql
    chown mysql:mysql /var/log/mysql
    
    chmod 755 /var/run/mysqld
    chmod 700 /var/lib/mysql
    chmod 750 /var/log/mysql
    
    # Создание файла сокета если его нет
    touch /var/run/mysqld/mysqld.sock
    chown mysql:mysql /var/run/mysqld/mysqld.sock
    chmod 660 /var/run/mysqld/mysqld.sock
    
    print_success "Права доступа исправлены"
}

# Инициализация базы данных MySQL
initialize_mysql() {
    print_info "Инициализация базы данных MySQL..."
    
    # Остановка MySQL если запущен
    systemctl stop mysql 2>/dev/null || true
    
    # Проверка инициализации
    if [ ! -d "/var/lib/mysql/mysql" ]; then
        print_info "База данных MySQL не инициализирована. Инициализация..."
        mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql
        print_success "База данных инициализирована"
    else
        print_info "База данных уже инициализирована"
    fi
}

# Попытка запуска MySQL
start_mysql() {
    print_info "Попытка запуска MySQL..."
    
    # Включение автозапуска
    systemctl enable mysql
    
    # Запуск сервиса
    if systemctl start mysql; then
        print_success "MySQL успешно запущен"
        sleep 2
        
        # Проверка подключения
        if mysql -u root -e "SELECT 1;" > /dev/null 2>&1; then
            print_success "Подключение к MySQL работает"
            return 0
        else
            print_warning "MySQL запущен, но подключение не работает"
            return 1
        fi
    else
        print_error "Не удалось запустить MySQL"
        return 1
    fi
}

# Полная переустановка MySQL
reinstall_mysql() {
    print_warning "Попытка полной переустановки MySQL..."
    
    # Остановка сервиса
    systemctl stop mysql 2>/dev/null || true
    
    # Резервное копирование данных если они есть
    if [ -d "/var/lib/mysql" ] && [ "$(ls -A /var/lib/mysql)" ]; then
        print_info "Создание резервной копии данных..."
        cp -r /var/lib/mysql /var/lib/mysql.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Удаление MySQL
    apt-get remove --purge mysql-server mysql-client mysql-common -y
    apt-get autoremove -y
    apt-get autoclean
    
    # Удаление данных
    rm -rf /var/lib/mysql
    rm -rf /var/log/mysql
    rm -rf /etc/mysql
    
    # Установка MySQL заново
    print_info "Установка MySQL Server..."
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install mysql-server -y
    
    # Запуск и настройка
    systemctl start mysql
    systemctl enable mysql
    
    print_success "MySQL переустановлен"
}

# Основная функция диагностики
main() {
    echo "================================================"
    echo "🔍 Диагностика проблем с MySQL"
    echo "================================================"
    echo ""
    
    # Проверки
    mysql_installed=0
    mysql_running=0
    
    check_mysql_installed || mysql_installed=1
    check_mysql_status || mysql_running=1
    check_disk_space || exit 1
    
    echo ""
    print_info "📊 Подробная диагностика:"
    check_mysql_config
    echo ""
    check_mysql_logs
    echo ""
    
    # Попытки исправления
    if [ $mysql_installed -eq 1 ]; then
        print_info "🔧 Установка MySQL..."
        apt-get update
        DEBIAN_FRONTEND=noninteractive apt-get install mysql-server -y
    fi
    
    if [ $mysql_running -ne 0 ]; then
        print_info "🔧 Исправление проблем..."
        
        # Шаг 1: Исправление прав доступа
        fix_permissions
        
        # Шаг 2: Инициализация если нужно
        initialize_mysql
        
        # Шаг 3: Попытка запуска
        if ! start_mysql; then
            print_warning "Стандартные методы не помогли. Попробуем переустановку..."
            
            read -p "Переустановить MySQL? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                reinstall_mysql
                start_mysql
            fi
        fi
    fi
    
    echo ""
    echo "================================================"
    
    # Финальная проверка
    if systemctl is-active --quiet mysql && mysql -u root -e "SELECT 1;" > /dev/null 2>&1; then
        print_success "✅ MySQL работает корректно!"
        print_info ""
        print_info "Теперь можно продолжить развертывание:"
        print_info "sudo bash fix-mysql.sh"
        print_info "sudo bash deploy.sh"
    else
        print_error "❌ MySQL все еще не работает"
        print_info ""
        print_info "Попробуйте:"
        print_info "1. Проверить логи: sudo journalctl -u mysql -f"
        print_info "2. Проверить место на диске: df -h"
        print_info "3. Перезагрузить сервер: sudo reboot"
    fi
}

# Запуск диагностики
main "$@"