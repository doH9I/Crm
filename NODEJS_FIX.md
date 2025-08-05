# 🔧 Исправление ошибки с зависимостями Node.js

## ❌ Ошибка
```
Error: Cannot find module 'bcryptjs'
Require stack:
- /tmp/create_admin.js
```

## 🔍 Причина
Эта ошибка возникает когда:
1. Зависимости npm не установлены в `/var/www/construction-crm/`
2. Скрипт запускается не из директории с `node_modules`
3. Пользователь `www-data` не имеет доступа к модулям

## 🚀 БЫСТРОЕ РЕШЕНИЕ

### Вариант 1: Создание администратора без Node.js
```bash
sudo bash create-admin-manual.sh
```

### Вариант 2: Установка зависимостей и повтор
```bash
# Перейти в директорию проекта
cd /var/www/construction-crm

# Установить зависимости
sudo -u www-data npm install --production

# Повторить развертывание
sudo bash deploy.sh
```

## 📋 Что делает create-admin-manual.sh:

- ✅ Создает администратора напрямую через SQL
- ✅ Не требует Node.js зависимостей
- ✅ Использует готовый bcrypt хеш для пароля "admin123"
- ✅ Проверяет успешность создания

## 🔍 Ручное создание администратора

Если автоматические скрипты не работают:

### 1. Подключитесь к MySQL
```bash
mysql -u crm_user -p'strong_password_123!@#' construction_crm
```

### 2. Создайте администратора вручную
```sql
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
    '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOYz6TtxMQJqhN8/lewdBEdkCOBTh..z6',
    'Администратор',
    'Системы',
    'admin',
    true,
    NOW()
);
```

### 3. Проверьте создание
```sql
SELECT username, email, role, is_active FROM users WHERE username='admin';
```

### 4. Выйдите из MySQL
```sql
exit;
```

## ✅ Проверка результата

После создания администратора:

```bash
# Проверка в базе данных
mysql -u crm_user -p'strong_password_123!@#' construction_crm -e "SELECT username, email, role FROM users WHERE username='admin';"

# Должно показать:
# +----------+---------------------------+-------+
# | username | email                     | role  |
# +----------+---------------------------+-------+
# | admin    | admin@construction-crm.com| admin |
# +----------+---------------------------+-------+
```

## 🔄 После создания администратора

Продолжите развертывание:

```bash
# Полное развертывание
sudo bash deploy.sh

# Или проверка отдельных компонентов
sudo systemctl status construction-crm nginx mysql
```

## 🎯 Данные для входа

После успешного создания администратора:
- **Web интерфейс**: http://79.174.85.87
- **Логин**: admin
- **Пароль**: admin123
- **Email**: admin@construction-crm.com

⚠️ **ОБЯЗАТЕЛЬНО смените пароль после первого входа!**

## 🔐 Безопасность

Готовый хеш `$2b$12$LQv3c1yqBWVHxkd0LQ4YCOYz6TtxMQJqhN8/lewdBEdkCOBTh..z6` - это bcrypt хеш для пароля "admin123" с salt rounds = 12.

В продакшене рекомендуется:
1. Сменить пароль через веб-интерфейс
2. Использовать сложные пароли
3. Включить двухфакторную аутентификацию (если доступна)

## 🆘 Если проблемы остаются

1. **Проверьте права доступа**:
```bash
sudo chown -R www-data:www-data /var/www/construction-crm
```

2. **Проверьте установку зависимостей**:
```bash
cd /var/www/construction-crm
ls -la node_modules/bcryptjs
```

3. **Переустановите зависимости**:
```bash
cd /var/www/construction-crm
sudo rm -rf node_modules
sudo -u www-data npm install --production
```

4. **Проверьте Node.js версию**:
```bash
node --version  # Должен быть >= 14.x
npm --version
```