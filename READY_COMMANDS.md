# 🚀 ГОТОВЫЕ КОМАНДЫ ДЛЯ КОПИРОВАНИЯ

## 📋 Ваши данные:
- **IP сервера:** 79.174.85.87
- **Пароль БД:** CaMBeJI30091994
- **JWT секрет:** samvelik30091994

---

## 🔧 Команды для выполнения на сервере:

### 1. Подключение к серверу
```bash
ssh root@79.174.85.87
```

### 2. Установка необходимого ПО
```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs mysql-server git
systemctl start mysql
systemctl enable mysql
```

### 3. Клонирование проекта
```bash
cd /root
git clone https://github.com/ВАШ_ПОЛЬЗОВАТЕЛЬ/construction-crm.git
cd construction-crm
```

### 4. Настройка базы данных
```bash
./setup_database.sh
```

### 5. Установка зависимостей
```bash
npm install
```

### 6. Запуск сервера через PM2
```bash
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

### 7. Проверка работы
Откройте в браузере: **http://79.174.85.87:3000**

---

## 🔍 Команды для проверки:

### Проверка статуса сервера:
```bash
pm2 status
pm2 logs
```

### Проверка базы данных:
```bash
systemctl status mysql
mysql -u crm_user -p construction_crm
# Пароль: CaMBeJI30091994
```

### Проверка портов:
```bash
netstat -tlnp | grep :3000
```

---

## 🎯 Результат:
После выполнения всех команд ваш сайт будет доступен по адресу:
**http://79.174.85.87:3000**

---

## 📞 Если нужна помощь:
1. Проверьте логи: `pm2 logs`
2. Убедитесь, что MySQL запущен: `systemctl status mysql`
3. Проверьте, что порт 3000 слушается: `netstat -tlnp | grep :3000`

**Все готово! Просто копируйте и выполняйте команды по порядку!** 🚀