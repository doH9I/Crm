#!/bin/bash

echo "🚀 Construction CRM - HTTP Server Startup"
echo "=========================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${2}${1}${NC}"
}

# Остановка всех Node.js процессов
print_status "🛑 Остановка существующих процессов..." $YELLOW
pkill -f node 2>/dev/null
sleep 2

# Освобождение порта
PORT=8080
if lsof -i :$PORT &>/dev/null; then
    print_status "🔌 Освобождение порта $PORT..." $YELLOW
    kill -9 $(lsof -t -i :$PORT 2>/dev/null) 2>/dev/null
    sleep 2
fi

# Создание директорий
print_status "📂 Создание директорий..." $BLUE
mkdir -p uploads logs exports
chmod -R 755 public/ uploads/ logs/ exports/

# Проверка файлов
if [ ! -f "server_http.js" ]; then
    print_status "❌ Файл server_http.js не найден!" $RED
    print_status "💡 Скопируйте server_http.js из исправленных файлов" $YELLOW
    exit 1
fi

if [ ! -f ".env" ]; then
    print_status "❌ Файл .env не найден!" $RED
    exit 1
fi

# Инициализация базы данных
if [ -f "init_database.js" ]; then
    print_status "🗄️  Инициализация базы данных..." $BLUE
    node init_database.js
    if [ $? -eq 0 ]; then
        print_status "✅ База данных готова" $GREEN
    else
        print_status "⚠️  Проблемы с базой данных, но продолжаем..." $YELLOW
    fi
fi

# Открытие порта в файрволе
print_status "🔥 Настройка файрвола..." $BLUE
sudo ufw allow $PORT &>/dev/null || print_status "⚠️  Файрвол не настроен" $YELLOW

# Запуск HTTP сервера
print_status "🚀 Запуск HTTP сервера без проблемных заголовков..." $GREEN
print_status "🌐 Сервер будет доступен: http://79.174.85.87:$PORT" $GREEN
print_status "🔧 Для остановки: Ctrl+C" $YELLOW

echo ""
print_status "Starting HTTP server..." $GREEN
echo "================================"

# Запускаем упрощенную версию сервера
node server_http.js