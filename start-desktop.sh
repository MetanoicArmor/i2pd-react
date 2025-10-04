#!/bin/bash

# Скрипт запуска I2P Daemon GUI в режиме разработки
# Запускает React dev server и Electron без открытия браузера

echo "🚀 Запуск I2P Daemon GUI в режиме разработки..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Запустите скрипт из корневой папки проекта."
    exit 1
fi

# Убиваем все существующие процессы
echo "🔄 Останавливаем существующие процессы..."
pkill -f "npm start" 2>/dev/null || true
pkill -f "electron" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "craco" 2>/dev/null || true

# Ждем немного
sleep 2

# Запускаем React dev server в фоне
echo "📦 Запускаем React dev server..."
npm start &
REACT_PID=$!

# Ждем пока React dev server запустится
echo "⏳ Ожидаем запуска React dev server..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ React dev server запущен на http://localhost:3000"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ React dev server не запустился за 30 секунд"
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
echo "📱 Desktop приложение: Electron окно"
echo "🌐 React dev server: http://localhost:3000 (только для разработки)"
echo ""
echo "🔧 Управление:"
echo "   Ctrl+C - остановить все процессы"
echo "   Cmd+R (macOS) / Ctrl+R (Windows/Linux) - перезагрузить Electron"
echo "   Cmd+Shift+I (macOS) / Ctrl+Shift+I (Windows/Linux) - DevTools"
echo ""

# Функция для корректного завершения
cleanup() {
    echo ""
    echo "🛑 Останавливаем приложение..."
    kill $REACT_PID 2>/dev/null || true
    kill $ELECTRON_PID 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    pkill -f "electron" 2>/dev/null || true
    pkill -f "react-scripts" 2>/dev/null || true
    pkill -f "craco" 2>/dev/null || true
    echo "✅ Приложение остановлено"
    exit 0
}

# Обработчик сигналов для корректного завершения
trap cleanup SIGINT SIGTERM

# Ждем завершения процессов
wait $ELECTRON_PID
cleanup



