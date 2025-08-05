#!/bin/bash

echo "=== Construction CRM Server Startup Script ==="
echo "Начинаю запуск CRM системы..."

# Проверяем, что мы в правильной директории
if [ ! -f "server.js" ]; then
    echo "ОШИБКА: Файл server.js не найден!"
    echo "Убедитесь, что вы находитесь в директории проекта."
    exit 1
fi

# Создаем необходимые директории
echo "Создаю необходимые директории..."
mkdir -p uploads logs exports public

# Проверяем установку Node.js
if ! command -v node &> /dev/null; then
    echo "ОШИБКА: Node.js не установлен!"
    echo "Установите Node.js версии 18 или выше."
    exit 1
fi

# Проверяем версию Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ПРЕДУПРЕЖДЕНИЕ: Рекомендуется Node.js версии 18 или выше."
fi

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "Устанавливаю зависимости..."
    npm install
fi

# Проверяем права доступа
echo "Проверяю права доступа..."
chmod -R 755 public/
chmod -R 777 uploads/ logs/ exports/

# Запускаем сервер
echo "Запускаю сервер на порту 3000..."
echo "Сайт будет доступен по адресу: http://79.174.85.87:3000"
echo "Для остановки нажмите Ctrl+C"
echo "================================"

# Запуск с логированием
NODE_ENV=production node server.js 2>&1 | tee logs/server.log