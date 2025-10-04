# I2P Daemon GUI - Иконки

Этот файл содержит информацию о создании иконок для приложения.

## Требуемые иконки

### Основные иконки
- `icon.png` - 512x512px для Linux
- `icon.ico` - 256x256px для Windows  
- `icon.icns` - 512x512px для macOS
- `tray-icon.png` - 32x32px для системного трея

### Создание иконок

Для создания иконок можно использовать:

1. **Онлайн генераторы:**
   - https://iconverticons.com/online/
   - https://convertio.co/png-ico/
   - https://cloudconvert.com/png-to-icns

2. **Локальные инструменты:**
   - ImageMagick: `convert icon.png -resize 32x32 tray-icon.png`
   - GIMP/Photoshop для редактирования

3. **Автоматическая генерация:**
   ```bash
   # Установка electron-icon-builder
   npm install -g electron-icon-builder
   
   # Генерация всех иконок из PNG
   electron-icon-builder --input=icon.png --output=assets/
   ```

## Дизайн иконки

Иконка должна отражать:
- Анонимность (маски, тени)
- Сеть (соединения, узлы)
- Безопасность (замки, щиты)
- Современность (минимализм, градиенты)

### Цветовая схема
- Основной: #007AFF (синий)
- Акцент: #34C759 (зеленый)
- Фон: #1C1C1E (темный) или #FFFFFF (светлый)

### Стиль
- Плоский дизайн
- Минималистичный
- Узнаваемый на разных размерах
- Контрастный для трея

## Временные иконки

До создания финальных иконок можно использовать:
- SF Symbols (macOS)
- Material Icons (Android/Web)
- Lucide Icons (универсальные)

## Файлы для замены

Замените следующие файлы в папке `assets/`:
- `icon.png` - основная иконка
- `icon.ico` - Windows иконка
- `icon.icns` - macOS иконка
- `tray-icon.png` - иконка трея

