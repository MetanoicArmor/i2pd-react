# 📥 Установка и использование I2P Daemon GUI

<div align="center">

![Installation](https://img.shields.io/badge/Installation-Guide-blue?style=for-the-badge&logo=download)
![Linux](https://img.shields.io/badge/Linux-x64-green?style=for-the-badge&logo=linux)
![AppImage](https://img.shields.io/badge/AppImage-Ready-orange?style=for-the-badge)

**Простая установка и запуск на Linux**

</div>

---

## 🚀 Быстрая установка

### 1️⃣ Скачать AppImage

```bash
# Скачать последнюю версию
wget https://github.com/MetanoicArmor/i2pd-react/releases/download/v1.1.1-linux/I2P\ Daemon\ GUI-1.1.0.AppImage

# Или через curl
curl -L -o "I2P Daemon GUI-1.1.0.AppImage" https://github.com/MetanoicArmor/i2pd-react/releases/download/v1.1.1-linux/I2P\ Daemon\ GUI-1.1.0.AppImage
```

### 2️⃣ Сделать исполняемым

```bash
chmod +x "I2P Daemon GUI-1.1.0.AppImage"
```

### 3️⃣ Запустить

```bash
./I2P\ Daemon\ GUI-1.1.0.AppImage
```

---

## 🎯 Альтернативные способы установки

### 📦 Через менеджер пакетов (если доступно)

```bash
# Ubuntu/Debian
sudo apt install ./I2P\ Daemon\ GUI-1.1.0.AppImage

# Arch Linux
sudo pacman -U "I2P Daemon GUI-1.1.0.AppImage"
```

### 🔧 Установка в систему

```bash
# Переместить в /usr/local/bin
sudo mv "I2P Daemon GUI-1.1.0.AppImage" /usr/local/bin/i2pd-gui

# Создать символическую ссылку
sudo ln -s /usr/local/bin/i2pd-gui /usr/local/bin/i2pd-react-gui

# Запуск из любого места
i2pd-gui
```

---

## 🛠️ Разработка и сборка

### 📋 Требования

- **Node.js** 16+ 
- **npm** 8+
- **Git**
- **Linux** x64

### 🔧 Установка зависимостей

```bash
# Клонировать репозиторий
git clone https://github.com/MetanoicArmor/i2pd-react.git
cd i2pd-react

# Установить зависимости
npm install
```

### 🚀 Запуск в режиме разработки

```bash
# Запустить React dev server
npm start

# В другом терминале запустить Electron
npm run electron-dev
```

### 📦 Сборка AppImage

```bash
# Собрать для Linux
npm run dist-linux

# Результат будет в dist/
ls -la dist/
```

---

## ⚙️ Конфигурация

### 📁 Файлы конфигурации

Приложение автоматически создает необходимые файлы:

```
~/.i2pd/
├── i2pd.conf          # Основная конфигурация
├── certificates/       # Сертификаты I2P
│   ├── family/        # Семейные сертификаты
│   └── reseed/        # Сертификаты для reseed
├── i2pd.log           # Логи демона
├── i2pd.pid           # PID файл
└── router.keys        # Ключи роутера
```

### 🔧 Настройка конфигурации

1. **Открыть приложение**
2. **Перейти в настройки**
3. **Редактировать конфигурацию**
4. **Сохранить изменения**

### 🌐 Настройка прокси

```ini
# В i2pd.conf
[http]
enabled = true
address = 127.0.0.1
port = 4444

[socksproxy]
enabled = true
address = 127.0.0.1
port = 4447
```

---

## 🎨 Первый запуск

### 1️⃣ Запуск приложения

```bash
./I2P\ Daemon\ GUI-1.1.0.AppImage
```

### 2️⃣ Что происходит автоматически

- ✅ **Создание конфигурации** - автоматическая настройка путей
- ✅ **Копирование сертификатов** - из системной директории
- ✅ **Запуск демона** - автоматический старт I2P
- ✅ **Подключение к сети** - начало работы с I2P сетью

### 3️⃣ Первые шаги

1. **Дождаться подключения** - статус изменится на "Connected"
2. **Проверить статистику** - количество пиров и туннелей
3. **Настроить туннели** - создать клиентские туннели
4. **Использовать прокси** - настроить браузер на 127.0.0.1:4444

---

## 🔍 Устранение неполадок

### ❌ Демон не запускается

```bash
# Проверить логи
tail -f ~/.i2pd/i2pd.log

# Проверить права доступа
ls -la ~/.i2pd/

# Проверить процессы
ps aux | grep i2pd
```

### ❌ Веб-консоль недоступна

```bash
# Проверить порт 7070
netstat -tlnp | grep 7070

# Проверить конфигурацию
grep -n "webconsole" ~/.i2pd/i2pd.conf
```

### ❌ Проблемы с сертификатами

```bash
# Скопировать сертификаты вручную
sudo cp -r /var/lib/i2pd/certificates/* ~/.i2pd/certificates/

# Проверить права
chmod -R 755 ~/.i2pd/certificates/
```

---

## 📚 Дополнительные ресурсы

### 🔗 Полезные ссылки

- **📖 Документация I2P**: https://geti2p.net/en/docs
- **🌐 Официальный сайт**: https://geti2p.net/
- **💬 Сообщество**: https://geti2p.net/en/community
- **🐛 Баги**: https://github.com/MetanoicArmor/i2pd-react/issues

### 📋 FAQ

**Q: Нужно ли устанавливать i2pd отдельно?**  
A: Нет, исполняемый файл встроен в AppImage.

**Q: Можно ли использовать с системным i2pd?**  
A: Да, но рекомендуется использовать встроенный для избежания конфликтов.

**Q: Как обновить приложение?**  
A: Скачать новую версию AppImage и заменить старую.

---

<div align="center">

**🎉 Готово! Наслаждайтесь использованием I2P Daemon GUI!**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/MetanoicArmor/i2pd-react)
[![Download](https://img.shields.io/badge/Download-AppImage-red?style=for-the-badge&logo=download)](https://github.com/MetanoicArmor/i2pd-react/releases/tag/v1.1.1-linux)

</div>
