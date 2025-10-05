# i2pd React GUI

Кроссплатформенное приложение для управления i2pd демоном, написанное на React и Electron.

## 📸 Скриншоты

<div align="center">

### Главный экран с сетевой статистикой
![Главный экран](screenshots/scr1_ru.png)

### Логи системы
![Логи](screenshots/scr2_ru.png)

### Редактор конфигурации
![Конфигурация](screenshots/scr3_ru.png)

### Настройки внешнего вида
![Настройки](screenshots/scr4_ru.png)

</div>

## ✨ Особенности

- 🚀 **Кроссплатформенность** - работает на Windows, macOS и Linux
- 🎨 **Современный интерфейс** - нативный дизайн с поддержкой тем
- 🌐 **Многоязычность** - поддержка русского и английского языков
- 📊 **Мониторинг сети** - реальная статистика из веб-консоли i2pd
- ⚙️ **Управление конфигурацией** - редактирование файлов конфигурации
- 🔄 **Автоматический запуск** - поддержка автозапуска демона
- 📱 **Системный трей** - работа в фоновом режиме
- 🌐 **Веб-консоль** - быстрый доступ к веб-интерфейсу i2pd
- 🎮 **Управление демоном** - запуск, остановка, перезапуск i2pd
- 📈 **Статистика в реальном времени** - мониторинг туннелей, роутеров, трафика

## 📥 Загрузка

### Готовые сборки

Скачайте последнюю версию для вашей платформы:

**[📦 Releases](https://github.com/MetanoicArmor/i2pd-react/releases/latest)**

#### macOS
- **Apple Silicon (M1/M2/M3)**: `I2P Daemon GUI-1.0.0-arm64.dmg`
- **Intel (x64)**: `I2P Daemon GUI-1.0.0-x64.dmg`

#### Windows
- Скоро...

#### Linux
- Скоро...

### Установка из исходников

1. Клонируйте репозиторий:
```bash
git clone https://github.com/MetanoicArmor/i2pd-react.git
cd i2pd-react
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите в режиме разработки:
```bash
./start-clean.sh
```

## 🔨 Сборка

### Сборка для всех платформ:

```bash
npm run build
npm run dist
```

### Сборка для конкретной платформы:

#### macOS
```bash
npm run dist-mac-arm64      # Apple Silicon (M1/M2/M3)
npm run dist-mac-x64        # Intel
npm run dist-mac-universal  # Universal (ARM64 + x64)
```

#### Windows
```bash
npm run dist-win
```

#### Linux
```bash
npm run dist-linux
```

Собранные приложения будут находиться в папке `dist/`.

## 💻 Системные требования

### macOS
- **Версия:** macOS 10.12 (Sierra) или новее
- **Архитектура:** ARM64 (Apple Silicon) или x64 (Intel)
- **Включает:** i2pd v2.58.0

### Windows
- **Версия:** Windows 7 или новее
- **Архитектура:** x64

### Linux
- **Дистрибутивы:** Ubuntu 18.04+, Debian 10+, Fedora 32+
- **Архитектура:** x64

## 🚀 Быстрый старт

1. Скачайте приложение для вашей платформы из [Releases](https://github.com/MetanoicArmor/i2pd-react/releases/latest)
2. Установите приложение:
   - **macOS:** Откройте `.dmg` и перетащите в Applications
   - **Windows:** Запустите установщик `.exe`
   - **Linux:** Установите `.AppImage` или `.deb`
3. Запустите приложение
4. Нажмите кнопку **"Запустить"** для старта i2pd демона
5. Откройте **"Веб-консоль"** для доступа к веб-интерфейсу i2pd

## 📖 Документация

- [Обзор проекта](PROJECT_OVERVIEW.md)
- [Модульная архитектура](MODULAR_ARCHITECTURE.md)
- [Упрощенная архитектура](SIMPLIFIED_ARCHITECTURE.md)
- [API документация](I2PD_API_DOCUMENTATION.md)
- [Статистика](STATS_DOCUMENTATION.md)
- [Иконки](ICONS_DOCUMENTATION.md)

## 📁 Структура проекта

```
i2pd-react/
├── public/           # Статические файлы и Electron main process
├── src/              # React компоненты и логика
│   ├── components/   # UI компоненты
│   ├── hooks/        # React хуки
│   ├── services/     # Сервисы для работы с i2pd
│   └── theme/        # Темы приложения
├── Mac/              # i2pd исполняемый файл для macOS
├── Win/              # i2pd исполняемый файл для Windows
├── Lin/              # i2pd исполняемый файл для Linux
└── Resources/        # Локализация
```

## Технологии

- **React** - UI библиотека
- **Electron** - кроссплатформенный фреймворк
- **styled-components** - CSS-in-JS
- **i18next** - интернационализация
- **i2pd** - I2P демон

## Лицензия

MIT License

## Автор

MetanoicArmor