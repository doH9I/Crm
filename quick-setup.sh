#!/bin/bash

# Quick Setup Script for Construction CRM
# Быстрая проверка и подготовка к развертыванию

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

# Проверка операционной системы
check_os() {
    print_info "Проверка операционной системы..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            print_success "Обнаружена Debian/Ubuntu система"
            return 0
        elif [ -f /etc/redhat-release ]; then
            print_warning "Обнаружена RedHat/CentOS система (не полностью поддерживается)"
            return 1
        fi
    fi
    
    print_error "Неподдерживаемая операционная система"
    return 1
}

# Проверка прав доступа
check_permissions() {
    print_info "Проверка прав доступа..."
    
    if [[ $EUID -eq 0 ]]; then
        print_success "Скрипт запущен с правами root"
        return 0
    else
        print_warning "Скрипт не запущен с правами root. Некоторые операции могут быть недоступны"
        return 1
    fi
}

# Проверка сетевого подключения
check_network() {
    print_info "Проверка сетевого подключения..."
    
    if ping -c 1 google.com &> /dev/null; then
        print_success "Интернет соединение активно"
        return 0
    else
        print_error "Нет доступа к интернету"
        return 1
    fi
}

# Проверка структуры проекта
check_project_structure() {
    print_info "Проверка структуры проекта..."
    
    local required_files=(
        "package.json"
        "server.js"
        ".env"
        "nginx.conf"
        "construction-crm.service"
        "deploy.sh"
        "database/schema.sql"
        "public/index.html"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        print_success "Все необходимые файлы присутствуют"
        return 0
    else
        print_error "Отсутствуют файлы:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        return 1
    fi
}

# Проверка портов
check_ports() {
    print_info "Проверка доступности портов..."
    
    local ports=(80 443 3000 3306)
    local busy_ports=()
    
    for port in "${ports[@]}"; do
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            busy_ports+=("$port")
        fi
    done
    
    if [ ${#busy_ports[@]} -eq 0 ]; then
        print_success "Все необходимые порты свободны"
        return 0
    else
        print_warning "Заняты порты: ${busy_ports[*]}"
        print_info "Это может потребовать дополнительной настройки"
        return 1
    fi
}

# Проверка дискового пространства
check_disk_space() {
    print_info "Проверка дискового пространства..."
    
    local available_space=$(df / | tail -1 | awk '{print $4}')
    local required_space=1048576  # 1GB в KB
    
    if [ "$available_space" -gt "$required_space" ]; then
        print_success "Достаточно дискового пространства ($(($available_space / 1024 / 1024))GB доступно)"
        return 0
    else
        print_error "Недостаточно дискового пространства (требуется минимум 1GB)"
        return 1
    fi
}

# Проверка .env файла
check_env_config() {
    print_info "Проверка конфигурации .env..."
    
    if [ ! -f ".env" ]; then
        print_error "Файл .env не найден"
        return 1
    fi
    
    local required_vars=(
        "NODE_ENV"
        "PORT"
        "DB_HOST"
        "DB_USER"
        "DB_PASSWORD"
        "DB_NAME"
        "JWT_SECRET"
        "SERVER_IP"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        print_success "Конфигурация .env корректна"
        return 0
    else
        print_error "Отсутствуют переменные в .env:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        return 1
    fi
}

# Установка Node.js (если не установлен)
install_nodejs_if_needed() {
    if ! command -v node &> /dev/null; then
        print_info "Node.js не найден, устанавливаем..."
        
        if [[ $EUID -eq 0 ]]; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
            print_success "Node.js установлен: $(node --version)"
        else
            print_error "Требуются права root для установки Node.js"
            return 1
        fi
    else
        print_success "Node.js уже установлен: $(node --version)"
    fi
}

# Проверка зависимостей npm
check_npm_dependencies() {
    print_info "Проверка зависимостей npm..."
    
    if [ ! -d "node_modules" ]; then
        print_warning "Зависимости npm не установлены"
        
        if command -v npm &> /dev/null; then
            print_info "Устанавливаем зависимости..."
            npm install --production
            print_success "Зависимости установлены"
        else
            print_error "npm не найден"
            return 1
        fi
    else
        print_success "Зависимости npm уже установлены"
    fi
}

# Создание резервной копии
create_backup() {
    print_info "Создание резервной копии проекта..."
    
    local backup_dir="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    cp -r ./* "$backup_dir/" 2>/dev/null || true
    
    print_success "Резервная копия создана в директории: $backup_dir"
}

# Основная функция проверки
main() {
    echo "============================================="
    echo "Construction CRM - Предварительная проверка"
    echo "============================================="
    echo ""
    
    local errors=0
    
    check_os || ((errors++))
    check_permissions || true  # Не критично
    check_network || ((errors++))
    check_project_structure || ((errors++))
    check_ports || true  # Не критично
    check_disk_space || ((errors++))
    check_env_config || ((errors++))
    
    echo ""
    print_info "Установка и проверка Node.js..."
    install_nodejs_if_needed || ((errors++))
    check_npm_dependencies || ((errors++))
    
    echo ""
    print_info "Создание резервной копии..."
    create_backup
    
    echo ""
    echo "============================================="
    
    if [ $errors -eq 0 ]; then
        print_success "Все проверки прошли успешно!"
        print_info "Система готова к развертыванию"
        print_info ""
        print_info "Для запуска полного развертывания выполните:"
        print_info "sudo bash deploy.sh"
    else
        print_error "Обнаружено $errors ошибок"
        print_warning "Исправьте ошибки перед развертыванием"
        exit 1
    fi
}

# Запуск
main "$@"