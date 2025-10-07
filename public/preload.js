const { contextBridge, ipcRenderer } = require('electron');

console.log('🚀 PRELOAD.JS ЗАГРУЖЕН!');

// Предоставляем безопасный API для React приложения
contextBridge.exposeInMainWorld('electronAPI', {
  // Управление демоном
  invoke: (channel, ...args) => {
    const validChannels = [
      'get-app-version',
      'get-store-value',
      'set-store-value',
      'show-message-box',
      'show-open-dialog',
      'show-save-dialog',
      'open-external',
      'update-tray-status',
      'minimize-to-tray',
      'restart-daemon',
      'check-daemon-status',
      'start-daemon',
      'stop-daemon',
      'get-daemon-version',
      'get-daemon-network-info',
      'open-web-console',
      'update-tray-settings',
      'get-daemon-stats',
      'set-window-theme',
      'get-i2pd-config-dir',
      'read-config-file',
      'write-config-file',
      'write-settings-to-config',
      'set-window-zoom',
      'update-tray-settings',
      'quit-app',
      'test-tray-icons'
    ];
    
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    } else {
      console.error(`❌ Неразрешенный канал: ${channel}`);
      return Promise.reject(new Error(`Неразрешенный канал: ${channel}`));
    }
  },
  
  // Слушатели событий
  on: (channel, callback) => {
    const validChannels = [
      'daemon-start',
      'daemon-stop', 
      'daemon-restart',
      'open-settings',
      'status-updated',
      'settings-changed'
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },
  
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
  
  // Утилиты
  platform: process.platform,
  versions: process.versions
});

