#!/bin/bash

echo "🚀 Construction CRM - Production Startup Script"
echo "==============================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода с цветом
print_status() {
    echo -e "${2}${1}${NC}"
}

# Функция для проверки команды
check_command() {
    if command -v $1 &> /dev/null; then
        print_status "✅ $1 установлен" $GREEN
        return 0
    else
        print_status "❌ $1 не найден" $RED
        return 1
    fi
}

# Проверка окружения
check_environment() {
    print_status "🔍 Проверка окружения..." $BLUE
    
    # Проверяем Node.js
    if ! check_command "node"; then
        print_status "Установите Node.js версии 18+" $RED
        exit 1
    fi
    
    # Проверяем версию Node.js
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_status "⚠️  Рекомендуется Node.js версии 16+" $YELLOW
    else
        print_status "✅ Node.js версия $NODE_VERSION подходит" $GREEN
    fi
    
    # Проверяем npm
    check_command "npm"
    
    # Проверяем MySQL
    if ! check_command "mysql"; then
        print_status "⚠️  MySQL клиент не найден, но это не критично" $YELLOW
    fi
    
    echo ""
}

# Проверка файлов проекта
check_project_files() {
    print_status "📁 Проверка файлов проекта..." $BLUE
    
    REQUIRED_FILES=(
        "server.js"
        "package.json"
        ".env"
        "public/index.html"
        "database/schema.sql"
        "init_database.js"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            print_status "✅ $file найден" $GREEN
        else
            print_status "❌ $file отсутствует" $RED
            exit 1
        fi
    done
    
    echo ""
}

# Установка зависимостей
install_dependencies() {
    print_status "📦 Проверка зависимостей..." $BLUE
    
    if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
        print_status "📥 Установка зависимостей..." $YELLOW
        npm install
        if [ $? -eq 0 ]; then
            print_status "✅ Зависимости установлены" $GREEN
        else
            print_status "❌ Ошибка установки зависимостей" $RED
            exit 1
        fi
    else
        print_status "✅ Зависимости уже установлены" $GREEN
    fi
    
    echo ""
}

# Создание директорий
create_directories() {
    print_status "📂 Создание необходимых директорий..." $BLUE
    
    DIRECTORIES=("uploads" "logs" "exports")
    
    for dir in "${DIRECTORIES[@]}"; do
        mkdir -p "$dir"
        chmod 755 "$dir"
        print_status "✅ Директория $dir готова" $GREEN
    done
    
    # Права доступа для public
    chmod -R 755 public/
    print_status "✅ Права доступа настроены" $GREEN
    
    echo ""
}

# Проверка MySQL подключения
check_mysql() {
    print_status "🗄️  Проверка MySQL..." $BLUE
    
    # Загружаем переменные окружения
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi
    
    # Проверяем статус MySQL
    if systemctl is-active --quiet mysql 2>/dev/null; then
        print_status "✅ MySQL запущен" $GREEN
    else
        print_status "⚠️  MySQL не запущен, попытка запуска..." $YELLOW
        sudo systemctl start mysql 2>/dev/null || print_status "❌ Не удалось запустить MySQL" $RED
    fi
    
    echo ""
}

# Инициализация базы данных
initialize_database() {
    print_status "🏗️  Инициализация базы данных..." $BLUE
    
    node init_database.js
    
    if [ $? -eq 0 ]; then
        print_status "✅ База данных инициализирована" $GREEN
    else
        print_status "❌ Ошибка инициализации базы данных" $RED
        echo ""
        print_status "💡 Попробуйте:" $YELLOW
        print_status "   1. Проверить настройки MySQL" $YELLOW
        print_status "   2. Проверить .env файл" $YELLOW
        print_status "   3. Запустить: mysql -u root -p < create_database.sql" $YELLOW
        exit 1
    fi
    
    echo ""
}

# Освобождение порта
free_port() {
    PORT=${1:-3001}
    
    print_status "🔌 Проверка порта $PORT..." $BLUE
    
    # Проверяем занят ли порт
    if lsof -i :$PORT &>/dev/null; then
        print_status "⚠️  Порт $PORT занят, освобождаем..." $YELLOW
        
        # Убиваем процессы на порту
        PID=$(lsof -t -i :$PORT 2>/dev/null)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null
            sleep 2
        fi
        
        # Убиваем все Node.js процессы для гарантии
        pkill -f node 2>/dev/null
        sleep 2
        
        if lsof -i :$PORT &>/dev/null; then
            print_status "❌ Не удалось освободить порт $PORT" $RED
            exit 1
        else
            print_status "✅ Порт $PORT освобожден" $GREEN
        fi
    else
        print_status "✅ Порт $PORT свободен" $GREEN
    fi
    
    echo ""
}

# Настройка файрвола
setup_firewall() {
    print_status "🔥 Настройка файрвола..." $BLUE
    
    # Загружаем PORT из .env
    if [ -f .env ]; then
        PORT=$(grep "^PORT=" .env | cut -d'=' -f2)
    fi
    PORT=${PORT:-3001}
    
    # Открываем порт в ufw
    sudo ufw allow $PORT &>/dev/null && print_status "✅ Порт $PORT открыт в файрволе" $GREEN || print_status "⚠️  Файрвол не настроен (возможно не установлен)" $YELLOW
    
    echo ""
}

# Запуск сервера
start_server() {
    print_status "🚀 Запуск сервера..." $BLUE
    
    # Загружаем PORT из .env
    if [ -f .env ]; then
        PORT=$(grep "^PORT=" .env | cut -d'=' -f2)
    fi
    PORT=${PORT:-3001}
    
    print_status "🌐 Сервер будет доступен по адресу: http://79.174.85.87:$PORT" $GREEN
    print_status "🔧 Для остановки нажмите Ctrl+C" $YELLOW
    print_status "📊 Логи записываются в logs/combined.log" $BLUE
    
    echo ""
    print_status "Starting server..." $GREEN
    echo "================================"
    
    # Запускаем сервер
    node server.js
}

# Основная функция
main() {
    # Проверяем что мы в правильной директории
    if [ ! -f "server.js" ]; then
        print_status "❌ Запустите скрипт из корневой директории проекта" $RED
        exit 1
    fi
    
    # Выполняем все проверки
    check_environment
    check_project_files
    install_dependencies
    create_directories
    check_mysql
    initialize_database
    free_port
    setup_firewall
    
    # Запускаем сервер
    start_server
}

# Обработка сигналов
trap 'print_status "\n🛑 Сервер остановлен" $YELLOW; exit 0' INT TERM

# Запускаем основную функцию
main "$@"