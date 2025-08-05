#!/bin/bash

# Fix Nginx Configuration Script
# Исправление конфигурации Nginx

echo "🔧 Исправление конфигурации Nginx..."

# Остановка nginx если запущен
sudo systemctl stop nginx 2>/dev/null || true

# Резервное копирование оригинальной конфигурации
if [ -f "/etc/nginx/sites-available/construction-crm" ]; then
    sudo cp /etc/nginx/sites-available/construction-crm /etc/nginx/sites-available/construction-crm.backup
    echo "✅ Создана резервная копия конфигурации"
fi

# Создание исправленной конфигурации
echo "📝 Создание новой конфигурации..."
sudo tee /etc/nginx/sites-available/construction-crm > /dev/null << 'EOF'
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
    
    # Static files - serve directly from public directory
    location / {
        root /var/www/construction-crm/public;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
        
        # Cache HTML files for shorter period
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
    
    # Logs directory (deny access)
    location /logs/ {
        deny all;
        return 404;
    }
    
    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
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
EOF

# Удаление старых ссылок
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/construction-crm

# Создание новой ссылки
sudo ln -sf /etc/nginx/sites-available/construction-crm /etc/nginx/sites-enabled/

# Тестирование конфигурации
echo "🔍 Тестирование конфигурации..."
if sudo nginx -t; then
    echo "✅ Конфигурация Nginx корректна!"
    
    # Запуск nginx
    echo "🚀 Запуск Nginx..."
    sudo systemctl enable nginx
    sudo systemctl start nginx
    
    if sudo systemctl is-active --quiet nginx; then
        echo "✅ Nginx успешно запущен!"
        echo ""
        echo "🌐 Web интерфейс будет доступен по адресу: http://79.174.85.87"
    else
        echo "❌ Ошибка запуска Nginx"
        sudo systemctl status nginx --no-pager
    fi
else
    echo "❌ Ошибка в конфигурации Nginx"
    sudo nginx -t
    exit 1
fi

echo ""
echo "📊 Статус сервисов:"
echo "Nginx: $(sudo systemctl is-active nginx)"
echo "MySQL: $(sudo systemctl is-active mysql)"

echo ""
echo "🎯 Nginx исправлен и готов к работе!"