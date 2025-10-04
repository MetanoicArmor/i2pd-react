// Типы событий для приложения

export const EVENT_TYPES = {
  // События демона
  DAEMON_START: 'daemon-start',
  DAEMON_STOP: 'daemon-stop',
  DAEMON_RESTART: 'daemon-restart',
  DAEMON_STATUS_CHANGED: 'daemon-status-changed',
  
  // События интерфейса
  OPEN_SETTINGS: 'open-settings',
  OPEN_ABOUT: 'open-about',
  CLOSE_MODAL: 'close-modal',
  THEME_CHANGED: 'theme-changed',
  LANGUAGE_CHANGED: 'language-changed',
  
  // События трея
  TRAY_CLICK: 'tray-click',
  TRAY_STATUS_UPDATE: 'tray-status-update',
  
  // События логов
  LOG_ADDED: 'log-added',
  LOGS_CLEARED: 'logs-cleared',
  
  // События настроек
  SETTINGS_SAVED: 'settings-saved',
  SETTINGS_LOADED: 'settings-loaded',
  
  // События ошибок
  ERROR_OCCURRED: 'error-occurred',
  WARNING_SHOWN: 'warning-shown',
  
  // События статистики
  STATS_UPDATED: 'stats-updated',
  NETWORK_STATS_CHANGED: 'network-stats-changed'
};

export const ACTION_TYPES = {
  // Действия с демоном
  START_DAEMON: 'START_DAEMON',
  STOP_DAEMON: 'STOP_DAEMON',
  RESTART_DAEMON: 'RESTART_DAEMON',
  CHECK_DAEMON_STATUS: 'CHECK_DAEMON_STATUS',
  
  // Действия с состоянием
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Действия с логами
  ADD_LOG: 'ADD_LOG',
  CLEAR_LOGS: 'CLEAR_LOGS',
  
  // Действия с настройками
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS',
  
  // Действия с UI
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE'
};

