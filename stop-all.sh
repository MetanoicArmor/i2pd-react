#!/bin/bash

echo "🛑 Остановка всех процессов i2pd-react..."

# Останавливаем все процессы
echo "Останавливаем i2pd демоны..."
pkill -f i2pd 2>/dev/null || echo "i2pd процессы не найдены"

echo "Останавливаем Electron..."
pkill -f "Electron.app/Contents/MacOS/Electron" 2>/dev/null || echo "Electron процессы не найдены"

echo "Останавливаем React dev server..."
pkill -f "react-scripts" 2>/dev/null || echo "React процессы не найдены"

echo "Останавливаем Node.js процессы..."
pkill -f "node.*electron" 2>/dev/null || echo "Node.js процессы не найдены"

echo "⏳ Ждем 2 секунды..."
sleep 2

echo "Проверяем оставшиеся процессы..."
REMAINING=$(ps aux | grep -E "(i2pd|electron|react-scripts)" | grep -v grep | wc -l)

if [ "$REMAINING" -gt 0 ]; then
    echo "⚠️  Найдено $REMAINING оставшихся процессов:"
    ps aux | grep -E "(i2pd|electron|react-scripts)" | grep -v grep
    echo ""
    echo "Принудительная остановка..."
    pkill -9 -f i2pd 2>/dev/null || true
    pkill -9 -f "Electron.app/Contents/MacOS/Electron" 2>/dev/null || true
    pkill -9 -f "react-scripts" 2>/dev/null || true
    pkill -9 -f "node.*electron" 2>/dev/null || true
else
    echo "✅ Все процессы успешно остановлены"
fi

echo "Готово!"
