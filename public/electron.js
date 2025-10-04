const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage } = require('electron');
const http = require('http');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const Store = require('electron-store');

// Инициализация хранилища
const store = new Store();

// Переменные
let mainWindow;
let tray;
let daemonProcess = null;
let daemonPID = null;

// Проверка на dev режим
const isDev = process.env.ELECTRON_IS_DEV === '1';

// Создание главного окна
function createWindow() {
  // Иконка окна
  const windowIconPath = path.join(__dirname, 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#1C1C1E',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: true,
    icon: fs.existsSync(windowIconPath) ? windowIconPath : undefined
  });

  // Устанавливаем иконку в Dock на macOS
  try {
    if (process.platform === 'darwin') {
      const dockIconPath = path.join(__dirname, 'icon.png');
      if (fs.existsSync(dockIconPath) && app.dock && typeof app.dock.setIcon === 'function') {
        // Генерируем значок с закругленными углами в стиле macOS
        createRoundedImageFromPng(dockIconPath, 256, Math.round(256 * 0.22))
          .then((rounded) => {
            if (rounded && !rounded.isEmpty()) {
              app.dock.setIcon(rounded);
            }
          })
          .catch(() => {
            const dockImage = nativeImage.createFromPath(dockIconPath);
            if (dockImage && !dockImage.isEmpty()) {
              app.dock.setIcon(dockImage);
            }
          });
      }
    }
  } catch (e) {
    console.log('Failed to set Dock icon:', e.message);
  }

  // URL для загрузки
  const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;

  // Загрузка приложения
  const loadApp = async () => {
    try {
      console.log('Trying to load:', startUrl);
      await mainWindow.loadURL(startUrl);
      console.log('Successfully loaded React app');
    } catch (error) {
      console.error('Failed to load React app:', error);
      
      const errorHtml = `
        <html>
          <head>
            <meta charset="utf-8" />
            <title>I2P Daemon GUI</title>
          </head>
          <body style="background: #1C1C1E; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; text-align: center;">
            <h1>I2P Daemon GUI</h1>
            <p style="color: #ff6b6b;">Ошибка загрузки React приложения</p>
            <p>React dev server не запущен или недоступен</p>
            <div style="background: #333; padding: 20px; border-radius: 10px; margin: 20px; text-align: left;">
              <p><strong>Решение:</strong></p>
              <ol>
                <li>Откройте терминал в папке проекта</li>
                <li>Выполните команду: <code style="background: #555; padding: 5px; border-radius: 3px;">npm start</code></li>
                <li>Дождитесь сообщения "Compiled successfully!"</li>
                <li>Перезапустите Electron</li>
              </ol>
            </div>
            <p style="color: #888;">Или запустите: <code style="background: #555; padding: 5px; border-radius: 3px;">./start.sh</code></p>
          </body>
        </html>
      `;
      
      await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
    }
  };

  loadApp();

  // События окна
  mainWindow.once('ready-to-show', () => {
    console.log('Electron window ready to show');
    mainWindow.show();
    console.log('Electron window shown and focused');
  });

  mainWindow.webContents.once('did-finish-load', () => {
    console.log('Electron window content loaded');
    
    // Проверяем, что React приложение загрузилось
    mainWindow.webContents.executeJavaScript(`
      try {
        console.log('Checking React app...');
        console.log('Document ready state:', document.readyState);
        const rootElement = document.getElementById('root');
        console.log('React root element:', rootElement);
        if (rootElement) {
          console.log('React root content:', rootElement.innerHTML.substring(0, 200) + '...');
        }
      } catch (error) {
        console.error('Error checking React app:', error);
      }
    `).catch(error => {
      console.error('Failed to execute JavaScript:', error);
    });
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('close', (event) => {
    if (isDev) {
      app.quit();
    } else {
      // Если нет трея, закрытие окна завершает приложение
      if (!tray) {
        app.quit();
        return;
      }
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Создание трея
  createTray();
}

// Создание трея
async function createTray() {
  try {
    const iconPath = path.join(__dirname, 'tray-icon.png');
    let image = null;

    // Пытаемся загрузить с диска валидный PNG
    if (fs.existsSync(iconPath)) {
      try {
        const stats = fs.statSync(iconPath);
        if (stats && stats.size >= 512) {
          const fileImage = nativeImage.createFromPath(iconPath);
          if (fileImage && !fileImage.isEmpty()) {
            image = fileImage;
          }
        } else {
          console.log('Tray icon too small, will use fallback');
        }
      } catch (_) {
        console.log('Tray icon read failed, will use fallback');
      }
    } else {
      console.log('Tray icon not found, will use fallback');
    }

    // Попытка: SVG из корня репозитория (предпочтительно)
    if (!image) {
      const svgPath = path.join(__dirname, '..', 'theatermasks.fill.svg');
      if (fs.existsSync(svgPath)) {
        try {
          image = await createImageFromSvg(svgPath, 22);
        } catch (e) {
          console.log('SVG to tray conversion failed, will use fallback');
        }
      }
    }

    // Фолбэк: встроенная иконка (22x22) через base64
    if (!image) {
      const fallbackBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsSAAALEgHS3X78AAABF0lEQVQ4y+2VMU7CQBBF3yqC1cAE3kB2Qh0h0cJ0gk0t0Gg1sR2M3kQm4mZ9r8aC0m1t2gQp6j8Qm8f0m0bV9j8QbN8i8g0qH7wYI0b8eN0m1b1m4mRr2w5H8iI6Yw9i3yQkJk8m3tZ0sJk4mQyVa0J2i4r8y7v+g9i1wB4mB+oihqg1Gdq7kKfBf0qk8S2y2mIu2gqKXySx5xkYqjZQmKQ2c7r2r7JHVk7wz3m8c9gq5vJmS6wC0sXthxg2y9yJXbH3wJY0K1k0pQGxfyC0A2mZ4k7aZqk2QmQ4iQ7ADxZqfF5jY6YyG+S6mBz7s8Aq3q9xkC7m4wq3m6wH3bH3v6wA7nN3zX9h0H5wM3E2bD7A/Jp3zv9gJ3G7oG0m6Hk9s7bAAAAAElFTkSuQmCC';
      image = nativeImage.createFromDataURL(`data:image/png;base64,${fallbackBase64}`).resize({ width: 22, height: 22 });
    }

    tray = new Tray(image);
    updateTrayStatus('Stopped');
    
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  } catch (error) {
    console.error('Failed to create tray:', error);
  }
}

// Рендерим SVG в offscreen-окне и делаем nativeImage
function createImageFromSvg(svgFilePath, size = 22) {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      width: size,
      height: size,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        offscreen: true,
        backgroundThrottling: false
      }
    });

    const fileUrl = `file://${svgFilePath}`;

    win.webContents.once('did-finish-load', async () => {
      try {
        const image = await win.webContents.capturePage({ x: 0, y: 0, width: size, height: size });
        win.destroy();
        const resized = image.resize({ width: size, height: size });
        resolve(resized);
      } catch (e) {
        win.destroy();
        reject(e);
      }
    });

    win.webContents.once('did-fail-load', (_e, code, desc) => {
      try { win.destroy(); } catch (_) {}
      reject(new Error(`Failed to load SVG: ${code} ${desc}`));
    });

    win.loadURL(fileUrl);
  });
}

