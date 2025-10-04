#!/bin/bash

# Скрипт сборки I2P Daemon GUI
# Автор: I2P Community
# Версия: 1.0.0

set -e

echo "🚀 Начинаем сборку I2P Daemon GUI..."

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 16+ и попробуйте снова."
    exit 1
fi

# Проверяем версию Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Требуется Node.js версии 16 или выше. Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"

# Проверяем наличие npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден. Установите npm и попробуйте снова."
    exit 1
fi

echo "✅ npm версия: $(npm -v)"

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Проверяем наличие Electron
if ! command -v electron &> /dev/null; then
    echo "📦 Устанавливаем Electron..."
    npm install -g electron
fi

# Собираем React приложение
echo "🔨 Собираем React приложение..."
npm run build

# Проверяем успешность сборки
if [ ! -d "build" ]; then
    echo "❌ Ошибка сборки React приложения"
    exit 1
fi

echo "✅ React приложение собрано успешно"

# Создаем папку для дистрибутивов
mkdir -p dist

# Определяем платформу
PLATFORM=$(uname -s)
ARCH=$(uname -m)

echo "🖥️  Платформа: $PLATFORM $ARCH"

# Собираем Electron приложение
case $PLATFORM in
    "Darwin")
        echo "🍎 Собираем для macOS..."
        npm run dist-mac
        ;;
    "Linux")
        echo "🐧 Собираем для Linux..."
        npm run dist-linux
        ;;
    "MINGW"*|"CYGWIN"*|"MSYS"*)
        echo "🪟 Собираем для Windows..."
        npm run dist-win
        ;;
    *)
        echo "⚠️  Неизвестная платформа. Собираем универсальную версию..."
        npm run dist
        ;;
esac

# Проверяем результат сборки
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Сборка завершена успешно!"
    echo "📁 Результаты в папке: dist/"
    ls -la dist/
else
    echo "❌ Ошибка сборки дистрибутива"
    exit 1
fi

echo ""
echo "🎉 I2P Daemon GUI успешно собран!"
echo "📋 Следующие шаги:"
echo "   1. Протестируйте приложение"
echo "   2. Создайте установочные пакеты"
echo "   3. Подпишите приложение (для macOS/Windows)"
echo "   4. Загрузите релиз на GitHub"
echo ""
echo "🔗 Полезные ссылки:"
echo "   - Документация: README.md"
echo "   - Исходный код: https://github.com/i2p-gui"
echo "   - I2P Project: https://geti2p.net"

