#!/bin/bash

# Скрипт разработки I2P Daemon GUI
# Автор: I2P Community
# Версия: 1.0.0

set -e

echo "🛠️  Запуск режима разработки I2P Daemon GUI..."

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 16+ и попробуйте снова."
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"

# Проверяем наличие npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден. Установите npm и попробуйте снова."
    exit 1
fi

echo "✅ npm версия: $(npm -v)"

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
fi

# Проверяем наличие i2pd
echo "🔍 Проверяем наличие i2pd..."
if command -v i2pd &> /dev/null; then
    echo "✅ i2pd найден: $(which i2pd)"
    echo "📋 Версия: $(i2pd --version | head -1)"
else
    echo "⚠️  i2pd не найден в PATH"
    echo "💡 Установите i2pd для полной функциональности:"
    echo "   macOS: brew install i2pd"
    echo "   Ubuntu: sudo apt install i2pd"
    echo "   Windows: скачайте с https://geti2p.net"
fi

# Создаем папку для логов разработки
mkdir -p logs

# Запускаем в режиме разработки
echo "🚀 Запускаем приложение в режиме разработки..."
echo "📱 React Dev Server: http://localhost:3000"
echo "⚡ Electron: запускается автоматически"
echo ""
echo "🔧 Полезные команды:"
echo "   Ctrl+C - остановить приложение"
echo "   Cmd+R (macOS) / Ctrl+R (Windows/Linux) - перезагрузить"
echo "   Cmd+Shift+I (macOS) / Ctrl+Shift+I (Windows/Linux) - DevTools"
echo ""

# Запускаем Electron в режиме разработки
npm run electron-dev

