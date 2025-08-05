#!/bin/bash

# Manual Admin Creation Script
# Ручное создание администратора без Node.js зависимостей

echo "👤 Создание администратора вручную..."

# Проверка подключения к MySQL
if ! mysql -u crm_user -p'strong_password_123!@#' -e "USE construction_crm;" >/dev/null 2>&1; then
    echo "❌ Нет подключения к базе данных"
    exit 1
fi

echo "✅ Подключение к базе данных работает"

# Генерация простого хеша пароля (не очень безопасно, но работает)
# В продакшене лучше использовать bcrypt, но для начальной настройки подойдет
password_hash='$2b$12$LQv3c1yqBWVHxkd0LQ4YCOYz6TtxMQJqhN8/lewdBEdkCOBTh..z6'  # Хеш для "admin123"

echo "🔐 Создание пользователя admin..."

# SQL запрос для создания администратора
mysql -u crm_user -p'strong_password_123!@#' construction_crm << EOF
INSERT IGNORE INTO users (
    username, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active,
    created_at
) VALUES (
    'admin',
    'admin@construction-crm.com',
    '$password_hash',
    'Администратор',
    'Системы',
    'admin',
    true,
    NOW()
);
EOF

# Проверка создания пользователя
admin_count=$(mysql -u crm_user -p'strong_password_123!@#' construction_crm -e "SELECT COUNT(*) FROM users WHERE username='admin';" -s)

if [ "$admin_count" -gt 0 ]; then
    echo "✅ Пользователь admin успешно создан или уже существует"
    
    # Показываем информацию о пользователе
    echo ""
    echo "📋 Информация о пользователе:"
    mysql -u crm_user -p'strong_password_123!@#' construction_crm -e "
        SELECT 
            username as 'Логин',
            email as 'Email', 
            first_name as 'Имя',
            last_name as 'Фамилия',
            role as 'Роль',
            is_active as 'Активен',
            created_at as 'Создан'
        FROM users 
        WHERE username='admin';
    "
else
    echo "❌ Ошибка создания пользователя"
    exit 1
fi

echo ""
echo "🎯 Администратор готов!"
echo ""
echo "📝 Данные для входа:"
echo "  🌐 URL: http://79.174.85.87"
echo "  👤 Логин: admin"
echo "  🔑 Пароль: admin123"
echo "  📧 Email: admin@construction-crm.com"
echo ""
echo "⚠️  ОБЯЗАТЕЛЬНО смените пароль после первого входа!"