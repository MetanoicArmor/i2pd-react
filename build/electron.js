const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');

// Инициализация хранилища настроек
const store = new Store();

let mainWindow;
let tray;
let isQuitting = false;

// Создание главного окна
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 950,
    height: 700,
    minWidth: 650,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false, // Не показываем окно сразу
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active'
  });

  // Загружаем React приложение
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Показываем окно когда готово
  mainWindow.once('ready-to-show', () => {
    // Проверяем настройку "Запускать свернутым"
    const startMinimized = store.get('startMinimized', false);
    if (!startMinimized) {
      mainWindow.show();
    }
  });

  // Обработка закрытия окна
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  // Обработка закрытия приложения
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Создаем трей после создания окна
  createTray();
}

// Создание системного трея
function createTray() {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Статус: Готов',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Запустить daemon',
      click: () => {
        mainWindow.webContents.send('daemon-start');
      }
    },
    {
      label: 'Остановить daemon',
      click: () => {
        mainWindow.webContents.send('daemon-stop');
      }
    },
    {
      label: 'Перезапустить daemon',
      click: () => {
        mainWindow.webContents.send('daemon-restart');
      }
    },
    { type: 'separator' },
    {
      label: 'Настройки',
      accelerator: 'CmdOrCtrl+,',
      click: () => {
        showMainWindow();
        mainWindow.webContents.send('open-settings');
      }
    },
    {
      label: 'Веб-консоль',
      click: () => {
        shell.openExternal('http://127.0.0.1:7070');
      }
    },
    {
      label: 'Показать окно',
      click: showMainWindow
    },
    { type: 'separator' },
    {
      label: 'Свернуть в трей',
      click: () => {
        mainWindow.hide();
      }
    },
    {
      label: 'Выйти',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('I2P Daemon GUI');
  
  // Клик по трею показывает/скрывает окно
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      showMainWindow();
    }
  });
}

// Показать главное окно
function showMainWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
}

// Обновить статус в трее
function updateTrayStatus(status) {
  if (tray && tray.getContextMenu()) {
    const menu = tray.getContextMenu();
    menu.items[0].label = `Статус: ${status}`;
    tray.setContextMenu(menu);
  }
}

// IPC обработчики
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});

// Обновление трея из React
ipcMain.handle('update-tray-status', (event, status) => {
  updateTrayStatus(status);
});

// Управление I2P демоном
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

let daemonProcess = null;
let daemonPID = null;

// Поиск исполняемого файла i2pd
function findI2pdExecutable() {
  const possiblePaths = [
    path.join(__dirname, '../i2pd'), // В папке приложения
    path.join(process.resourcesPath, 'i2pd'), // В ресурсах
    '/usr/local/bin/i2pd',
    '/opt/homebrew/bin/i2pd',
    '/usr/bin/i2pd',
    'i2pd' // В PATH
  ];

  for (const execPath of possiblePaths) {
    try {
      if (fs.existsSync(execPath)) {
        return execPath;
      }
    } catch (error) {
      continue;
    }
  }

  // Проверяем доступность в PATH
  try {
    exec('which i2pd', (error, stdout) => {
      if (!error && stdout.trim()) {
        return stdout.trim();
      }
    });
  } catch (error) {
    // Игнорируем ошибки
  }

  return null;
}

