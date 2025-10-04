// Константы для настроек приложения
export const SETTINGS_CATEGORIES = {
  GENERAL: 'general',
  NETWORK: 'network',
  ADVANCED: 'advanced',
  APPEARANCE: 'appearance',
  CONFIG: 'config'
};

export const DEFAULT_SETTINGS = {
  // Общие настройки
  autoStartDaemon: false,
  startMinimized: false,
  hideFromDock: false,
  minimizeToTray: true,
  closeToTray: true,
  
  // Сетевые настройки
  httpPort: 4444,
  socksPort: 4447,
  bandwidth: 'L',
  enableIPv6: false,
  enableUPnP: false,
  
  // Продвинутые настройки
  logLevel: 'info',
  updateInterval: 5,
  autoClearLogs: false,
  enableFloodfill: false,
  enableTransit: true,
  maxTransitTunnels: 10000,
  
  // Внешний вид
  theme: 'dark',
  language: 'ru',
  showNotifications: true,
  enableAnimations: true
};

export const BANDWIDTH_OPTIONS = [
  { value: 'L', label: 'L (32 KB/s)', description: 'Обычный узел' },
  { value: 'M', label: 'M (128 KB/s)', description: 'Средняя пропускная способность' },
  { value: 'H', label: 'H (512 KB/s)', description: 'Высокая пропускная способность' },
  { value: 'P', label: 'P (2 MB/s)', description: 'Максимальная пропускная способность' },
  { value: 'X', label: 'X (Unlimited)', description: 'Неограниченная пропускная способность' }
];

export const LOG_LEVEL_OPTIONS = [
  { value: 'debug', label: 'Debug', description: 'Все сообщения' },
  { value: 'info', label: 'Info', description: 'Информационные сообщения' },
  { value: 'warn', label: 'Warning', description: 'Предупреждения' },
  { value: 'error', label: 'Error', description: 'Только ошибки' },
  { value: 'critical', label: 'Critical', description: 'Критические ошибки' },
  { value: 'none', label: 'None', description: 'Отключить логирование' }
];

export const LANGUAGE_OPTIONS = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' }
];

export const THEME_OPTIONS = [
  { value: 'dark', label: 'Тёмная' },
  { value: 'light', label: 'Светлая' }
];

export const UPDATE_INTERVAL_OPTIONS = [
  { value: 1, label: '1 секунда' },
  { value: 3, label: '3 секунды' },
  { value: 5, label: '5 секунд' },
  { value: 10, label: '10 секунд' },
  { value: 15, label: '15 секунд' },
  { value: 30, label: '30 секунд' }
];

export const PORT_RANGES = {
  HTTP: { min: 1024, max: 65535 },
  SOCKS: { min: 1024, max: 65535 }
};

