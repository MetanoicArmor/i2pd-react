# 📊 I2P Daemon - Веб-консоль и API

## 🌐 Веб-консоль i2pd

Согласно [официальной документации i2pd](https://i2pd.readthedocs.io/en/latest/), веб-консоль предоставляет веб-интерфейс для мониторинга и управления i2pd демоном.

### 🔧 Конфигурация

**Порт по умолчанию**: `7070`  
**Адрес**: `http://127.0.0.1:7070`

В файле `i2pd.conf`:

```ini
[http]
## Web Console settings
enabled = true
address = 127.0.0.1
port = 7070
webroot = /
```

### 📄 Доступные страницы

1. **Главная страница** - `http://127.0.0.1:7070/`
   - Основная статистика сети
   - Статус демона
   - Uptime, туннели, роутеры
   - Полученные/отправленные данные

2. **Туннели** - `http://127.0.0.1:7070/?page=tunnels`
   - Список активных клиентских туннелей
   - Информация о каждом туннеле

3. **Транзитные туннели** - `http://127.0.0.1:7070/?page=transit_tunnels`
   - Список транзитных туннелей
   - Статистика транзита

4. **Транспорты** - `http://127.0.0.1:7070/?page=transports`
   - Информация о транспортных соединениях
   - NTCP2, SSU2 соединения

5. **SAM сессии** - `http://127.0.0.1:7070/?page=sam_sessions`
   - Активные SAM сессии

6. **I2CP сессии** - `http://127.0.0.1:7070/?page=i2cp_local_destination`
   - Локальные назначения I2CP

## 📊 Извлечение статистики

### Метод 1: Парсинг HTML (текущий подход)

Веб-консоль i2pd возвращает HTML страницу с данными в текстовом формате. Мы парсим HTML для извлечения статистики:

```javascript
// Пример извлечения данных
const html = await fetch('http://127.0.0.1:7070');
const text = await html.text();

// Парсим Uptime
const uptimeMatch = text.match(/Uptime:\s*(\d+:\d+:\d+)/i);

// Парсим Tunnels
const tunnelsMatch = text.match(/Tunnels:\s*(\d+)/i);

// Парсим Routers
const routersMatch = text.match(/Routers:\s*(\d+)/i);

// Парсим Received/Sent
const receivedMatch = text.match(/Received:\s*([\d.]+)\s*(\w+)/i);
const sentMatch = text.match(/Sent:\s*([\d.]+)\s*(\w+)/i);
```

### Метод 2: I2PControl (JSON API)

**Альтернативный подход**: Использовать протокол I2PControl, который предоставляет JSON API.

Конфигурация в `i2pd.conf`:

```ini
[i2pcontrol]
enabled = true
address = 127.0.0.1
port = 7650
password = itoopie
```

I2PControl предоставляет JSON-RPC API для получения статистики:

```javascript
// Пример запроса к I2PControl
const request = {
  id: 1,
  method: "RouterInfo",
  params: {
    "i2p.router.uptime": "",
    "i2p.router.net.tunnels.participating": "",
    "i2p.router.netdb.knownpeers": ""
  },
  jsonrpc: "2.0"
};

const response = await fetch('http://127.0.0.1:7650', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
});
```

Однако, I2PControl используется редко и может быть отключен по умолчанию.

## 🔌 Другие порты

- **HTTP Proxy**: `4444` - HTTP прокси для доступа к .i2p сайтам
- **SOCKS Proxy**: `4447` - SOCKS прокси для приложений
- **Web Console**: `7070` - Веб-консоль для мониторинга
- **I2PControl**: `7650` - JSON-RPC API (опционально)
- **SAM**: `7656` - SAM API для разработчиков
- **BOB**: `2827` - BOB API (устаревший)

## ✅ Текущая реализация

В нашем приложении мы используем:

1. **Порт 7070** для получения статистики через веб-консоль
2. **Парсинг HTML** для извлечения данных
3. **Автообновление** каждые 5 секунд

### Получаемые данные:

- ✅ **Uptime** - время работы демона
- ✅ **Network status** - статус сети
- ✅ **Tunnels** - количество туннелей
- ✅ **Routers** - количество роутеров
- ✅ **Received/Sent** - полученные/отправленные данные
- ✅ **Transit tunnels** - транзитные туннели
- ✅ **Client tunnels** - клиентские туннели
- ✅ **Data path** - путь к данным

## 🚀 Улучшения

Для более точной статистики можно:

1. **Включить I2PControl** и использовать JSON API
2. **Парсить дополнительные страницы** (tunnels, transports)
3. **Использовать SAM API** для программного доступа
4. **Мониторить лог-файлы** i2pd для событий

## 📖 Ссылки

- [Официальная документация i2pd](https://i2pd.readthedocs.io/en/latest/)
- [I2P Network Documentation](https://geti2p.net/ru/docs)
- [I2PControl Specification](https://geti2p.net/spec/i2pcontrol)
- [SAM API](https://geti2p.net/en/docs/api/samv3)

