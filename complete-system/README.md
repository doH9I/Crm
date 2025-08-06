# Construction CRM - Полнофункциональная система управления строительной компанией

## 🔐 ВАЖНО: Пароли и доступы

### Пароли базы данных
- **MySQL Root пароль**: `ConstructionCRM2024Root!`
- **Пользователь БД**: `construction_admin`
- **Пароль БД**: `CRM_Admin_2024#Secure`
- **База данных**: `construction_crm`

### Пароли системы
- **Администратор системы**:
  - Логин: `admin`
  - Пароль: `admin123`
  - Email: `admin@construction-crm.local`

### JWT и безопасность
- **JWT Secret**: `ConstructionCRM2024_JWT_Secret_Key_Very_Secure_Random_String_12345`
- **Время жизни токена**: 24 часа

## 🚀 Быстрая установка

### 1. Установка зависимостей
```bash
cd /root/construction-crm
npm install
```

### 2. Настройка MySQL
```bash
# Запуск скрипта настройки MySQL
chmod +x setup-mysql.sh
sudo ./setup-mysql.sh
```

### 3. Создание .env файла
```bash
cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=construction_admin
DB_PASSWORD=CRM_Admin_2024#Secure
DB_NAME=construction_crm

# JWT Configuration
JWT_SECRET=ConstructionCRM2024_JWT_Secret_Key_Very_Secure_Random_String_12345
JWT_EXPIRE=24h

# Server Configuration
PORT=3000
NODE_ENV=production

# Security
CORS_ORIGIN=http://79.174.85.87:3000,http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_REQUESTS=100

# File Upload
MAX_FILE_SIZE=52428800

# Company Information
COMPANY_NAME=ООО "СтройМонтаж"
COMPANY_ADDRESS=г. Москва, ул. Строительная, д. 1
COMPANY_PHONE=+7 (495) 123-45-67
COMPANY_EMAIL=info@construction-crm.local
EOF
```

### 4. Запуск сервера
```bash
node server.js
```

## 📋 Структура проекта

```
construction-crm/
├── server.js                 # Основной сервер с полным API
├── setup-mysql.sh           # Скрипт настройки MySQL
├── .env                     # Переменные окружения
├── package.json             # Зависимости Node.js
├── database/
│   └── schema.sql           # Схема базы данных
├── public/
│   ├── index.html           # Главная страница
│   ├── css/
│   │   └── style.css        # Основные стили
│   └── js/
│       ├── app.js           # Главное приложение
│       ├── auth.js          # Модуль авторизации (исправлен)
│       ├── api.js           # API клиент
│       ├── utils.js         # Утилиты
│       ├── dashboard.js     # Дашборд
│       ├── clients.js       # Клиенты
│       ├── projects.js      # Проекты
│       ├── estimates.js     # Сметы (полный функционал)
│       ├── materials.js     # Материалы (полный функционал)
│       └── offers.js        # Коммерческие предложения (полный функционал)
├── uploads/                 # Загруженные файлы
├── logs/                    # Логи системы
└── exports/                 # Экспортированные данные
```

## ✨ Реализованный функционал

### 🔐 Авторизация и безопасность
- ✅ JWT аутентификация
- ✅ Роли и права доступа
- ✅ Сессии и автологин
- ✅ Защищенные маршруты
- ✅ Логирование действий

### 👥 Управление клиентами
- ✅ CRUD операции с клиентами
- ✅ Поиск и фильтрация
- ✅ Карточки клиентов
- ✅ История взаимодействий

### 🏗️ Управление проектами
- ✅ Создание и управление проектами
- ✅ Статусы проектов
- ✅ Назначение менеджеров
- ✅ Отслеживание прогресса

### 📊 Дашборд
- ✅ Статистика проектов
- ✅ Финансовые показатели
- ✅ Последние активности
- ✅ Уведомления

### 🧮 Сметы (Полный функционал)
- ✅ Создание смет
- ✅ Типы смет (предварительная, детальная, итоговая)
- ✅ Статусы смет
- ✅ Привязка к проектам
- ✅ Расчет наценок и накладных расходов

### 🧱 Материалы (Полный функционал)
- ✅ Каталог материалов
- ✅ Категории и характеристики
- ✅ Поставщики и цены
- ✅ Остатки на складе
- ✅ Режимы просмотра (сетка/список)

### 📄 Коммерческие предложения (Полный функционал)
- ✅ Создание предложений
- ✅ Шаблоны предложений
- ✅ Статусы и отслеживание
- ✅ Условия оплаты и гарантии
- ✅ Дублирование предложений

### 👷 Подрядчики
- ✅ База подрядчиков
- ✅ Специализации
- ✅ Рейтинги

