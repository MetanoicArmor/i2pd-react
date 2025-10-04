#!/bin/bash

echo "🧹 Очистка всех процессов..."

# Останавливаем все процессы
pkill -f i2pd 2>/dev/null || true
pkill -f "Electron.app/Contents/MacOS/Electron" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "node.*electron" 2>/dev/null || true

echo "⏳ Ждем 2 секунды..."
sleep 2

echo "🚀 Запуск React dev server..."
npm start &
REACT_PID=$!

echo "⏳ Ждем 5 секунд для запуска React..."
sleep 5

echo "🚀 Запуск Electron..."
npm run electron-dev &
ELECTRON_PID=$!

echo "✅ Все запущено!"
echo "React PID: $REACT_PID"
echo "Electron PID: $ELECTRON_PID"
echo ""
echo "Для остановки всех процессов нажмите Ctrl+C"

# Функция для корректного завершения
cleanup() {
    echo ""
    echo "🛑 Останавливаем все процессы..."
    
    # Проверяем, что процессы еще существуют
    if kill -0 $REACT_PID 2>/dev/null; then
        echo "Останавливаем React (PID: $REACT_PID)..."
        kill $REACT_PID 2>/dev/null || true
    fi
    
    if kill -0 $ELECTRON_PID 2>/dev/null; then
        echo "Останавливаем Electron (PID: $ELECTRON_PID)..."
        kill $ELECTRON_PID 2>/dev/null || true
    fi
    
    # Дополнительная очистка
    echo "Дополнительная очистка..."
    pkill -f i2pd 2>/dev/null || true
    pkill -f "Electron.app/Contents/MacOS/Electron" 2>/dev/null || true
    pkill -f "react-scripts" 2>/dev/null || true
    
    echo "✅ Все процессы остановлены"
    exit 0
}

# Устанавливаем обработчик сигналов
trap cleanup INT TERM

# Ждем завершения процессов
wait
