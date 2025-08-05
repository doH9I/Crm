#!/bin/bash

echo "🔥 ЭКСТРЕННАЯ ОЧИСТКА ВСЕХ ПОРТОВ"
echo "=================================="

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${2}${1}${NC}"
}

# Остановка ВСЕХ Node.js процессов
print_status "🛑 Остановка ВСЕХ Node.js процессов..." $YELLOW
sudo pkill -9 -f node
sudo pkill -9 -f "node "
sudo killall -9 node 2>/dev/null
sleep 3

# Освобождение конкретных портов
PORTS=(3000 3001 8080 8000 9000)

for port in "${PORTS[@]}"; do
    print_status "🔌 Очистка порта $port..." $YELLOW
    
    # Находим процессы на порту
    PIDS=$(sudo lsof -t -i :$port 2>/dev/null)
    
    if [ ! -z "$PIDS" ]; then
        print_status "   Найдены процессы: $PIDS" $YELLOW
        
        # Убиваем все процессы на этом порту
        for pid in $PIDS; do
            sudo kill -9 $pid 2>/dev/null
            print_status "   Процесс $pid остановлен" $GREEN
        done
    else
        print_status "   Порт $port свободен" $GREEN
    fi
done

# Дополнительная очистка через fuser
for port in "${PORTS[@]}"; do
    sudo fuser -k $port/tcp 2>/dev/null
done

sleep 2

# Проверка результатов
print_status "\n📊 ПРОВЕРКА ПОРТОВ:" $YELLOW
for port in "${PORTS[@]}"; do
    if sudo lsof -i :$port &>/dev/null; then
        print_status "❌ Порт $port все еще занят" $RED
        sudo lsof -i :$port
    else
        print_status "✅ Порт $port свободен" $GREEN
    fi
done

print_status "\n🎉 ОЧИСТКА ЗАВЕРШЕНА!" $GREEN
print_status "Теперь можно запускать ./start_http.sh" $GREEN