// Создаем картинку с закругленными углами из PNG
function createRoundedImageFromPng(pngPath, size = 256, radius = 56) {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      width: size,
      height: size,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        offscreen: true,
        backgroundThrottling: false
      }
    });

    // Встраиваем PNG в data URL, чтобы гарантировать загрузку изображения
    let base64 = '';
    try {
      const buf = fs.readFileSync(pngPath);
      base64 = buf.toString('base64');
    } catch (e) {
      reject(e);
      return;
    }

    const html = `
      <html>
        <body style="margin:0;background:transparent;">
          <div id="wrap" style="width:${size}px;height:${size}px;border-radius:${radius}px;overflow:hidden;">
            <img id="img" src="data:image/png;base64,${base64}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
          </div>
          <script>
            const img = document.getElementById('img');
            if (img.complete) {
              document.title = 'ready';
            } else {
              img.onload = () => { document.title = 'ready'; };
              img.onerror = () => { document.title = 'error'; };
            }
          </script>
        </body>
      </html>
    `;

    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    win.webContents.once('did-finish-load', async () => {
      try {
        // Ждем, пока <img> реально загрузится
        await win.webContents.executeJavaScript(`
          new Promise((resolve) => {
            if (document.title === 'ready') return resolve();
            const iv = setInterval(() => {
              if (document.title === 'ready') { clearInterval(iv); resolve(); }
            }, 20);
            setTimeout(() => { clearInterval(iv); resolve(); }, 300);
          })
        `);
        const image = await win.webContents.capturePage({ x: 0, y: 0, width: size, height: size });
        try { win.destroy(); } catch (_) {}
        resolve(image);
      } catch (e) {
        try { win.destroy(); } catch (_) {}
        reject(e);
      }
    });

    win.webContents.once('did-fail-load', (_e, code, desc) => {
      try { win.destroy(); } catch (_) {}
      reject(new Error(`Failed to render rounded icon: ${code} ${desc}`));
    });
  });
}

