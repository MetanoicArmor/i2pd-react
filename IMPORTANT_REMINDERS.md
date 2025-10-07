# ⚠️ ВАЖНЫЕ НАПОМИНАНИЯ

<div align="center">

![Warning](https://img.shields.io/badge/⚠️-WARNING-red?style=for-the-badge)
![Important](https://img.shields.io/badge/IMPORTANT-Read%20This-orange?style=for-the-badge)

**Критически важная информация для пользователей**

</div>

---

## 🚨 КРИТИЧЕСКИ ВАЖНО!

### 📥 После скачивания AppImage

```bash
# 1. Скачать файл
wget https://github.com/MetanoicArmor/i2pd-react/releases/download/v1.1.1-linux/I2P\ Daemon\ GUI-1.1.0.AppImage

# 2. ⚠️ ОБЯЗАТЕЛЬНО! Дать права на выполнение
chmod +x "I2P Daemon GUI-1.1.0.AppImage"

# 3. Запустить
./I2P\ Daemon\ GUI-1.1.0.AppImage
```

### ❌ Что произойдет БЕЗ chmod +x:

```bash
$ ./I2P\ Daemon\ GUI-1.1.0.AppImage
bash: ./I2P Daemon GUI-1.1.0.AppImage: Permission denied
```

### ✅ Что произойдет С chmod +x:

```bash
$ chmod +x "I2P Daemon GUI-1.1.0.AppImage"
$ ./I2P\ Daemon\ GUI-1.1.0.AppImage
# Приложение запустится успешно!
```

---

## 🔍 Проверка прав

### Проверить текущие права:

```bash
ls -la "I2P Daemon GUI-1.1.0.AppImage"
```

### ✅ Правильный результат:
```
-rwxr-xr-x 1 user user 162M Oct  5 09:09 I2P Daemon GUI-1.1.0.AppImage
```

### ❌ Неправильный результат:
```
-rw-r--r-- 1 user user 162M Oct  5 09:09 I2P Daemon GUI-1.1.0.AppImage
```

---

## 🛠️ Альтернативные способы

### Через файловый менеджер:

1. **Правый клик** на файл AppImage
2. **Свойства** → **Права доступа**
3. **Поставить галочку** "Исполняемый"
4. **Применить**

### Через GUI:

```bash
# В некоторых дистрибутивах
chmod 755 "I2P Daemon GUI-1.1.0.AppImage"
```

---

## 📋 Частые ошибки

### ❌ Ошибка 1: "Permission denied"
```bash
bash: ./I2P Daemon GUI-1.1.0.AppImage: Permission denied
```
**Решение**: `chmod +x "I2P Daemon GUI-1.1.0.AppImage"`

### ❌ Ошибка 2: "No such file or directory"
```bash
bash: ./I2P Daemon GUI-1.1.0.AppImage: No such file or directory
```
**Решение**: Проверить имя файла и путь

### ❌ Ошибка 3: "Command not found"
```bash
chmod: command not found
```
**Решение**: Использовать файловый менеджер для изменения прав

---

## 🎯 Быстрая команда

### Одной строкой:

```bash
wget https://github.com/MetanoicArmor/i2pd-react/releases/download/v1.1.1-linux/I2P\ Daemon\ GUI-1.1.0.AppImage && chmod +x "I2P Daemon GUI-1.1.0.AppImage" && ./I2P\ Daemon\ GUI-1.1.0.AppImage
```

### Или по шагам:

```bash
# Скачать
wget https://github.com/MetanoicArmor/i2pd-react/releases/download/v1.1.1-linux/I2P\ Daemon\ GUI-1.1.0.AppImage

# Дать права
chmod +x "I2P Daemon GUI-1.1.0.AppImage"

# Запустить
./I2P\ Daemon\ GUI-1.1.0.AppImage
```

---

## 📞 Если не помогло

### Проверить систему:

```bash
# Проверить версию Linux
uname -a

# Проверить права пользователя
whoami

# Проверить доступ к файлу
file "I2P Daemon GUI-1.1.0.AppImage"
```

### Обратиться за помощью:

- 🐛 **GitHub Issues**: https://github.com/MetanoicArmor/i2pd-react/issues
- 💬 **Discussions**: https://github.com/MetanoicArmor/i2pd-react/discussions

---

<div align="center">

**⚠️ ЗАПОМНИТЕ: chmod +x ОБЯЗАТЕЛЬНО! ⚠️**

![Remember](https://img.shields.io/badge/Remember-chmod%20%2Bx-red?style=for-the-badge)

</div>