// Проверка статуса демона
ipcMain.handle('check-daemon-status', async () => {
  try {
    const executablePath = findI2pdExecutable();
    if (!executablePath) {
      return { success: false, error: 'i2pd не найден в системе' };
    }

    return new Promise((resolve) => {
      exec(`ps aux | grep 'i2pd.*--daemon' | grep -v grep`, (error, stdout) => {
        if (error || !stdout.trim()) {
          resolve({
            success: true,
            isRunning: false,
            uptime: '00:00:00',
            peerCount: 0,
            bytesReceived: 0,
            bytesSent: 0,
            activeTunnels: 0,
            routerInfos: 0
          });
          return;
        }

        // Парсим PID из вывода
        const lines = stdout.trim().split('\n');
        const pid = lines[0].split(/\s+/)[1];

        // Получаем статистику через веб-консоль
        getDaemonStats().then(stats => {
          resolve({
            success: true,
            isRunning: true,
            pid: pid,
            ...stats
          });
        }).catch(() => {
          resolve({
            success: true,
            isRunning: true,
            pid: pid,
            uptime: '00:00:00',
            peerCount: 0,
            bytesReceived: 0,
            bytesSent: 0,
            activeTunnels: 0,
            routerInfos: 0
          });
        });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Запуск демона
ipcMain.handle('start-daemon', async () => {
  try {
    const executablePath = findI2pdExecutable();
    if (!executablePath) {
      return { success: false, error: 'i2pd не найден в системе' };
    }

    // Проверяем, не запущен ли уже демон
    const statusResult = await ipcMain.handle('check-daemon-status');
    if (statusResult.isRunning) {
      return { success: false, error: 'Демон уже запущен' };
    }

    // Запускаем демон
    daemonProcess = spawn(executablePath, ['--daemon'], {
      detached: true,
      stdio: 'ignore'
    });

    daemonProcess.unref();
    daemonPID = daemonProcess.pid;

    // Ждем немного и проверяем статус
    setTimeout(async () => {
      const status = await ipcMain.handle('check-daemon-status');
      if (status.isRunning) {
        updateTrayStatus('Running');
      }
    }, 2000);

    return { success: true, pid: daemonPID };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Остановка демона
ipcMain.handle('stop-daemon', async () => {
  try {
    return new Promise((resolve) => {
      exec(`ps aux | grep 'i2pd.*--daemon' | grep -v grep | awk '{print $2}' | head -1`, (error, stdout) => {
        if (error || !stdout.trim()) {
          resolve({ success: true, message: 'Демон не запущен' });
          return;
        }

        const pid = stdout.trim();
        
        // Отправляем SIGINT для корректного завершения
        exec(`kill -INT ${pid}`, (killError) => {
          if (killError) {
            // Если не удалось отправить SIGINT, используем SIGKILL
            exec(`kill -KILL ${pid}`, (forceKillError) => {
              if (forceKillError) {
                resolve({ success: false, error: 'Не удалось остановить демон' });
              } else {
                resolve({ success: true, message: 'Демон принудительно остановлен' });
              }
            });
          } else {
            resolve({ success: true, message: 'Демон остановлен' });
          }
        });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Получение статистики демона
function getDaemonStats() {
  return new Promise((resolve, reject) => {
    const http = require('http');
    
    const req = http.get('http://127.0.0.1:7070/api/router/info', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const stats = JSON.parse(data);
          resolve({
            uptime: formatUptime(stats.uptime || 0),
            peerCount: stats.peers || 0,
            bytesReceived: stats.bytesReceived || 0,
            bytesSent: stats.bytesSent || 0,
            activeTunnels: stats.tunnels || 0,
            routerInfos: stats.routerInfos || 0
          });
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Форматирование времени работы
function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Получение версии демона
ipcMain.handle('get-daemon-version', async () => {
  try {
    const executablePath = findI2pdExecutable();
    if (!executablePath) {
      return { success: false, error: 'i2pd не найден в системе' };
    }

    return new Promise((resolve) => {
      exec(`${executablePath} --version`, (error, stdout) => {
        if (error) {
          resolve({ success: false, error: error.message });
          return;
        }

        const version = stdout.trim().split('\n')[0];
        resolve({ success: true, version: version });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Сворачивание в трей
ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

// Создание меню приложения
function createMenu() {
  const template = [
    {
      label: 'I2P Daemon GUI',
      submenu: [
        {
          label: 'О программе',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'О программе',
              message: 'I2P Daemon GUI',
              detail: 'Кроссплатформенный GUI для управления I2P Daemon\nВерсия: ' + app.getVersion()
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Выйти',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Daemon',
      submenu: [
        {
          label: 'Запустить',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('daemon-start');
          }
        },
        {
          label: 'Остановить',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('daemon-stop');
          }
        },
        {
          label: 'Перезапустить',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.send('daemon-restart');
          }
        }
      ]
    },
    {
      label: 'Окно',
      submenu: [
        {
          label: 'Настройки',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Свернуть в трей',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            mainWindow.hide();
          }
        },
        {
          label: 'Показать главное окно',
          accelerator: 'CmdOrCtrl+M',
          click: showMainWindow
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Обработчики событий приложения
app.whenReady().then(() => {
  createWindow();
  createMenu();
  
  // Автообновление в продакшене
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  // На macOS приложения обычно остаются активными даже когда все окна закрыты
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // На macOS пересоздаем окно когда иконка в Dock нажата
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    showMainWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// Обработка автообновления
autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Обновление доступно',
    message: 'Доступна новая версия приложения. Оно будет обновлено при следующем запуске.',
    buttons: ['OK']
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Обновление готово',
    message: 'Обновление загружено. Приложение будет перезапущено для применения обновления.',
    buttons: ['Перезапустить сейчас', 'Позже']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

module.exports = { updateTrayStatus };