// Обновление статуса трея
function updateTrayStatus(status) {
  if (!tray) {
    console.log('Tray not initialized, skipping status update');
    return;
  }
  
  const isRunning = status === 'Running';
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Статус: ${isRunning ? 'Запущен' : 'Остановлен'}`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Запустить daemon',
      type: 'checkbox',
      checked: isRunning,
      click: () => {
        if (!isRunning) {
          // Запускаем демон
          startDaemonInternal();
        }
      }
    },
    {
      label: 'Остановить daemon',
      click: () => {
        if (isRunning) {
          // Останавливаем демон
          stopDaemonInternal();
        }
      }
    },
    {
      label: 'Перезапустить daemon',
      click: () => {
        // Перезапускаем демон
        if (isRunning) {
          stopDaemonInternal().then(() => {
            setTimeout(() => {
              startDaemonInternal();
            }, 2000);
          });
        } else {
          startDaemonInternal();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Настройки',
      accelerator: 'CmdOrCtrl+,',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          // Отправляем событие для открытия настроек
          mainWindow.webContents.send('open-settings');
        }
      }
    },
    {
      label: 'Веб-консоль',
      click: () => {
        // Открываем веб-консоль i2pd
        shell.openExternal('http://127.0.0.1:7070');
      }
    },
    {
      label: 'Показать окно',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Свернуть в трей',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    },
    {
      label: 'Выйти',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
}

// Получение и парсинг статистики из веб-консоли i2pd (порт 7070)
function parseI2pdWebconsole(html) {
  const pick = (re) => {
    const m = html.match(re);
    return m ? m[1] : undefined;
  };

  const num = (re) => {
    const v = pick(re);
    return v ? parseInt(v, 10) : 0;
  };

  const str = (re) => pick(re) || '';

  const uptime = str(/Uptime:\s*(?:<\/b>\s*)?(\d+:\d+:\d+)/i);
  const activeTunnels = num(/Tunnels:\s*(?:<\/b>\s*)?(\d+)/i);
  const peerCount = num(/Routers:\s*(?:<\/b>\s*)?(\d+)/i);
  const bytesReceived = (() => {
    const m = html.match(/Received:\s*(?:<\/b>\s*)?([\d.]+)\s*(\w+)/i);
    return m ? `${m[1]} ${m[2]}` : '0 B';
  })();
  const bytesSent = (() => {
    const m = html.match(/Sent:\s*(?:<\/b>\s*)?([\d.]+)\s*(\w+)/i);
    return m ? `${m[1]} ${m[2]}` : '0 B';
  })();
  const inboundTunnels = num(/Client tunnels:\s*(?:<\/b>\s*)?(\d+)/i);
  const transitTunnels = num(/Transit tunnels:\s*(?:<\/b>\s*)?(\d+)/i);
  const networkStatus = str(/Network status:\s*(?:<\/b>\s*)?(\w+)/i) || 'Unknown';
  const dataPath = str(/Data path:\s*(?:<\/b>\s*)?([^\n<]+)/i) || '';

  return {
    success: true,
    uptime,
    activeTunnels,
    peerCount,
    bytesReceived,
    bytesSent,
    inboundTunnels,
    outboundTunnels: Math.max(activeTunnels - inboundTunnels, 0),
    transitTunnels,
    networkStatus,
    dataPath,
    lastUpdate: Date.now()
  };
}

async function getDaemonStats() {
  return await new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:7070', (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = parseI2pdWebconsole(data);
          resolve(parsed);
        } catch (e) {
          resolve({ success: false, error: e.message });
        }
      });
    });
    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

// Поиск исполняемого файла i2pd
function findI2pdExecutable() {
  const platform = process.platform;
  let possiblePaths = [];
  
  if (platform === 'darwin') {
    // macOS: ищем в папке Mac
    possiblePaths = [
      path.join(__dirname, '..', 'Mac', 'i2pd'),
      path.join(__dirname, 'Mac', 'i2pd'),
      '/usr/local/bin/i2pd',
      '/opt/homebrew/bin/i2pd',
      '/usr/local/sbin/i2pd'
    ];
  } else if (platform === 'win32') {
    // Windows: ищем в папке Win
    possiblePaths = [
      path.join(__dirname, '..', 'Win', 'i2pd.exe'),
      path.join(__dirname, 'Win', 'i2pd.exe'),
      'C:\\Program Files\\i2pd\\i2pd.exe',
      'C:\\Program Files (x86)\\i2pd\\i2pd.exe'
    ];
  } else {
    // Linux: ищем в папке Lin
    possiblePaths = [
      path.join(__dirname, '..', 'Lin', 'i2pd'),
      path.join(__dirname, 'Lin', 'i2pd'),
      '/usr/local/bin/i2pd',
      '/usr/bin/i2pd',
      '/usr/local/sbin/i2pd',
      '/usr/sbin/i2pd',
      path.join(process.env.HOME || '', '.local', 'bin', 'i2pd')
    ];
  }

  for (const execPath of possiblePaths) {
    if (fs.existsSync(execPath)) {
      console.log(`Found i2pd executable at: ${execPath}`);
      return execPath;
    }
  }

  console.error('i2pd executable not found in any of the expected locations');
  return null;
}

// Внутренняя функция для проверки статуса
async function checkDaemonStatusInternal() {
  try {
    const executablePath = findI2pdExecutable();
    if (!executablePath) {
      return { success: false, error: 'i2pd не найден в системе' };
    }

    return new Promise((resolve) => {
      exec(`ps aux | grep 'i2pd.*--conf.*i2pd.conf' | grep -v grep | awk '{print $2}' | head -1`, (error, stdout) => {
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

        const pid = stdout.trim();
        resolve({ 
          success: true, 
          isRunning: true, 
          pid: parseInt(pid),
          uptime: '01:23:45',
          peerCount: Math.floor(Math.random() * 100) + 50,
          bytesReceived: Math.floor(Math.random() * 1000000),
          bytesSent: Math.floor(Math.random() * 1000000),
          activeTunnels: Math.floor(Math.random() * 10) + 5,
          routerInfos: Math.floor(Math.random() * 1000) + 500
        });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Регистрация IPC обработчиков
const registeredHandlers = new Set();

function registerHandler(channel, handler) {
  if (registeredHandlers.has(channel)) {
    console.log(`Handler for ${channel} already registered, skipping`);
    return;
  }
  
  try {
    ipcMain.handle(channel, handler);
    registeredHandlers.add(channel);
    console.log(`Handler for ${channel} registered successfully`);
  } catch (error) {
    console.error(`Failed to register handler for ${channel}:`, error);
  }
}

// Регистрация всех обработчиков
registerHandler('get-app-version', () => {
  return app.getVersion();
});

registerHandler('get-store-value', (event, key) => {
  return store.get(key);
});

registerHandler('set-store-value', (event, key, value) => {
  // electron-store требует delete() для очистки значений
  if (value === null || typeof value === 'undefined') {
    try {
      store.delete(key);
      return true;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  store.set(key, value);
  return true;
});

registerHandler('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

registerHandler('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

registerHandler('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

registerHandler('open-external', (event, url) => {
  shell.openExternal(url);
});

registerHandler('update-tray-status', (event, status) => {
  updateTrayStatus(status);
});

registerHandler('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

registerHandler('check-daemon-status', async () => {
  return await checkDaemonStatusInternal();
});

registerHandler('start-daemon', async () => {
  try {
    const executablePath = findI2pdExecutable();
    if (!executablePath) {
      return { success: false, error: 'i2pd не найден в системе' };
    }

    // Проверяем, не запущен ли уже демон
    const statusResult = await checkDaemonStatusInternal();
    if (statusResult.isRunning) {
      console.log('Daemon is already running, skipping start');
      return { success: false, error: 'Демон уже запущен' };
    }

    // Дополнительная проверка через ps
    return new Promise((resolve) => {
      exec(`ps aux | grep 'i2pd.*--conf.*i2pd.conf' | grep -v grep`, (error, stdout) => {
        if (stdout.trim()) {
          console.log('Daemon process found via ps, skipping start');
          resolve({ success: false, error: 'Демон уже запущен' });
          return;
        }

        // Запускаем демон
        daemonProcess = spawn(executablePath, ['--conf=i2pd.conf', '--daemon'], {
          detached: true,
          stdio: 'ignore'
        });

        daemonProcess.unref();
        daemonPID = daemonProcess.pid;

        // Ждем немного и проверяем статус
        setTimeout(async () => {
          const status = await checkDaemonStatusInternal();
          if (status.isRunning) {
            updateTrayStatus('Running');
          }
        }, 2000);

        resolve({ success: true, pid: daemonPID });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

async function stopDaemonInternal() {
  try {
    return await new Promise((resolve) => {
      exec(`ps aux | grep 'i2pd.*--conf.*i2pd.conf' | grep -v grep | awk '{print $2}' | head -1`, (error, stdout) => {
        if (error || !stdout.trim()) {
          resolve({ success: true, message: 'Демон не запущен' });
          return;
        }
        const pid = stdout.trim();
        exec(`kill ${pid}`, (killError) => {
          if (killError) {
            resolve({ success: false, error: killError.message });
          } else {
            updateTrayStatus('Stopped');
            resolve({ success: true, message: 'Демон остановлен' });
          }
        });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

registerHandler('stop-daemon', async () => {
  return await stopDaemonInternal();
});

registerHandler('get-daemon-version', async () => {
  try {
    console.log('🔍 Получение версии демона из веб-консоли...');
    
    // Сначала проверяем, запущен ли демон
    const status = await checkDaemonStatusInternal();
    if (!status.isRunning) {
      console.log('❌ Демон не запущен, версия недоступна');
      return { success: false, error: 'Демон не запущен' };
    }
    
    // Получаем версию только из веб-консоли
    return new Promise((resolve) => {
      exec(`curl -s -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" http://127.0.0.1:7070`, (error, stdout) => {
        if (error) {
          console.log('❌ Ошибка curl:', error.message);
          resolve({ success: false, error: 'Ошибка доступа к веб-консоли' });
          return;
        }
        
        const html = stdout;
        console.log('📄 HTML получен через curl, длина:', html.length);
        
        // Ищем версию в HTML веб-консоли
        const versionMatch = html.match(/<b>Version:<\/b>\s*([0-9]+\.[0-9]+\.[0-9]+)/i);
        console.log('🔍 Результат поиска версии:', versionMatch);
        
        if (versionMatch) {
          const shortVersion = versionMatch[1];
          console.log('✅ Версия найдена в веб-консоли:', shortVersion);
          resolve({ success: true, version: shortVersion });
        } else {
          console.log('❌ Версия не найдена в HTML');
          resolve({ success: false, error: 'Версия не найдена в веб-консоли' });
        }
      });
    });
  } catch (error) {
    console.log('❌ Ошибка получения версии:', error.message);
    return { success: false, error: 'Ошибка доступа к веб-консоли' };
  }
});

// IPC: реальная статистика с веб‑консоли (без CORS)
registerHandler('get-daemon-stats', async () => {
  try {
    const stats = await getDaemonStats();
    return stats;
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// IPC: смена темы окна (фон/вибрация)
registerHandler('set-window-theme', (_event, theme) => {
  try {
    if (!mainWindow) return false;
    const color = theme === 'light' ? '#FFFFFF' : '#1C1C1E';
    mainWindow.setBackgroundColor(color);
    // При желании можно сменить тип вибрации
    if (process.platform === 'darwin') {
      try {
        mainWindow.setVibrancy(theme === 'light' ? 'popover' : 'under-window');
      } catch (_) {}
    }
    return true;
  } catch (e) {
    return { success: false, error: e.message };
  }
});
// IPC: корректное завершение приложения (с остановкой демона)
registerHandler('quit-app', async () => {
  try {
    await stopDaemonInternal();
  } catch (_) {}
  app.quit();
});

// Создание меню приложения
function createMenu() {
  const template = [
    {
      label: 'I2P Daemon GUI',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// События приложения
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Пытаемся остановить демон при выходе
  try { await stopDaemonInternal(); } catch (_) {}
  if (daemonProcess) {
    try { daemonProcess.kill(); } catch (_) {}
  }
});