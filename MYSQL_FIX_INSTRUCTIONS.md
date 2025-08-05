# Исправление проблемы подключения к MySQL

## Проблема:
```
error: Database connection failed: connect ECONNREFUSED ::1:3306
```

Это означает, что сервер не может подключиться к базе данных MySQL.

## Решение пошагово:

### Шаг 1: Проверьте статус MySQL
```bash
systemctl status mysql
```

Если MySQL не запущен:
```bash
systemctl start mysql
systemctl enable mysql
```

### Шаг 2: Проверьте, установлен ли MySQL
```bash
mysql --version
```

Если не установлен:
```bash
apt update
apt install -y mysql-server mysql-client
```

### Шаг 3: Запустите диагностический скрипт
```bash
./setup_mysql.sh
```

### Шаг 4: Создайте базу данных и пользователя

**Вариант А - через MySQL консоль:**
```bash
mysql -u root -p
```

Затем выполните в MySQL:
```sql
source create_database.sql
```

**Вариант Б - напрямую из командной строки:**
```bash
mysql -u root -p < create_database.sql
```

**Вариант В - команды по одной:**
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS construction_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'crm_user'@'localhost' IDENTIFIED BY 'CaMBeJI30091994';"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'crm_user'@'127.0.0.1' IDENTIFIED BY 'CaMBeJI30091994';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'localhost';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON construction_crm.* TO 'crm_user'@'127.0.0.1';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

### Шаг 5: Проверьте подключение
```bash
mysql -u crm_user -p -h 127.0.0.1 construction_crm
```
Введите пароль: `CaMBeJI30091994`

### Шаг 6: Проверьте настройки файрвола
```bash
ufw allow 3306
```

### Шаг 7: Запустите сервер снова
```bash
./start_server.sh
```

## Дополнительная диагностика:

### Проверить процессы MySQL:
```bash
ps aux | grep mysql
```

### Проверить порты:
```bash
netstat -tulpn | grep :3306
ss -tulpn | grep :3306
```

### Проверить логи MySQL:
```bash
tail -f /var/log/mysql/error.log
journalctl -u mysql -f
```

### Проверить пользователей в MySQL:
```bash
mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User='crm_user';"
```

### Проверить базы данных:
```bash
mysql -u root -p -e "SHOW DATABASES;"
```

## Возможные дополнительные проблемы:

### 1. MySQL настроен только для IPv6
Отредактируйте `/etc/mysql/mysql.conf.d/mysqld.cnf`:
```bash
nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Найдите и измените:
```
bind-address = 127.0.0.1
```

Перезапустите MySQL:
```bash
systemctl restart mysql
```

### 2. Права доступа к сокету MySQL
```bash
ls -la /var/run/mysqld/
chmod 755 /var/run/mysqld/
chown mysql:mysql /var/run/mysqld/mysqld.sock
```

### 3. Проверка конфигурации MySQL
```bash
mysql --help | grep "Default options"
```

## Тест подключения из Node.js:

Создайте тестовый файл:
```javascript
// test_db.js
const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'crm_user',
            password: 'CaMBeJI30091994',
            database: 'construction_crm'
        });
        console.log('✓ Подключение к базе данных успешно!');
        await connection.end();
    } catch (error) {
        console.error('✗ Ошибка подключения:', error.message);
    }
}

testConnection();
```

Запустите тест:
```bash
node test_db.js
```

## Если ничего не помогает:

1. **Полная переустановка MySQL:**
```bash
apt remove --purge mysql-server mysql-client mysql-common
apt autoremove
apt autoclean
rm -rf /etc/mysql /var/lib/mysql
apt update
apt install mysql-server mysql-client
```

2. **Проверьте системные логи:**
```bash
journalctl -xe | grep mysql
dmesg | grep mysql
```

После выполнения этих шагов ваш сервер должен успешно подключиться к базе данных MySQL.