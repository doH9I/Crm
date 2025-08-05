#!/bin/bash

echo "=== Диагностика CSS и JS ресурсов ==="
echo "Проверяем почему не загружаются статические файлы..."

# Функция для проверки файлов
check_files() {
    echo "1. Проверяем наличие CSS файлов:"
    ls -la public/css/
    
    echo ""
    echo "2. Проверяем наличие JS файлов:"
    ls -la public/js/
    
    echo ""
    echo "3. Проверяем права доступа к public:"
    ls -la public/
    
    echo ""
    echo "4. Проверяем размеры файлов:"
    du -h public/css/*
    du -h public/js/*
}

# Функция для тестирования доступности файлов
test_file_access() {
    echo ""
    echo "5. Тестируем доступность файлов через curl:"
    
    # Определяем порт сервера
    PORT=$(netstat -tulpn | grep node | grep LISTEN | head -1 | awk '{print $4}' | cut -d: -f2)
    if [ -z "$PORT" ]; then
        PORT=3000
    fi
    
    echo "Используем порт: $PORT"
    
    echo ""
    echo "Тестируем CSS файлы:"
    curl -I http://localhost:$PORT/css/styles.css
    echo ""
    curl -I http://localhost:$PORT/css/dashboard.css
    
    echo ""
    echo "Тестируем JS файлы:"
    curl -I http://localhost:$PORT/js/app.js
    echo ""
    curl -I http://localhost:$PORT/js/auth.js
    
    echo ""
    echo "Тестируем главную страницу:"
    curl -I http://localhost:$PORT/
}

# Функция для исправления прав доступа
fix_permissions() {
    echo ""
    echo "6. Исправляем права доступа:"
    
    # Устанавливаем правильные права
    chmod -R 755 public/
    chmod 644 public/css/*
    chmod 644 public/js/*
    chmod 644 public/*.html
    
    echo "Права доступа обновлены"
    
    # Проверяем результат
    echo "Новые права:"
    ls -la public/css/ | head -5
    ls -la public/js/ | head -5
}

# Функция для проверки Content-Type
check_content_types() {
    echo ""
    echo "7. Проверяем Content-Type заголовки:"
    
    PORT=$(netstat -tulpn | grep node | grep LISTEN | head -1 | awk '{print $4}' | cut -d: -f2)
    if [ -z "$PORT" ]; then
        PORT=3000
    fi
    
    echo "CSS файл:"
    curl -s -I http://localhost:$PORT/css/styles.css | grep -i content-type
    
    echo "JS файл:"
    curl -s -I http://localhost:$PORT/js/app.js | grep -i content-type
    
    echo "HTML файл:"
    curl -s -I http://localhost:$PORT/ | grep -i content-type
}

# Основная функция
main() {
    check_files
    test_file_access
    fix_permissions
    check_content_types
    
    echo ""
    echo "=== РЕКОМЕНДАЦИИ ==="
    echo ""
    echo "Если файлы не доступны:"
    echo "1. Перезапустите сервер:"
    echo "   pkill -f node && sleep 2 && node server.js"
    echo ""
    echo "2. Проверьте в браузере Network tab (F12):"
    echo "   - Откройте http://79.174.85.87:$PORT"
    echo "   - Нажмите F12 -> Network"
    echo "   - Обновите страницу"
    echo "   - Проверьте какие файлы возвращают 404 или 500"
    echo ""
    echo "3. Проверьте консоль браузера на ошибки JavaScript"
    echo ""
    echo "4. Тестовая страница: http://79.174.85.87:$PORT/test.html"
}

# Запускаем диагностику
main