#!/bin/bash

# Простой скрипт запуска I2P Daemon GUI
echo "🚀 Запуск I2P Daemon GUI..."

# Останавливаем все процессы
echo "🔄 Останавливаем существующие процессы..."
pkill -f "npm start" 2>/dev/null || true
pkill -f "electron" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

# Ждем
sleep 2

# Запускаем React dev server
echo "📦 Запускаем React dev server..."
npm start &
REACT_PID=$!

# Ждем запуска React
echo "⏳ Ожидаем запуска React dev server..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ React dev server запущен"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ React dev server не запустился"
        kill $REACT_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Запускаем Electron
echo "⚡ Запускаем Electron desktop приложение..."
npm run electron-dev &
ELECTRON_PID=$!

echo ""
echo "🎉 I2P Daemon GUI запущен!"
echo "📱 Desktop приложение должно быть видно"
echo "🌐 React dev server: http://localhost:3000"
echo ""
echo "💡 Если окно не видно, попробуйте:"
echo "   - Проверить трей (системное меню)"
echo "   - Нажать Cmd+Tab для переключения между приложениями"
echo "   - Нажать Cmd+H чтобы показать скрытые окна"
echo ""

# Функция завершения
cleanup() {
    echo ""
    echo "🛑 Останавливаем приложение..."
    kill $REACT_PID 2>/dev/null || true
    kill $ELECTRON_PID 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    pkill -f "electron" 2>/dev/null || true
    echo "✅ Приложение остановлено"
    exit 0
}

# Обработчик сигналов
trap cleanup SIGINT SIGTERM

# Ждем завершения
wait $ELECTRON_PID
cleanup

