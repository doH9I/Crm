# 🔧 Исправление ошибки конфигурации Nginx

## ❌ Ошибка
```
nginx: [emerg] invalid value "must-revalidate" in /etc/nginx/sites-enabled/construction-crm:16
nginx: configuration file /etc/nginx/nginx.conf test failed
```

## 🚀 БЫСТРОЕ РЕШЕНИЕ

### Выполните в PuTTY:
```bash
sudo bash fix-nginx.sh
```

Этот скрипт автоматически:
- ✅ Создаст резервную копию старой конфигурации
- ✅ Создаст исправленную конфигурацию Nginx
- ✅ Протестирует конфигурацию
- ✅ Запустит Nginx

## 📋 Что исправлено в конфигурации:

1. **gzip_proxied** - убрано недопустимое значение `must-revalidate`
2. **Content-Security-Policy** - улучшены правила для работы с JS/CSS
3. **gzip_types** - добавлены дополнительные типы файлов
4. **Кеширование** - оптимизированы настройки кеширования

## 🔍 Ручное исправление (если автоскрипт не сработал):

### 1. Остановите Nginx
```bash
sudo systemctl stop nginx
```

### 2. Создайте новую конфигурацию
```bash
sudo nano /etc/nginx/sites-available/construction-crm
```

### 3. Замените содержимое файла на:
```nginx
server {
    listen 80;
    server_name 79.174.85.87;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; font-src 'self' data: https:; img-src 'self' data: https:;" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/xml
        image/svg+xml;
    
    # File upload size
    client_max_body_size 50M;
    
    # API routes - proxy to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static files
    location / {
        root /var/www/construction-crm/public;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
        
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public";
        }
    }
    
    # Uploads directory
    location /uploads/ {
        alias /var/www/construction-crm/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|conf|sql)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 4. Проверьте конфигурацию
```bash
sudo nginx -t
```

### 5. Запустите Nginx
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

## ✅ Проверка работы

```bash
# Статус Nginx
sudo systemctl status nginx

# Проверка конфигурации
sudo nginx -t

# Проверка портов
sudo netstat -tlnp | grep :80
```

## 🌐 После исправления

После успешного исправления Nginx:
- Web интерфейс будет доступен по адресу: **http://79.174.85.87**
- API будет работать по адресу: **http://79.174.85.87/api**

## 🔄 Продолжение развертывания

После исправления Nginx можно продолжить развертывание:
```bash
sudo bash deploy.sh
```

Или проверить отдельные компоненты:
```bash
# Статус всех сервисов
sudo systemctl status construction-crm nginx mysql

# Перезапуск CRM сервиса
sudo systemctl restart construction-crm
```

## 🎯 Результат

После исправления у вас будет:
- ✅ Работающий Nginx с правильной конфигурацией
- ✅ Проксирование API запросов к Node.js
- ✅ Сжатие статических файлов
- ✅ Кеширование для оптимизации
- ✅ Базовые настройки безопасности