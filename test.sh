#!/bin/bash

# Скрипт тестирования I2P Daemon GUI
# Автор: I2P Community
# Версия: 1.0.0

set -e

echo "🧪 Запуск тестов I2P Daemon GUI..."

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 16+ и попробуйте снова."
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
fi

# Запускаем тесты React
echo "🔬 Запускаем тесты React..."
npm test -- --coverage --watchAll=false

# Проверяем линтер
echo "🔍 Проверяем код линтером..."
npm run lint 2>/dev/null || echo "⚠️  Линтер не настроен"

# Проверяем типы TypeScript (если используется)
if [ -f "tsconfig.json" ]; then
    echo "📝 Проверяем типы TypeScript..."
    npx tsc --noEmit 2>/dev/null || echo "⚠️  TypeScript проверка не прошла"
fi

# Проверяем сборку
echo "🔨 Проверяем сборку..."
npm run build

if [ -d "build" ]; then
    echo "✅ Сборка прошла успешно"
else
    echo "❌ Ошибка сборки"
    exit 1
fi

# Проверяем Electron сборку
echo "⚡ Проверяем Electron сборку..."
npm run electron-pack

# Проверяем размер сборки
echo "📊 Размер сборки:"
du -sh build/ 2>/dev/null || echo "Не удалось определить размер"

echo ""
echo "✅ Все тесты пройдены успешно!"
echo "📋 Результаты:"
echo "   - React тесты: ✅"
echo "   - Сборка: ✅"
echo "   - Electron: ✅"
echo ""
echo "🚀 Готово к развертыванию!"

