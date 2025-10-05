# 🎉 Release v1.1.1-linux - Linux Support

<div align="center">

![Linux](https://img.shields.io/badge/Linux-x64-green?style=for-the-badge&logo=linux)
![AppImage](https://img.shields.io/badge/AppImage-162MB-orange?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.1.1--linux-brightgreen?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Ready%20to%20Use-success?style=for-the-badge)

**Полная поддержка Linux с автоматическим определением ОС**

[![Download Now](https://img.shields.io/badge/Download-AppImage-red?style=for-the-badge&logo=download)](https://github.com/MetanoicArmor/i2pd-react/releases/tag/v1.1.1-linux)

</div>

---

## 🚀 Что нового

### ✨ Linux Support
- **🐧 Полная поддержка Linux** с автоматическим определением ОС
- **🎯 Умные пути конфигурации** - автоматический выбор правильных путей для каждой ОС
- **⚡ Работающий демон** - корректное управление i2pd демоном на Linux
- **📦 AppImage готов** - полностью собранное приложение для Linux

### 🔧 Автоматическое определение ОС
- **🔍 Pre-build проверка** - скрипт `pre-build-check.js` проверяет ОС перед сборкой
- **📁 Platform-specific пути** - автоматический выбор путей для конфига и исполняемых файлов
- **🧠 Умная логика** - приложение использует `platform-info.json` для определения правильных путей

---

## 🔧 Исправления

### 🐧 Linux-специфичные исправления
- **📂 Пути к конфигу**: `/home/user/.i2pd` вместо `/var/lib/i2pd`
- **🔐 Сертификаты**: автоматическое копирование из системной директории
- **👤 Права доступа**: все файлы доступны для чтения пользователем
- **📄 PID файлы**: правильное размещение в домашней директории

### ⚙️ Конфигурация
- **📝 i2pd.conf обновлен** для Linux с правильными путями
- **🔑 Сертификаты настроены** - автоматическое копирование из `/var/lib/i2pd/certificates/`
- **🚀 Демон работает** - корректный запуск и остановка

---

## 📦 Сборка

### 🎯 AppImage
- **📏 Размер**: 162MB
- **🏗️ Архитектура**: x64
- **✅ Готов к использованию**: `I2P Daemon GUI-1.1.0.AppImage`

### 🔄 Автоматическая сборка
```bash
npm run dist-linux
```

---

## 🚀 Использование

### 📥 Быстрый старт
```bash
# Скачать AppImage
wget https://github.com/MetanoicArmor/i2pd-react/releases/download/v1.1.1-linux/I2P\ Daemon\ GUI-1.1.0.AppImage

# ⚠️ ВАЖНО! Сделать исполняемым
chmod +x "I2P Daemon GUI-1.1.0.AppImage"

# Запустить
./I2P\ Daemon\ GUI-1.1.0.AppImage
```

> ⚠️ **КРИТИЧЕСКИ ВАЖНО!** Не забудьте дать права на выполнение!
> Без `chmod +x` получите ошибку "Permission denied"

### 🛠️ Разработка
```bash
npm run electron-dev
```

---

## 📋 Технические детали

### 🔧 Изменения в коде
- ➕ Добавлен `pre-build-check.js` для проверки ОС
- 🔄 Обновлен `electron.js` с умной логикой путей
- ⚙️ Исправлен `i2pd.conf` для Linux
- 🐧 Добавлен Linux исполняемый файл `Lin/i2pd`

### 📁 Файлы
- `platform-info.json` - информация о платформе
- `pre-build-check.js` - скрипт проверки ОС
- `Lin/i2pd` - Linux исполняемый файл i2pd

---

## 🎯 Результат

<div align="center">

**🎉 Полностью рабочее приложение для Linux!** 🚀

</div>

- ✅ **Демон автоматически запускается**
- ✅ **Веб-консоль доступна**
- ✅ **Все функции работают**
- ✅ **AppImage готов к распространению**

---

## 📊 Статистика релиза

| Параметр | Значение |
|----------|----------|
| **Версия** | v1.1.1-linux |
| **Платформа** | Linux x64 |
| **Размер AppImage** | 162MB |
| **Коммитов** | 18 |
| **Дата релиза** | 2025-10-05 |
| **Статус** | ✅ Готов к использованию |

---

## 🔗 Ссылки

- **📥 Скачать**: [GitHub Releases](https://github.com/MetanoicArmor/i2pd-react/releases/tag/v1.1.1-linux)
- **📚 Документация**: [README.md](README.md)
- **🐛 Баги**: [Issues](https://github.com/MetanoicArmor/i2pd-react/issues)
- **💬 Обсуждения**: [Discussions](https://github.com/MetanoicArmor/i2pd-react/discussions)

---

<div align="center">

**Спасибо за использование I2P Daemon GUI!** ❤️

[![GitHub stars](https://img.shields.io/github/stars/MetanoicArmor/i2pd-react?style=social)](https://github.com/MetanoicArmor/i2pd-react/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/MetanoicArmor/i2pd-react?style=social)](https://github.com/MetanoicArmor/i2pd-react/network/members)

</div>
