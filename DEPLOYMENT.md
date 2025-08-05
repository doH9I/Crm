# Инструкции по развертыванию Construction CRM

## Автоматическое развертывание на сервере 79.174.85.87

### Предварительные требования

1. **Операционная система**: Ubuntu 20.04+ или Debian 10+
2. **Доступ**: SSH доступ с правами sudo/root
3. **Свободное место**: минимум 2GB дискового пространства
4. **Интернет**: стабильное подключение к интернету

### Пошаговая инструкция

#### Шаг 1: Подключение к серверу
```bash
# Подключитесь к серверу через PuTTY или SSH
ssh root@79.174.85.87
```

#### Шаг 2: Загрузка проекта на сервер
```bash
# Если проект еще не загружен, создайте директорию и скопируйте файлы
mkdir -p /root/construction-crm
cd /root/construction-crm

# Загрузите все файлы проекта в эту директорию
# (Через SCP, SFTP или другим способом)
```

#### Шаг 3: Быстрая проверка системы
```bash
# Перейдите в директорию проекта
cd /root/construction-crm

# Запустите предварительную проверку
bash quick-setup.sh
```

#### Шаг 4: Полное развертывание
```bash
# После успешной проверки запустите полное развертывание
sudo bash deploy.sh
```

### Что происходит во время развертывания

1. **Обновление системы**
   - Обновление списка пакетов
   - Установка обновлений безопасности

2. **Установка компонентов**
   - Node.js 18.x
   - MySQL Server
   - Nginx
   - Дополнительные утилиты

3. **Настройка базы данных**
   - Создание базы данных `construction_crm`
   - Создание пользователя `crm_user`
   - Импорт схемы базы данных
   - Создание администратора по умолчанию

4. **Настройка приложения**
   - Копирование файлов в `/var/www/construction-crm`
   - Установка npm зависимостей
   - Настройка прав доступа

5. **Настройка веб-сервера**
   - Конфигурация Nginx
   - Настройка проксирования API
   - Включение сжатия и кеширования

6. **Настройка автозапуска**
   - Создание systemd сервиса
   - Включение автозапуска при загрузке

7. **Настройка безопасности**
   - Конфигурация файрвола UFW
   - Базовые правила безопасности

### После развертывания

#### Доступ к системе
- **Web интерфейс**: http://79.174.85.87
- **Логин**: admin
- **Пароль**: admin123

⚠️ **ВАЖНО**: Обязательно смените пароль после первого входа!

#### Полезные команды

```bash
# Проверка статуса сервиса
sudo systemctl status construction-crm

# Просмотр логов
sudo journalctl -u construction-crm -f

# Перезапуск сервиса
sudo systemctl restart construction-crm

# Статус Nginx
sudo systemctl status nginx

# Статус MySQL
sudo systemctl status mysql

# Проверка портов
sudo netstat -tlnp | grep -E ':(80|443|3000|3306)'
```

### Управление сервисами

```bash
# Остановка сервиса
sudo systemctl stop construction-crm

# Запуск сервиса
sudo systemctl start construction-crm

# Перезагрузка конфигурации
sudo systemctl daemon-reload

# Отключение автозапуска
sudo systemctl disable construction-crm
```

### Резервное копирование

```bash
# Создание резервной копии базы данных
mysqldump -u crm_user -p'strong_password_123!@#' construction_crm > backup_$(date +%Y%m%d).sql

# Создание резервной копии файлов
tar -czf backup_files_$(date +%Y%m%d).tar.gz /var/www/construction-crm/uploads
```

### Обновление приложения

```bash
# Остановка сервиса
sudo systemctl stop construction-crm

# Резервное копирование
cp -r /var/www/construction-crm /var/www/construction-crm.backup

# Загрузка новых файлов (замените новыми файлами)
# Копирование в /var/www/construction-crm

# Установка зависимостей (если обновились)
cd /var/www/construction-crm
sudo -u www-data npm install --production

# Запуск сервиса
sudo systemctl start construction-crm
```

### Решение проблем

#### Проблема: Сервис не запускается
```bash
# Проверка логов
sudo journalctl -u construction-crm -n 50

# Проверка прав доступа
sudo chown -R www-data:www-data /var/www/construction-crm
sudo chmod -R 755 /var/www/construction-crm
```

#### Проблема: База данных недоступна
```bash
# Проверка статуса MySQL
sudo systemctl status mysql

# Перезапуск MySQL
sudo systemctl restart mysql

# Проверка подключения
mysql -u crm_user -p'strong_password_123!@#' construction_crm
```

#### Проблема: Nginx не работает
```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx

# Проверка логов
sudo tail -f /var/log/nginx/error.log
```

### Настройка HTTPS (опционально)

Для настройки SSL сертификата:

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата (замените email и domain)
sudo certbot --nginx -d yourdomain.com -m your-email@example.com --agree-tos

# Автообновление сертификата
sudo crontab -e
# Добавьте строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### Мониторинг

#### Проверка ресурсов
```bash
# Использование CPU и памяти
htop

# Дисковое пространство
df -h

# Статистика Nginx
curl http://79.174.85.87/nginx_status
```

#### Логи
```bash
# Логи приложения
sudo tail -f /var/www/construction-crm/logs/combined.log

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Системные логи
sudo journalctl -f
```

### Контакты поддержки

При возникновении проблем:
1. Проверьте логи сервисов
2. Убедитесь в корректности конфигурации
3. Проверьте доступность портов и сетевых ресурсов

### Безопасность

**Рекомендации по безопасности:**
1. Регулярно обновляйте систему
2. Используйте сложные пароли
3. Настройте регулярное резервное копирование
4. Мониторьте логи на предмет подозрительной активности
5. Рассмотрите настройку SSL сертификата
6. Ограничьте SSH доступ по ключам