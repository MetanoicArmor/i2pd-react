// Константы приложения
export const APP_CONFIG = {
  name: 'I2P Daemon GUI',
  version: '1.0.0',
  description: 'Кроссплатформенный GUI для управления I2P Daemon',
  author: 'I2P Community'
};

export const DAEMON_CONFIG = {
  defaultHttpPort: 4444,
  defaultSocksPort: 4447,
  defaultBandwidth: 'L',
  checkInterval: 15000, // 15 секунд
  autoStartDelay: 3000  // 3 секунды
};

export const UI_CONFIG = {
  animationDuration: 300,
  toastDuration: 4000,
  modalZIndex: 1000,
  maxLogEntries: 100
};

export const IPC_CHANNELS = {
  GET_APP_VERSION: 'get-app-version',
  GET_STORE_VALUE: 'get-store-value',
  SET_STORE_VALUE: 'set-store-value',
  CHECK_DAEMON_STATUS: 'check-daemon-status',
  START_DAEMON: 'start-daemon',
  STOP_DAEMON: 'stop-daemon',
  RESTART_DAEMON: 'restart-daemon',
  GET_DAEMON_VERSION: 'get-daemon-version',
  GET_DAEMON_NETWORK_INFO: 'get-daemon-network-info',
  OPEN_WEB_CONSOLE: 'open-web-console',
  UPDATE_TRAY_SETTINGS: 'update-tray-settings',
  UPDATE_TRAY_STATUS: 'update-tray-status',
  MINIMIZE_TO_TRAY: 'minimize-to-tray',
  SHOW_MESSAGE_BOX: 'show-message-box',
  SHOW_OPEN_DIALOG: 'show-open-dialog',
  SHOW_SAVE_DIALOG: 'show-save-dialog',
  OPEN_EXTERNAL: 'open-external'
};

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
};

export const BANDWIDTH_OPTIONS = [
  { value: 'L', label: 'L (32 KB/s)' },
  { value: 'M', label: 'M (128 KB/s)' },
  { value: 'H', label: 'H (512 KB/s)' },
  { value: 'P', label: 'P (2 MB/s)' }
];

export const LANGUAGE_OPTIONS = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' }
];

export const THEME_OPTIONS = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' }
];

