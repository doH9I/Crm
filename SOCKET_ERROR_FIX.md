# 🔧 Исправление ошибки сокета MySQL

## ❌ Ошибка
```
ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock' (2)
```

## 🚀 БЫСТРОЕ РЕШЕНИЕ

### Выполните в PuTTY:
```bash
sudo bash quick-mysql-fix.sh
```

Этот скрипт автоматически:
- ✅ Остановит MySQL
- ✅ Создаст необходимые директории
- ✅ Установит правильные права доступа
- ✅ Создаст файл сокета
- ✅ Инициализирует базу данных
- ✅ Запустит MySQL

## 🔍 Если простое решение не помогло

### Полная диагностика:
```bash
sudo bash mysql-diagnose.sh
```

## 📋 Пошаговое ручное исправление

### 1. Остановите MySQL
```bash
sudo systemctl stop mysql
sudo pkill mysqld
```

### 2. Создайте директории
```bash
sudo mkdir -p /var/run/mysqld
sudo mkdir -p /var/lib/mysql
sudo mkdir -p /var/log/mysql
```

### 3. Установите права доступа
```bash
sudo chown mysql:mysql /var/run/mysqld
sudo chown mysql:mysql /var/lib/mysql
sudo chown mysql:mysql /var/log/mysql

sudo chmod 755 /var/run/mysqld
sudo chmod 700 /var/lib/mysql
sudo chmod 750 /var/log/mysql
```

### 4. Создайте файл сокета
```bash
sudo touch /var/run/mysqld/mysqld.sock
sudo chown mysql:mysql /var/run/mysqld/mysqld.sock
sudo chmod 660 /var/run/mysqld/mysqld.sock
```

### 5. Инициализируйте базу данных (если нужно)
```bash
sudo mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql
```

### 6. Запустите MySQL
```bash
sudo systemctl enable mysql
sudo systemctl start mysql
```

### 7. Проверьте статус
```bash
sudo systemctl status mysql
```

## ✅ После исправления

### Продолжите настройку:
```bash
# Настройка паролей и создание БД
sudo bash fix-mysql.sh

# Или полное развертывание
sudo bash deploy.sh
```

## 🔍 Проверка работы

```bash
# Проверка статуса
sudo systemctl status mysql

# Проверка подключения
mysql -u root -e "SELECT 1;"

# Проверка сокета
ls -la /var/run/mysqld/mysqld.sock
```

## 🆘 Если ничего не помогает

### Полная переустановка MySQL:
```bash
# Остановка
sudo systemctl stop mysql

# Удаление
sudo apt-get remove --purge mysql-server mysql-client mysql-common -y
sudo rm -rf /var/lib/mysql
sudo rm -rf /var/log/mysql
sudo rm -rf /etc/mysql

# Установка заново
sudo apt-get update
sudo apt-get install mysql-server -y

# Запуск
sudo systemctl start mysql
sudo systemctl enable mysql
```

## 📞 Причины проблемы

1. **Неправильные права доступа** - самая частая причина
2. **Отсутствие директории сокета** `/var/run/mysqld/`
3. **Неинициализированная база данных**
4. **Повреждение файлов MySQL**
5. **Недостаток места на диске**

## 🎯 После исправления

MySQL должен запуститься и вы сможете продолжить развертывание CRM системы.

**Данные для доступа к системе:**
- Web интерфейс: http://79.174.85.87
- Логин: admin
- Пароль: admin123