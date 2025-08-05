#!/bin/bash

echo "🌐 Setup Nginx + Node.js API для Construction CRM"
echo "================================================="

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${2}${1}${NC}"
}

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    print_status "❌ Запустите скрипт с правами root: sudo ./setup_nginx.sh" $RED
    exit 1
fi

# Остановка существующих процессов
print_status "🛑 Остановка существующих процессов..." $YELLOW
pkill -f node 2>/dev/null
systemctl stop nginx 2>/dev/null

# Установка Nginx если не установлен
if ! command -v nginx &> /dev/null; then
    print_status "📦 Установка Nginx..." $BLUE
    apt update
    apt install -y nginx
    systemctl enable nginx
else
    print_status "✅ Nginx уже установлен" $GREEN
fi

# Создание backup старой конфигурации
if [ -f "/etc/nginx/sites-available/default" ]; then
    print_status "💾 Создание backup старой конфигурации..." $YELLOW
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)
fi

# Копирование новой конфигурации Nginx
print_status "⚙️  Настройка Nginx конфигурации..." $BLUE
if [ -f "nginx.conf" ]; then
    cp nginx.conf /etc/nginx/sites-available/crm
    
    # Удаление старого symlink и создание нового
    rm -f /etc/nginx/sites-enabled/default
    rm -f /etc/nginx/sites-enabled/crm
    ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/crm
    
    print_status "✅ Конфигурация Nginx обновлена" $GREEN
else
    print_status "❌ Файл nginx.conf не найден!" $RED
    exit 1
fi

# Проверка конфигурации Nginx
print_status "🔍 Проверка конфигурации Nginx..." $BLUE
if nginx -t; then
    print_status "✅ Конфигурация Nginx корректна" $GREEN
else
    print_status "❌ Ошибка в конфигурации Nginx!" $RED
    exit 1
fi

# Создание директорий и установка прав
print_status "📂 Настройка директорий..." $BLUE
mkdir -p /root/Crm/uploads /root/Crm/logs /root/Crm/exports
chown -R www-data:www-data /root/Crm/public
chmod -R 755 /root/Crm/public
chmod -R 777 /root/Crm/uploads /root/Crm/logs /root/Crm/exports

# Открытие портов в файрволе
print_status "🔥 Настройка файрвола..." $BLUE
ufw allow 'Nginx Full' 2>/dev/null
ufw allow 80 2>/dev/null
ufw allow 8080 2>/dev/null

# Инициализация базы данных
if [ -f "init_database.js" ]; then
    print_status "🗄️  Инициализация базы данных..." $BLUE
    cd /root/Crm
    node init_database.js
    if [ $? -eq 0 ]; then
        print_status "✅ База данных готова" $GREEN
    else
        print_status "⚠️  Предупреждения в базе данных (возможно уже настроена)" $YELLOW
    fi
fi

# Запуск API сервера в фоне
print_status "🚀 Запуск API сервера..." $BLUE
if [ -f "server_api_only.js" ]; then
    # Убиваем старые процессы
    pkill -f "node server_api_only.js" 2>/dev/null
    
    # Запускаем API в фоне
    nohup node server_api_only.js > logs/api.log 2>&1 &
    API_PID=$!
    
    # Проверяем что процесс запустился
    sleep 3
    if kill -0 $API_PID 2>/dev/null; then
        print_status "✅ API сервер запущен (PID: $API_PID)" $GREEN
        echo $API_PID > logs/api.pid
    else
        print_status "❌ Не удалось запустить API сервер" $RED
        exit 1
    fi
else
    print_status "❌ Файл server_api_only.js не найден!" $RED
    exit 1
fi

# Запуск Nginx
print_status "🌐 Запуск Nginx..." $BLUE
systemctl start nginx
systemctl reload nginx

if systemctl is-active --quiet nginx; then
    print_status "✅ Nginx запущен успешно" $GREEN
else
    print_status "❌ Не удалось запустить Nginx" $RED
    systemctl status nginx
    exit 1
fi

# Проверка статуса
print_status "\n📊 СТАТУС СИСТЕМЫ:" $BLUE
print_status "===========================" $BLUE

# Проверка Nginx
if systemctl is-active --quiet nginx; then
    print_status "✅ Nginx: Работает" $GREEN
else
    print_status "❌ Nginx: Не работает" $RED
fi

# Проверка API
if curl -s http://127.0.0.1:8080/api/health > /dev/null; then
    print_status "✅ API: Работает (порт 8080)" $GREEN
else
    print_status "❌ API: Не работает" $RED
fi

# Проверка портов
if netstat -tulpn | grep :80 | grep nginx > /dev/null; then
    print_status "✅ Nginx слушает порт 80" $GREEN
else
    print_status "❌ Nginx не слушает порт 80" $RED
fi

if netstat -tulpn | grep :8080 | grep node > /dev/null; then
    print_status "✅ API слушает порт 8080" $GREEN
else
    print_status "❌ API не слушает порт 8080" $RED
fi

print_status "\n🎉 НАСТРОЙКА ЗАВЕРШЕНА!" $GREEN
print_status "===========================" $GREEN
print_status "🌐 Веб-интерфейс: http://79.174.85.87" $GREEN
print_status "📊 API: http://79.174.85.87/api" $GREEN
print_status "🔐 Логин: admin / CaMBeJI30091994" $GREEN

print_status "\n📋 ПОЛЕЗНЫЕ КОМАНДЫ:" $BLUE
print_status "Перезапуск Nginx: systemctl restart nginx" $YELLOW
print_status "Логи Nginx: tail -f /var/log/nginx/crm_error.log" $YELLOW
print_status "Логи API: tail -f /root/Crm/logs/api.log" $YELLOW
print_status "Остановка API: kill \$(cat /root/Crm/logs/api.pid)" $YELLOW