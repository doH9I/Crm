#!/bin/bash

# Test Nginx Configuration
# Тестирование конфигурации Nginx

echo "🔧 Тестирование конфигурации Nginx..."

# Проверка синтаксиса конфигурации
echo "1. Проверка синтаксиса nginx.conf..."
if nginx -t -c /workspace/nginx.conf 2>/dev/null; then
    echo "✅ Синтаксис конфигурации корректен"
else
    echo "❌ Ошибка в конфигурации:"
    nginx -t -c /workspace/nginx.conf
    echo ""
    echo "🔧 Исправляем конфигурацию..."
    
    # Создание исправленной конфигурации
    cat > /workspace/nginx.conf.fixed << 'EOF'
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
    
    # Замена файла
    mv /workspace/nginx.conf.fixed /workspace/nginx.conf
    echo "✅ Конфигурация исправлена"
fi

# Тест исправленной конфигурации
echo ""
echo "2. Финальная проверка конфигурации..."
if nginx -t -c /workspace/nginx.conf; then
    echo "✅ Конфигурация Nginx готова к использованию!"
else
    echo "❌ Все еще есть ошибки в конфигурации"
    exit 1
fi

echo ""
echo "3. Проверка файлов проекта..."
if [ -f "/workspace/public/index.html" ]; then
    echo "✅ index.html найден"
else
    echo "❌ index.html не найден"
fi

if [ -d "/workspace/public/js" ]; then
    js_count=$(ls /workspace/public/js/*.js 2>/dev/null | wc -l)
    echo "✅ Найдено $js_count JavaScript файлов"
else
    echo "❌ Директория js не найдена"
fi

if [ -d "/workspace/public/css" ]; then
    css_count=$(ls /workspace/public/css/*.css 2>/dev/null | wc -l)
    echo "✅ Найдено $css_count CSS файлов"
else
    echo "❌ Директория css не найдена"
fi

echo ""
echo "🎯 Nginx готов к развертыванию!"