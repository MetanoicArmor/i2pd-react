import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Переводы
const resources = {
  en: {
    translation: {
      // Основные элементы
      "I2P Daemon GUI": "I2P Daemon GUI",
      "Running": "Running",
      "Stopped": "Stopped",
      "Uptime": "Uptime",
      "Connections": "Connections",
      "Network Statistics": "Network Statistics",
      "Manage Daemon": "Manage Daemon",
      "Information": "Information",
      "System Logs": "System Logs",
      "Received": "Received",
      "Sent": "Sent",
      "Tunnels": "Tunnels",
      "Routers": "Routers",
      "Inbound tunnels": "Inbound tunnels",
      "Outbound tunnels": "Outbound tunnels",
      "NetDB size": "NetDB size",
      "Memory": "Memory",
      "Packets received": "Packets received",
      "Packets sent": "Packets sent",
      "Yes": "Yes",
      "No": "No",
      
      // Кнопки управления
      "Start": "Start",
      "Stop": "Stop",
      "Restart": "Restart",
      "Settings": "Settings",
      "Refresh": "Refresh",
      "Clear": "Clear",
      "Minimize to Tray": "Minimize to Tray",
      "Status": "Status",
      "Operation": "Operation",
      "In progress": "In progress",
      "Enabled": "Enabled",
      "Disabled": "Disabled",
      
      // Настройки
      "Network Configuration": "Network Configuration",
      "HTTP Proxy Port": "HTTP Proxy Port",
      "SOCKS5 Proxy Port": "SOCKS5 Proxy Port",
      "Bandwidth": "Bandwidth",
      "Save": "Save",
      
      // Автоматизация
      "Automation": "Automation",
      "Application Auto-start": "Application Auto-start",
      "Auto-start Daemon": "Auto-start Daemon",
      "Start Minimized": "Start Minimized",
      
      // Интерфейс
      "Interface": "Interface",
      "Application Language": "Application Language",
      "Language": "Language",
      "Russian": "Russian",
      "English": "English",
      "App Theme": "App Theme",
      "Light": "Light",
      "Dark": "Dark",
      
      // Логи
      "System Logs": "System Logs",
      "System ready": "System ready",
      "Logs will appear when daemon starts": "Logs will appear when daemon starts",
      
      // О программе
      "About": "About",
      "Modern GUI for managing I2P Daemon": "Modern GUI for managing I2P Daemon",
      "Built with React & Electron": "Built with React & Electron",
      "Cross-platform • Modern UI": "Cross-platform • Modern UI",
      
      // Трей меню
      "Start daemon": "Start daemon",
      "Stop daemon": "Stop daemon",
      "Restart daemon": "Restart daemon",
      "Web Console": "Web Console",
      "Show Window": "Show Window",
      "Hide to Tray": "Hide to Tray",
      "Quit": "Quit",
      "Status: Ready": "Status: Ready",
      "Status: Running": "Status: Running",
      "Status: Stopped": "Status: Stopped",
      
      // Сообщения
      "Starting I2P daemon...": "Starting I2P daemon...",
      "Stopping I2P daemon...": "Stopping I2P daemon...",
      "I2P daemon already running": "I2P daemon already running",
      "Daemon started successfully": "Daemon started successfully",
      "Daemon stopped successfully": "Daemon stopped successfully",
      "Operation already in progress": "Operation already in progress",
      "Logs cleared": "Logs cleared",
      "Settings saved": "Settings saved",
      "Error": "Error",
      "Success": "Success",
      "Warning": "Warning",
      "Info": "Info",
      "Debug": "Debug"
    }
  },
  ru: {
    translation: {
      // Основные элементы
      "I2P Daemon GUI": "I2P Daemon GUI",
      "Running": "Работает",
      "Stopped": "Остановлен",
      "Uptime": "Время работы",
      "Connections": "Подключения",
      "Network Statistics": "Сетевая статистика",
      "Manage Daemon": "Управление демоном",
      "Information": "Информация",
      "System Logs": "Логи",
      "Received": "Получено",
      "Sent": "Отправлено",
      "Tunnels": "Туннели",
      "Routers": "Роутеры",
      "Inbound tunnels": "Входящие туннели",
      "Outbound tunnels": "Исходящие туннели",
      "NetDB size": "NetDB размер",
      "Memory": "Память",
      "Packets received": "Пакеты получено",
      "Packets sent": "Пакеты отправлено",
      "Yes": "Да",
      "No": "Нет",
      
      // Кнопки управления
      "Start": "Запустить",
      "Stop": "Остановить",
      "Restart": "Перезапустить",
      "Settings": "Настройки",
      "Refresh": "Обновить",
      "Clear": "Очистить",
      "Minimize to Tray": "Свернуть в трей",
      "Status": "Статус",
      "Operation": "Операция",
      "In progress": "Выполняется...",
      "Enabled": "Включён",
      "Disabled": "Выключен",
      
      // Настройки
      "Network Configuration": "Сетевая конфигурация",
      "HTTP Proxy Port": "Порт HTTP прокси",
      "SOCKS5 Proxy Port": "Порт SOCKS5 прокси",
      "Bandwidth": "Пропускная способность",
      "Save": "Сохранить",
      
      // Автоматизация
      "Automation": "Автоматизация",
      "Application Auto-start": "Автозапуск приложения",
      "Auto-start Daemon": "Автозапуск демона",
      "Start Minimized": "Запускать свернутым",
      
      // Интерфейс
      "Interface": "Интерфейс",
      "Application Language": "Язык приложения",
      "Language": "Язык",
      "Russian": "Русский",
      "English": "English",
      "App Theme": "Тема приложения",
      "Light": "Светлая",
      "Dark": "Тёмная",
      
      // Логи
      "System Logs": "Логи системы",
      "System ready": "Система готова к работе",
      "Logs will appear when daemon starts": "Логи появятся при запуске демона",
      
      // О программе
      "About": "О программе",
      "Modern GUI for managing I2P Daemon": "Современный GUI для управления I2P Daemon",
      "Built with React & Electron": "Разработано на React & Electron",
      "Cross-platform • Modern UI": "Кроссплатформенность • Современный UI",
      
      // Трей меню
      "Start daemon": "Запустить daemon",
      "Stop daemon": "Остановить daemon",
      "Restart daemon": "Перезапустить daemon",
      "Web Console": "Веб-консоль",
      "Show Window": "Показать окно",
      "Hide to Tray": "Свернуть в трей",
      "Quit": "Выйти",
      "Status: Ready": "Статус: Готов",
      "Status: Running": "Статус: Запущен",
      "Status: Stopped": "Статус: Остановлен",
      
      // Сообщения
      "Starting I2P daemon...": "Запуск I2P daemon...",
      "Stopping I2P daemon...": "Остановка I2P daemon...",
      "I2P daemon already running": "I2P daemon уже запущен",
      "Daemon started successfully": "Демон успешно запущен",
      "Daemon stopped successfully": "Демон успешно остановлен",
      "Operation already in progress": "Операция уже выполняется",
      "Logs cleared": "Логи очищены",
      "Settings saved": "Настройки сохранены",
      "Error": "Ошибка",
      "Success": "Успех",
      "Warning": "Предупреждение",
      "Info": "Информация",
      "Debug": "Отладка"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

