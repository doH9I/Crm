# Инструкция по настройке CRM системы

## 1. Настройка базы данных MySQL

### Подключение к MySQL как root:
```bash
mysql -u root -p
```

### Создание базы данных и пользователя:
```sql
-- Удаляем существующего пользователя (если есть)
DROP USER IF EXISTS 'crm_user'@'localhost';

-- Создаём базу данных
CREATE DATABASE IF NOT EXISTS construction_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создаём пользователя
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'ВАШ_ПАРОЛЬ_ДЛЯ_БАЗЫ_ДАННЫХ';

-- Даём права на базу данных
GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'localhost';

-- Применяем изменения
FLUSH PRIVILEGES;

-- Проверяем
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'crm_user';

-- Выходим
EXIT;
```

### Проверка подключения:
```bash
mysql -u crm_user -p construction_crm
```

## 2. Настройка файла .env

Замените в файле `.env` следующие значения:

- `ВАШ_ПАРОЛЬ_ДЛЯ_БАЗЫ_ДАННЫХ` - пароль, который вы указали при создании пользователя MySQL
- `ВАШ_СЕКРЕТНЫЙ_КЛЮЧ_ДЛЯ_JWT_ТОКЕНОВ` - любой сложный пароль для JWT токенов
- `https://yourdomain.com` - ваш домен (если есть)

## 3. Установка зависимостей

```bash
npm install
```

## 4. Запуск сервера

```bash
# Обычный запуск
node server.js

# Или через PM2 (рекомендуется для продакшена)
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

## 5. Проверка работы

Откройте в браузере:
```
http://ВАШ_IP_АДРЕС:3000
```

## 6. Возможные проблемы

### Если MySQL не запущен:
```bash
systemctl start mysql
systemctl enable mysql
```

### Если порт 3000 занят:
Измените PORT в файле .env на другой (например, 3001)

### Если проблемы с правами доступа:
```bash
chmod 755 /root/ВАШ_ПРОЕКТ
chmod 644 /root/ВАШ_ПРОЕКТ/.env
```

## 7. Структура базы данных

Если у вас есть файл с SQL-структурой, импортируйте его:
```bash
mysql -u crm_user -p construction_crm < database/ВАШ_ФАЙЛ.sql
```