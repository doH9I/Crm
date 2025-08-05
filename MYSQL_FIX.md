# 🔧 Исправление проблемы с MySQL

## Проблема
```
ERROR 1045 (28000): Access denied for user 'crm_user'@'localhost' (using password: YES)
```

## 🚀 Быстрое решение

### Вариант 1: Использовать скрипт исправления
```bash
# Запустите скрипт исправления MySQL
sudo bash fix-mysql.sh
```

### Вариант 2: Ручное исправление

#### 1. Остановите MySQL
```bash
sudo systemctl stop mysql
```

#### 2. Запустите MySQL в безопасном режиме
```bash
sudo mysqld_safe --skip-grant-tables --skip-networking &
```

#### 3. Подключитесь и сбросьте пароль root
```bash
mysql -u root
```

В MySQL консоли:
```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root_password_123!@#';
FLUSH PRIVILEGES;
exit;
```

#### 4. Остановите безопасный режим и запустите MySQL
```bash
sudo pkill mysqld_safe
sudo pkill mysqld
sudo systemctl start mysql
```

#### 5. Создайте пользователя и базу данных
```bash
mysql -u root -p'root_password_123!@#'
```

В MySQL консоли:
```sql
DROP DATABASE IF EXISTS construction_crm;
DROP USER IF EXISTS 'crm_user'@'localhost';
CREATE DATABASE construction_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'strong_password_123!@#';
GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
exit;
```

#### 6. Протестируйте подключение
```bash
mysql -u crm_user -p'strong_password_123!@#' -e "USE construction_crm; SELECT 1;"
```

#### 7. Импортируйте схему базы данных
```bash
mysql -u crm_user -p'strong_password_123!@#' construction_crm < /var/www/construction-crm/database/schema.sql
```

## 🔄 После исправления MySQL

### Продолжите развертывание
```bash
# Перейдите к остальным шагам развертывания
sudo systemctl restart construction-crm
sudo systemctl status construction-crm
```

### Или запустите полное развертывание заново
```bash
sudo bash deploy.sh
```

## ✅ Проверка работы

1. **Проверьте подключение к БД:**
```bash
mysql -u crm_user -p'strong_password_123!@#' construction_crm
```

2. **Проверьте таблицы:**
```sql
SHOW TABLES;
```

3. **Проверьте пользователя admin:**
```sql
SELECT username, email, role FROM users WHERE username = 'admin';
```

## 🎯 Данные для входа в систему

После исправления MySQL:
- **Web интерфейс**: http://79.174.85.87
- **Логин**: admin  
- **Пароль**: admin123

⚠️ **ОБЯЗАТЕЛЬНО смените пароль после первого входа!**

## 📞 Если проблема повторяется

1. Проверьте логи MySQL:
```bash
sudo tail -f /var/log/mysql/error.log
```

2. Проверьте статус MySQL:
```bash
sudo systemctl status mysql
```

3. Попробуйте перезапустить MySQL:
```bash
sudo systemctl restart mysql
```

## 🔐 Пароли для справки

- **Root MySQL**: root_password_123!@#
- **CRM пользователь БД**: strong_password_123!@#  
- **Администратор системы**: admin123