const { contextBridge, ipcRenderer } = require('electron');

// Предоставляем безопасный API для React приложения
contextBridge.exposeInMainWorld('electronAPI', {
  // Управление демоном
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  
  // Слушатели событий
  on: (channel, callback) => {
    const validChannels = [
      'daemon-start',
      'daemon-stop', 
      'daemon-restart',
      'open-settings',
      'status-updated'
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
