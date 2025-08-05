#!/bin/bash

echo "=== Port 3000 Fix Script ==="
echo "Исправляем проблему занятого порта 3000..."

# Функция для поиска процессов на порту 3000
find_port_processes() {
    echo "1. Ищем процессы, использующие порт 3000..."
    
    # Используем несколько методов для поиска
    echo "--- Процессы на порту 3000 (netstat): ---"
    netstat -tulpn | grep :3000 || echo "Не найдено через netstat"
    
    echo ""
    echo "--- Процессы на порту 3000 (ss): ---"
    ss -tulpn | grep :3000 || echo "Не найдено через ss"
    
    echo ""
    echo "--- Процессы на порту 3000 (lsof): ---"
    lsof -i :3000 || echo "Не найдено через lsof"
    
    echo ""
    echo "--- Все процессы Node.js: ---"
    ps aux | grep node | grep -v grep || echo "Node.js процессы не найдены"
}

# Функция для остановки процессов
stop_processes() {
    echo ""
    echo "2. Останавливаем процессы..."
    
    # Останавливаем все процессы Node.js
    echo "Останавливаем все Node.js процессы..."
    pkill -f node
    sleep 2
    
    # Принудительно убиваем если остались
    echo "Принудительно останавливаем оставшиеся процессы..."
    pkill -9 -f node
    sleep 1
    
    # Останавливаем процессы на порту 3000
    echo "Освобождаем порт 3000..."
    PID=$(lsof -t -i :3000 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "Найден процесс на порту 3000: PID $PID"
        kill -9 $PID
        echo "Процесс остановлен"
    else
        echo "Процессы на порту 3000 не найдены"
    fi
}

# Функция для проверки освобождения порта
check_port_free() {
    echo ""
    echo "3. Проверяем освобождение порта..."
    sleep 2
    
    if netstat -tulpn | grep :3000 > /dev/null; then
        echo "❌ Порт 3000 все еще занят!"
        return 1
    else
        echo "✅ Порт 3000 свободен!"
        return 0
    fi
}

# Функция для альтернативного решения
alternative_port() {
    echo ""
    echo "=== АЛЬТЕРНАТИВНОЕ РЕШЕНИЕ ==="
    echo "Если порт 3000 не освобождается, можно использовать другой порт:"
    echo ""
    echo "1. Отредактируйте .env файл:"
    echo "   nano .env"
    echo "   Измените PORT=3000 на PORT=3001"
    echo ""
    echo "2. Или запустите с другим портом:"
    echo "   PORT=3001 node server.js"
    echo "   PORT=3002 node server.js"
    echo ""
    echo "3. Тогда сайт будет доступен по адресу:"
    echo "   http://79.174.85.87:3001"
}

# Основная функция
main() {
    echo "Начинаем диагностику и исправление..."
    
    # Находим процессы
    find_port_processes
    
    # Останавливаем процессы
    stop_processes
    
    # Проверяем результат
    if check_port_free; then
        echo ""
        echo "🎉 УСПЕХ! Порт 3000 освобожден."
        echo "Теперь можно запустить сервер:"
        echo "  ./start_server.sh"
        echo ""
        echo "Или запустить напрямую:"
        echo "  node server.js"
    else
        echo ""
        echo "⚠️  Порт все еще занят."
        alternative_port
    fi
    
    echo ""
    echo "=== ПОЛЕЗНЫЕ КОМАНДЫ ==="
    echo "Проверить порт 3000:"
    echo "  netstat -tulpn | grep :3000"
    echo "  lsof -i :3000"
    echo ""
    echo "Найти все Node.js процессы:"
    echo "  ps aux | grep node"
    echo ""
    echo "Остановить все Node.js процессы:"
    echo "  pkill -f node"
    echo ""
    echo "Запустить на другом порту:"
    echo "  PORT=3001 node server.js"
}

# Запускаем основную функцию
main