### 👨‍💼 Сотрудники
- ✅ Управление персоналом
- ✅ Должности и роли
- ✅ Статусы сотрудников

### 📦 Склад
- ✅ Складские операции
- ✅ Приход и расход материалов
- ✅ Инвентаризация

## 🛠️ API Endpoints

### Авторизация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы
- `GET /api/users/profile` - Профиль пользователя

### Клиенты
- `GET /api/clients` - Список клиентов
- `POST /api/clients` - Создание клиента
- `GET /api/clients/:id` - Клиент по ID
- `PUT /api/clients/:id` - Обновление клиента
- `DELETE /api/clients/:id` - Удаление клиента

### Проекты
- `GET /api/projects` - Список проектов
- `POST /api/projects` - Создание проекта
- `GET /api/projects/:id` - Проект по ID
- `PUT /api/projects/:id` - Обновление проекта

### Подрядчики
- `GET /api/contractors` - Список подрядчиков
- `POST /api/contractors` - Создание подрядчика

### Сотрудники
- `GET /api/employees` - Список сотрудников

### Склад
- `GET /api/warehouse/items` - Складские позиции

### Дашборд
- `GET /api/dashboard` - Данные дашборда

## 🔧 Настройки сервера

### Порты и доступы
- **Веб-интерфейс**: http://79.174.85.87:3000
- **API**: http://79.174.85.87:3000/api
- **MySQL**: localhost:3306

### Безопасность
- Rate limiting: 100 запросов в 15 минут
- CORS настроен для домена сервера
- Helmet.js для защиты заголовков
- Валидация всех входных данных

### Логирование
- Все действия пользователей логируются
- Ошибки записываются в `logs/error.log`
- Общие логи в `logs/combined.log`

## 📝 Исправленные проблемы

### ❌ Было:
1. HTTP 404 при авторизации
2. `app.checkAuth is not a function`
3. `app.showLogin is not a function`
4. Заглушки вместо функционала
5. Отсутствие API эндпоинтов

### ✅ Исправлено:
1. Полный функционал авторизации
2. Исправлена инициализация модулей
3. Все API эндпоинты реализованы
4. Заглушки заменены на полный функционал
5. Добавлена работа с MySQL

## 🚨 Возможные проблемы и решения

### Проблема: MySQL не запускается
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Проблема: Ошибка прав доступа
```bash
sudo chown -R www-data:www-data /root/construction-crm
sudo chmod -R 755 /root/construction-crm
```

### Проблема: Порт 3000 занят
```bash
# Найти процесс на порту 3000
sudo netstat -tlnp | grep :3000
# Убить процесс
sudo kill -9 [PID]
```

### Проблема: Ошибки npm
```bash
# Очистить кеш и переустановить
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📊 Мониторинг и обслуживание

### Проверка статуса
```bash
# Проверить статус сервера
curl http://localhost:3000
# Проверить логи
tail -f logs/combined.log
# Проверить MySQL
mysql -u construction_admin -p construction_crm
```

### Резервное копирование
```bash
# Бэкап базы данных
mysqldump -u construction_admin -p construction_crm > backup_$(date +%Y%m%d).sql
# Бэкап файлов
tar -czf backup_files_$(date +%Y%m%d).tar.gz uploads/
```

## 🎯 На что обратить внимание

### Возможные ошибки в коде:
1. **Инициализация модулей** - убедитесь, что все модули правильно инициализируются
2. **API эндпоинты** - проверьте, что все маршруты работают
3. **Подключение к БД** - убедитесь, что MySQL запущен и доступен
4. **Права доступа** - проверьте права на файлы и директории
5. **CORS настройки** - убедитесь, что домен сервера добавлен в CORS

### Критические точки:
- Подключение к базе данных
- JWT токены и их валидация
- Права доступа к файлам
- Настройки безопасности
- Обработка ошибок в API

## 🌟 Рекомендации по развертыванию

1. **Используйте PM2** для управления процессом:
```bash
npm install -g pm2
pm2 start server.js --name construction-crm
pm2 save
pm2 startup
```

2. **Настройте Nginx** как reverse proxy:
```nginx
server {
    listen 80;
    server_name 79.174.85.87;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Настройте SSL сертификат** для HTTPS

4. **Регулярные бэкапы** базы данных и файлов

## 📞 Поддержка

При возникновении проблем проверьте:
1. Логи в `logs/error.log`
2. Статус MySQL: `sudo systemctl status mysql`
3. Доступность портов: `netstat -tlnp`
4. Права доступа к файлам
5. Переменные окружения в `.env`

---

**Система готова к работе!** 🎉

Доступ: http://79.174.85.87:3000
Логин: admin
Пароль: admin123