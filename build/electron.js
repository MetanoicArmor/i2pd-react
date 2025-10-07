const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage } = require('electron');
const http = require('http');
const path = require('path');
const os = require('os');
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

  // Linux: иконка устанавливается через window icon

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

  // Обработчики событий окна для настроек трея
  mainWindow.on('minimize', (event) => {
    // Получаем настройки из store
    const store = new Store();
    const minimizeToTray = store.get('minimizeToTray', true);
    
    if (minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
      console.log('🔄 Окно свернуто в трей');
      
      // Показываем уведомление в трее для Linux/Windows
      if (process.platform !== 'darwin' && tray) {
        tray.displayBalloon({
          title: 'I2P Daemon GUI',
          content: 'Приложение свернуто в системный трей. Нажмите на иконку трея для восстановления окна.',
          icon: path.join(__dirname, 'tray-icon.png')
        });
      }
    }
  });

  mainWindow.on('close', (event) => {
    // Получаем настройки из store
    const store = new Store();
    const closeToTray = store.get('closeToTray', false);
    
    if (closeToTray && tray) {
      event.preventDefault();
      mainWindow.hide();
      console.log('🔄 Окно скрыто в трей при закрытии');
      
      // Показываем уведомление в трее для Linux/Windows
      if (process.platform !== 'darwin' && tray) {
        tray.displayBalloon({
          title: 'I2P Daemon GUI',
          content: 'Приложение скрыто в системный трей. Нажмите на иконку трея для восстановления окна.',
          icon: path.join(__dirname, 'tray-icon.png')
        });
      }
    } else {
      app.quit();
    }
  });

  // Создание трея
  createTray();
}

// Создание трея
async function createTray() {
  try {
    let image = null;

    // Список возможных путей к иконке трея
    const possibleIconPaths = [
      path.join(__dirname, 'tray-icon.png'),                    // В public/ (dev mode)
      path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'tray-icon.png'), // В упакованном приложении
      path.join(process.resourcesPath, 'public', 'tray-icon.png'), // Альтернативный путь
      path.join(__dirname, '..', 'public', 'tray-icon.png'),   // Из build/
      path.join(__dirname, 'icon.png'),                         // Основная иконка как fallback
    ];

    // Пытаемся загрузить PNG из возможных путей
    for (const iconPath of possibleIconPaths) {
      if (fs.existsSync(iconPath)) {
        try {
          const stats = fs.statSync(iconPath);
          if (stats && stats.size >= 512) {
            const fileImage = nativeImage.createFromPath(iconPath);
            if (fileImage && !fileImage.isEmpty()) {
              // Изменяем размер для трея (22x22 для macOS)
              image = fileImage.resize({ width: 22, height: 22 });
              console.log('✅ Tray icon loaded from:', iconPath);
              break;
            }
          }
        } catch (e) {
          console.log('⚠️ Failed to load tray icon from:', iconPath, e.message);
        }
      }
    }

    // Попытка: SVG из корня репозитория (предпочтительно)
    if (!image) {
      const svgPaths = [
        path.join(__dirname, '..', 'theatermasks.fill.svg'),
        path.join(process.resourcesPath, 'theatermasks.fill.svg'),
      ];
      
      for (const svgPath of svgPaths) {
        if (fs.existsSync(svgPath)) {
          try {
            image = await createImageFromSvg(svgPath, 22);
            console.log('✅ Tray icon created from SVG:', svgPath);
            break;
          } catch (e) {
            console.log('⚠️ SVG to tray conversion failed:', svgPath);
          }
        }
      }
    }

    // Фолбэк: встроенная иконка (22x22) через base64
    if (!image) {
      console.log('⚠️ Using fallback base64 tray icon');
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

// Тестовая функция для переключения иконок
let testIconCounter = 0;
function testTrayIcons() {
  if (!tray) return;
  
  testIconCounter = (testIconCounter + 1) % 2;
  const isRed = testIconCounter === 0;
  const iconPath = path.join(process.cwd(), isRed ? 'red-icon.png' : 'green-icon.png');
  const label = isRed ? 'КРАСНАЯ' : 'ЗЕЛЕНАЯ';
  
  console.log(`🧪 ТЕСТ: Переключаем на ${label} иконку:`, iconPath);
  
  try {
    if (fs.existsSync(iconPath)) {
      const image = nativeImage.createFromPath(iconPath);
      if (image && !image.isEmpty()) {
        tray.setImage(image);
        tray.setToolTip(`ТЕСТ - ${label}`);
        console.log(`✅ ТЕСТ: Иконка установлена - ${label}`);
      } else {
        console.log(`❌ ТЕСТ: Иконка пустая - ${label}`);
      }
    } else {
      console.log(`❌ ТЕСТ: Файл не найден - ${iconPath}`);
    }
  } catch (e) {
    console.log(`❌ ТЕСТ: Ошибка загрузки - ${e.message}`);
  }
}

// Обновление иконки трея в зависимости от статуса
function updateTrayIcon(isRunning) {
  if (!tray) return;
  
  console.log('🎭 updateTrayIcon called with isRunning:', isRunning);
  
  // Определяем пути к иконкам
  const isAppImage = process.env.APPIMAGE !== undefined;
  
  // Выбираем иконку в зависимости от состояния
  let iconName;
  if (isRunning) {
    iconName = 'theatermasks.fill.png'; // Запущенный демон
  } else {
    iconName = 'theatermasks.png'; // Остановленный демон
  }
  
  const iconPaths = [
    // Для AppImage
    ...(isAppImage ? [
      path.join(__dirname, iconName),
      path.join(__dirname, '..', iconName),
      path.join(process.resourcesPath, 'app', iconName),
    ] : []),
    // Для разработки
    path.join(process.cwd(), iconName),
    path.join(__dirname, iconName),
    path.join(__dirname, '..', iconName),
    // Дополнительные пути
    path.join(process.cwd(), 'build', iconName),
    path.join(__dirname, 'build', iconName),
    // Fallback на tray-icon.png
    path.join(__dirname, 'tray-icon.png'),
    path.join(process.cwd(), 'tray-icon.png'),
  ];
  
  let iconLoaded = false;
  
  console.log(`🔍 Ищем иконку "${iconName}" в ${iconPaths.length} путях:`);
  iconPaths.forEach((p, i) => console.log(`  ${i + 1}. ${p} (exists: ${fs.existsSync(p)})`));
  
  // Пытаемся загрузить иконку
  for (const iconPath of iconPaths) {
    if (fs.existsSync(iconPath)) {
      try {
        const image = nativeImage.createFromPath(iconPath);
        if (image && !image.isEmpty()) {
          tray.setImage(image);
          console.log(`✅ Tray icon (${isRunning ? 'running' : 'stopped'}) loaded from:`, iconPath);
          iconLoaded = true;
          break;
        }
      } catch (e) {
        console.log(`❌ Failed to load tray icon from:`, iconPath, e.message);
      }
    }
  }
  
  // Если не удалось загрузить иконку, используем fallback
  if (!iconLoaded) {
    console.log(`🔍 Looking for ${isRunning ? 'running' : 'stopped'} icon:`, theaterMasksPaths[0]);
    
    // Пытаемся использовать тестовые иконки как fallback
    const fallbackPath = path.join(process.cwd(), isRunning ? 'green-icon.png' : 'red-icon.png');
    if (fs.existsSync(fallbackPath)) {
      try {
        const image = nativeImage.createFromPath(fallbackPath);
        if (image && !image.isEmpty()) {
          tray.setImage(image);
          console.log(`✅ Tray icon (${isRunning ? 'running' : 'stopped'}) loaded from fallback:`, fallbackPath);
        }
      } catch (e) {
        console.log(`❌ Failed to load fallback icon:`, fallbackPath, e.message);
      }
    }
  }
  
  // Обновляем tooltip
  tray.setToolTip(`I2P Daemon GUI - ${isRunning ? 'Запущен' : 'Остановлен'}`);
}

// IPC handler для тестирования иконок
ipcMain.handle('test-tray-icons', () => {
  console.log('🧪 IPC: test-tray-icons invoked');
  testTrayIcons();
  return { success: true, message: 'Иконки переключены' };
});

// Обновление статуса трея
function updateTrayStatus(status) {
  if (!tray) {
    console.log('❌ Tray not initialized, skipping status update');
    return;
  }
  
  console.log('🎭 updateTrayStatus called with status:', status);
  
  const isRunning = status === 'Running' || status === true;
  console.log('🔍 Calculated isRunning:', isRunning);
  
  // Обновляем статус демона в store
  const store = new Store();
  store.set('daemonRunning', isRunning);
  console.log('💾 Updated daemonRunning in store:', isRunning);
  
  // Обновляем иконку трея
  console.log('🔄 Calling updateTrayIcon with isRunning:', isRunning);
  updateTrayIcon(isRunning);
  const minimizeToTray = store.get('minimizeToTray', true);
  const closeToTray = store.get('closeToTray', false);
  const startMinimized = store.get('startMinimized', false);
  const autoStartDaemon = store.get('autoStartDaemon', false);
  
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
      type: 'checkbox',
      checked: !isRunning,
      click: () => {
        if (isRunning) {
          // Останавливаем демон
          stopDaemonInternal();
        }
      }
    },
    {
      label: 'Перезапустить daemon',
      type: 'checkbox',
      checked: false,
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
      label: 'Показать окно',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
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
    { type: 'separator' },
    {
      label: 'Увеличить интерфейс в 2 раза',
      click: () => {
        console.log('🔍 Увеличиваем интерфейс из трея...');
        if (mainWindow) {
          mainWindow.webContents.setZoomFactor(2.0);
          console.log('✅ Интерфейс увеличен в 2 раза из трея');
        }
      }
    },
    {
      label: 'Сбросить масштаб интерфейса',
      click: () => {
        console.log('🔍 Сбрасываем масштаб из трея...');
        if (mainWindow) {
          mainWindow.webContents.setZoomFactor(1.0);
          console.log('✅ Масштаб сброшен из трея');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Выйти из приложения',
      click: async () => {
        console.log('🛑 Выход из приложения из трея...');
        // Останавливаем демон перед выходом
        if (isRunning) {
          await stopDaemonInternal();
        }
        // Принудительно завершаем приложение
        app.exit(0);
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  // Начальная иконка будет установлена при первом вызове updateTrayStatus
  
  // Обработчик двойного клика по иконке трея
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
        console.log('🔄 Окно скрыто двойным кликом по трею');
      } else {
        mainWindow.show();
        mainWindow.focus();
        console.log('🔄 Окно показано двойным кликом по трею');
      }
    }
  });
  
  // Настройка скрытия из Dock на macOS
  updateDockVisibility();
}

// Обновление видимости (для Linux не требуется)
function updateDockVisibility() {
  // На Linux управление видимостью не требуется
  console.log('🔄 Обновление видимости (Linux)');
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
  
  // Пытаемся загрузить информацию о платформе из файла
  let platformInfo = null;
  try {
    const platformInfoPath = path.join(__dirname, '..', 'platform-info.json');
    if (fs.existsSync(platformInfoPath)) {
      platformInfo = JSON.parse(fs.readFileSync(platformInfoPath, 'utf8'));
    }
  } catch (error) {
    console.log('⚠️ Не удалось загрузить platform-info.json для исполняемого файла');
  }
  
  // Если есть информация о платформе, проверяем указанный путь
  if (platformInfo && platformInfo.executablePath) {
    const fullExecutablePath = path.join(__dirname, '..', platformInfo.executablePath);
    if (fs.existsSync(fullExecutablePath)) {
      console.log(`⚙️ Используем исполняемый файл из platform-info.json: ${fullExecutablePath}`);
      return fullExecutablePath;
    }
  }
  
  // Linux: ищем в папке Lin
  const possiblePaths = [
    // В собранном приложении (extraResources)
    path.join(process.resourcesPath, 'Lin', 'i2pd'),
    // В режиме разработки
    path.join(__dirname, '..', 'Lin', 'i2pd'),
    path.join(__dirname, 'Lin', 'i2pd'),
    // Системные пути
    '/usr/local/bin/i2pd',
    '/usr/bin/i2pd',
    '/usr/local/sbin/i2pd',
    '/usr/sbin/i2pd',
    path.join(process.env.HOME || '', '.local', 'bin', 'i2pd')
  ];

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
      const configPath = path.join(getI2pdConfigDir(), 'i2pd.conf');
      exec(`ps aux | grep 'i2pd.*--conf.*${configPath}' | grep -v grep | awk '$1 == "'${process.env.USER}'" {print $2}' | head -1`, (error, stdout) => {
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

// IPC: обновление настроек трея
registerHandler('update-tray-settings', () => {
  // Получаем текущий статус демона
  const store = new Store();
  const isRunning = store.get('daemonRunning', false);
  updateTrayStatus(isRunning ? 'Running' : 'Stopped');
});


// IPC: перезапуск демона атомарно
registerHandler('restart-daemon', async () => {
  try {
    console.log('🔧 IPC: restart-daemon invoked');
    const stop = await stopDaemonInternal();
    console.log('🔧 IPC: restart-daemon stop result:', stop);
    // подождем немного перед стартом
    await new Promise(r => setTimeout(r, 1000));
    
    // Запускаем демон напрямую через внутреннюю функцию
    const executablePath = findI2pdExecutable();
    if (!executablePath) {
      throw new Error('i2pd не найден в системе');
    }
    
    const configDir = getI2pdConfigDir();
    const configPath = path.join(configDir, 'i2pd.conf');
    
    daemonProcess = spawn(executablePath, [`--conf=${configPath}`, '--daemon'], {
      detached: true,
      stdio: 'ignore',
      uid: process.getuid ? process.getuid() : undefined,
      gid: process.getgid ? process.getgid() : undefined
    });
    
    daemonProcess.unref();
    daemonPID = daemonProcess.pid;
    
    console.log('🔧 IPC: restart-daemon start result:', { success: true, pid: daemonPID });
    return { success: true, stop, start: { success: true, pid: daemonPID } };
  } catch (e) {
    console.error('❌ restart-daemon error:', e.message);
    return { success: false, error: e.message };
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
      const configPath = path.join(getI2pdConfigDir(), 'i2pd.conf');
      exec(`ps aux | grep 'i2pd.*--conf.*${configPath}' | grep -v grep | awk '$1 == "'${process.env.USER}'" {print $0}'`, (error, stdout) => {
        if (stdout.trim()) {
          console.log('Daemon process found via ps, skipping start');
          resolve({ success: false, error: 'Демон уже запущен' });
          return;
        }

        // Запускаем демон с абсолютным путем к конфигу
        const configPath = path.join(getI2pdConfigDir(), 'i2pd.conf');
        // Гарантируем наличие директории конфигов
        try { fs.mkdirSync(path.dirname(configPath), { recursive: true }); } catch (_) {}

        daemonProcess = spawn(executablePath, [`--conf=${configPath}`, '--daemon'], {
          detached: true,
          stdio: 'ignore',
          uid: process.getuid ? process.getuid() : undefined,
          gid: process.getgid ? process.getgid() : undefined
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

async function startDaemonInternal() {
  try {
    const executablePath = findI2pdExecutable();
    if (!executablePath) {
      console.error('i2pd не найден в системе');
      return;
    }

    // Проверяем, не запущен ли уже демон
    const statusResult = await checkDaemonStatusInternal();
    if (statusResult.isRunning) {
      console.log('Daemon is already running, skipping start');
      return;
    }

    // Дополнительная проверка через ps
    const configPath = path.join(getI2pdConfigDir(), 'i2pd.conf');
    exec(`ps aux | grep 'i2pd.*--conf.*${configPath}' | grep -v grep | awk '$1 == "'${process.env.USER}'" {print $0}'`, (error, stdout) => {
      if (stdout.trim()) {
        console.log('Daemon process found via ps, skipping start');
        return;
      }

      // Запускаем демон с абсолютным путем к конфигу
      const configPath = path.join(getI2pdConfigDir(), 'i2pd.conf');
      // Гарантируем наличие директории конфигов
      try { fs.mkdirSync(path.dirname(configPath), { recursive: true }); } catch (_) {}

      daemonProcess = spawn(executablePath, [`--conf=${configPath}`, '--daemon'], {
        detached: true,
        stdio: 'ignore',
        uid: process.getuid ? process.getuid() : undefined,
        gid: process.getgid ? process.getgid() : undefined
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

      console.log('🔧 IPC: start-daemon result:', { success: true, pid: daemonPID });
    });
  } catch (error) {
    console.error('❌ start-daemon error:', error.message);
  }
}

async function stopDaemonInternal() {
  try {
    return await new Promise((resolve) => {
      // Устанавливаем таймаут на 10 секунд
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Таймаут остановки демона' });
      }, 10000);

      const configPath = path.join(getI2pdConfigDir(), 'i2pd.conf');
      exec(`ps aux | grep 'i2pd.*--conf.*${configPath}' | grep -v grep | awk '$1 == "'${process.env.USER}'" {print $2}' | head -1`, (error, stdout) => {
        if (error || !stdout.trim()) {
          clearTimeout(timeout);
          resolve({ success: true, message: 'Демон не запущен' });
          return;
        }
        const pid = stdout.trim();
        
        // Проверяем, что процесс принадлежит текущему пользователю
        exec(`ps -o user= -p ${pid}`, (userError, userOut) => {
          if (userError || userOut.trim() !== process.env.USER) {
            clearTimeout(timeout);
            resolve({ success: false, error: 'Процесс принадлежит другому пользователю' });
            return;
          }

          // Сначала пробуем kill -9 (принудительная остановка)
          exec(`kill -9 ${pid}`, (killError) => {
            if (killError) {
              // Если kill -9 не сработал, пробуем pkill только для текущего пользователя
              exec(`pkill -9 -u ${process.env.USER} -f 'i2pd.*--conf.*${configPath}'`, (pkillError) => {
                clearTimeout(timeout);
                if (pkillError) {
                  resolve({ success: false, error: `Не удалось остановить демон: ${killError.message}` });
                } else {
                  updateTrayStatus('Stopped');
                  resolve({ success: true, message: 'Демон остановлен через pkill -9' });
                }
              });
            } else {
              clearTimeout(timeout);
              updateTrayStatus('Stopped');
              resolve({ success: true, message: 'Демон остановлен через kill -9' });
            }
          });
        });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

registerHandler('stop-daemon', async () => {
  console.log('🔧 IPC: stop-daemon invoked');
  const res = await stopDaemonInternal();
  console.log('🔧 IPC: stop-daemon result:', res);
  return res;
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

// IPC: получение информации о портах и пропускной способности из веб-консоли
registerHandler('get-daemon-network-info', async () => {
  try {
    console.log('🔍 Получение информации о сети из веб-консоли...');
    
    // Сначала проверяем, запущен ли демон
    const status = await checkDaemonStatusInternal();
    if (!status.isRunning) {
      console.log('❌ Демон не запущен, информация недоступна');
      return { success: false, error: 'Демон не запущен' };
    }
    
    // Получаем информацию из веб-консоли
    return new Promise((resolve) => {
      exec(`curl -s -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" http://127.0.0.1:7070`, (error, stdout) => {
        if (error) {
          console.log('❌ Ошибка curl:', error.message);
          resolve({ success: false, error: 'Ошибка доступа к веб-консоли' });
          return;
        }
        
        const html = stdout;
        console.log('📄 HTML получен через curl, длина:', html.length);
        
        // Ищем информацию о портах в HTML веб-консоли
        // Ищем внешние адреса (порты) - это НЕ порты прокси!
        const externalAddressMatch = html.match(/<b>Our external address:<\/b>[\s\S]*?<td>NTCP2<\/td>\s*<td>supported\s*:(\d+)<\/td>/i);
        const httpProxyMatch = html.match(/<tr><td>HTTP Proxy<\/td><td class='enabled'>Enabled<\/td><\/tr>/i);
        const socksProxyMatch = html.match(/<tr><td>SOCKS Proxy<\/td><td class='enabled'>Enabled<\/td><\/tr>/i);
        
        // Ищем информацию о пропускной способности (Router Caps)
        const routerCapsMatch = html.match(/<b>Router Caps:<\/b>\s*([A-Z]+)/i);
        
        console.log('🔍 Результат поиска внешнего адреса:', externalAddressMatch);
        console.log('🔍 HTTP Proxy найден:', !!httpProxyMatch);
        console.log('🔍 SOCKS Proxy найден:', !!socksProxyMatch);
        console.log('🔍 Router Caps:', routerCapsMatch);
        
        const networkInfo = {
          httpPort: 4444, // По умолчанию
          socksPort: 4447, // По умолчанию
          bandwidth: 'L', // По умолчанию
          externalPort: null
        };
        
        // Сохраняем внешний порт отдельно (не используем как порты прокси)
        if (externalAddressMatch && externalAddressMatch[1]) {
          const port = parseInt(externalAddressMatch[1]);
          networkInfo.externalPort = port;
          console.log('🔍 Внешний порт найден:', port, '(НЕ используется как порт прокси)');
        }
        
        // Если найдены Router Caps, используем их как пропускную способность
        if (routerCapsMatch && routerCapsMatch[1]) {
          networkInfo.bandwidth = routerCapsMatch[1];
        }
        
        // Теперь читаем реальные порты прокси из конфигурационного файла
        try {
          const configPath = path.join(os.homedir(), '.i2pd', 'i2pd.conf');
          if (fs.existsSync(configPath)) {
            const configContent = fs.readFileSync(configPath, 'utf8');
            
            // Ищем порт HTTP прокси
            const httpPortMatch = configContent.match(/\[httpproxy\][\s\S]*?port\s*=\s*(\d+)/i);
            if (httpPortMatch) {
              networkInfo.httpPort = parseInt(httpPortMatch[1]);
              console.log('🔍 HTTP порт из конфига:', networkInfo.httpPort);
            }
            
            // Ищем порт SOCKS прокси
            const socksPortMatch = configContent.match(/\[socksproxy\][\s\S]*?port\s*=\s*(\d+)/i);
            if (socksPortMatch) {
              networkInfo.socksPort = parseInt(socksPortMatch[1]);
              console.log('🔍 SOCKS порт из конфига:', networkInfo.socksPort);
            } else {
              // Если SOCKS порт не найден, используем стандартный
              networkInfo.socksPort = 4447;
              console.log('🔍 SOCKS порт не найден в конфиге, используем стандартный:', networkInfo.socksPort);
            }
          }
        } catch (configError) {
          console.log('⚠️ Ошибка чтения конфига для портов:', configError.message);
        }
        
        console.log('✅ Информация о сети получена:', networkInfo);
        resolve({ success: true, networkInfo });
      });
    });
  } catch (error) {
    console.log('❌ Ошибка получения информации о сети:', error.message);
    return { success: false, error: 'Ошибка доступа к веб-консоли' };
  }
});

// IPC: открытие веб-консоли i2pd
registerHandler('open-web-console', async () => {
  try {
    console.log('🌐 Открытие веб-консоли i2pd...');
    
    // Проверяем, запущен ли демон
    const status = await checkDaemonStatusInternal();
    if (!status.isRunning) {
      console.log('❌ Демон не запущен, веб-консоль недоступна');
      return { success: false, error: 'Демон не запущен' };
    }
    
    // Открываем веб-консоль в браузере по умолчанию
    const webConsoleUrl = 'http://127.0.0.1:7070';
    await shell.openExternal(webConsoleUrl);
    
    console.log('✅ Веб-консоль открыта:', webConsoleUrl);
    return { success: true, url: webConsoleUrl };
  } catch (error) {
    console.log('❌ Ошибка открытия веб-консоли:', error.message);
    return { success: false, error: error.message };
  }
});

// IPC: обновление настроек трея
registerHandler('update-tray-settings', async () => {
  try {
    console.log('🔄 Обновление настроек трея...');
    updateDockVisibility();
    return { success: true };
  } catch (error) {
    console.log('❌ Ошибка обновления настроек трея:', error.message);
    return { success: false, error: error.message };
  }
});

// IPC: сворачивание окна в трей
registerHandler('minimize-to-tray', async () => {
  try {
    if (mainWindow) {
      mainWindow.hide();
      console.log('🔄 Окно свернуто в трей');
      return { success: true };
    }
    return { success: false, error: 'Main window not found' };
  } catch (error) {
    console.log('❌ Ошибка сворачивания в трей:', error.message);
    return { success: false, error: error.message };
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
// Функция для получения пути к конфигурационной директории i2pd
function getI2pdConfigDir() {
  const homeDir = os.homedir();
  
  // Пытаемся загрузить информацию о платформе из файла
  let platformInfo = null;
  try {
    const platformInfoPath = path.join(__dirname, '..', 'platform-info.json');
    if (fs.existsSync(platformInfoPath)) {
      platformInfo = JSON.parse(fs.readFileSync(platformInfoPath, 'utf8'));
    }
  } catch (error) {
    console.log('⚠️ Не удалось загрузить platform-info.json, используем стандартные пути');
  }
  
  // Если есть информация о платформе, используем её
  if (platformInfo && platformInfo.configPath) {
    console.log(`📁 Используем путь из platform-info.json: ${platformInfo.configPath}`);
    return platformInfo.configPath;
  }
  
  // Иначе используем стандартную логику
  // Linux: используем домашнюю директорию пользователя
  return path.join(homeDir, '.i2pd');
}

// Функция для инициализации конфигурационных файлов при первом запуске
async function initializeI2pdConfig() {
  try {
    const configDir = getI2pdConfigDir();
    const appDir = __dirname;
    
    // Для Linux используем домашнюю директорию пользователя
    if (process.platform === 'linux') {
      console.log(`📁 Используем домашнюю директорию: ${configDir}`);
      
      // Создаем директорию конфигов, если её нет
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
        console.log(`📁 Создана директория конфигов: ${configDir}`);
      }
      
      return { success: true, configDir };
    }
    
    // Для других платформ создаем директорию конфигов, если её нет
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`📁 Создана директория конфигов: ${configDir}`);
    }
    
    // Копируем файлы из папки приложения в конфигурационную директорию
    const configFiles = ['i2pd.conf', 'tunnels.conf', 'subscriptions.txt'];
    
    for (const fileName of configFiles) {
      const sourcePath = path.join(appDir, fileName);
      const targetPath = path.join(configDir, fileName);
      
      // Копируем файл только если его нет в целевой директории
      if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`📄 Скопирован файл: ${fileName}`);
      }
    }
    
    return { success: true, configDir };
  } catch (error) {
    console.error('❌ Ошибка инициализации конфигов:', error);
    return { success: false, error: error.message };
  }
}

// IPC: получение директории конфигов i2pd
registerHandler('get-i2pd-config-dir', async () => {
  try {
    const configDir = getI2pdConfigDir();
    return { success: true, configDir };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC: чтение конфигурационного файла
registerHandler('read-config-file', async (event, fileName) => {
  try {
    const configDir = getI2pdConfigDir();
    const filePath = path.join(configDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `Файл ${fileName} не найден` };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC: запись конфигурационного файла
registerHandler('write-config-file', async (event, fileName, content) => {
  try {
    const configDir = getI2pdConfigDir();
    const filePath = path.join(configDir, fileName);
    
    // Создаем резервную копию перед записью
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 Создана резервная копия: ${backupPath}`);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Функция для записи настроек в конфигурационный файл i2pd
async function writeSettingsToConfig(settings) {
  try {
    const configDir = getI2pdConfigDir();
    const configPath = path.join(configDir, 'i2pd.conf');
    
    // Читаем текущий конфиг
    let configContent = '';
    if (fs.existsSync(configPath)) {
      configContent = fs.readFileSync(configPath, 'utf8');
    } else {
      // Если файла нет, читаем из папки приложения
      const appConfigPath = path.join(__dirname, 'i2pd.conf');
      if (fs.existsSync(appConfigPath)) {
        configContent = fs.readFileSync(appConfigPath, 'utf8');
      }
    }
    
    // Создаем резервную копию
    if (fs.existsSync(configPath)) {
      const backupPath = `${configPath}.backup.${Date.now()}`;
      fs.copyFileSync(configPath, backupPath);
      console.log(`💾 Создана резервная копия конфига: ${backupPath}`);
    }
    
    // Обновляем настройки в конфиге
    let updatedConfig = configContent;
    
    // HTTP Proxy Port
    if (settings.httpPort !== undefined) {
      const httpProxyRegex = /(\[httpproxy\][\s\S]*?port\s*=\s*)\d+/;
      if (httpProxyRegex.test(updatedConfig)) {
        updatedConfig = updatedConfig.replace(httpProxyRegex, `$1${settings.httpPort}`);
      } else {
        // Добавляем секцию если её нет
        const httpSection = `[httpproxy]\nport = ${settings.httpPort}\n`;
        updatedConfig += '\n' + httpSection;
      }
    }
    
    // SOCKS Proxy Port
    if (settings.socksPort !== undefined) {
      const socksProxyRegex = /(\[socksproxy\][\s\S]*?port\s*=\s*)\d+/;
      if (socksProxyRegex.test(updatedConfig)) {
        updatedConfig = updatedConfig.replace(socksProxyRegex, `$1${settings.socksPort}`);
      } else {
        const socksSection = `[socksproxy]\nport = ${settings.socksPort}\n`;
        updatedConfig += '\n' + socksSection;
      }
    }
    
    // Bandwidth
    if (settings.bandwidth !== undefined) {
      const bandwidthRegex = /(bandwidth\s*=\s*)[A-Z]/;
      if (bandwidthRegex.test(updatedConfig)) {
        updatedConfig = updatedConfig.replace(bandwidthRegex, `$1${settings.bandwidth}`);
      } else {
        updatedConfig += `\nbandwidth = ${settings.bandwidth}\n`;
      }
    }
    
    // IPv6
    if (settings.enableIPv6 !== undefined) {
      const ipv6Regex = /(ipv6\s*=\s*)(true|false)/;
      if (ipv6Regex.test(updatedConfig)) {
        updatedConfig = updatedConfig.replace(ipv6Regex, `$1${settings.enableIPv6}`);
      } else {
        updatedConfig += `\nipv6 = ${settings.enableIPv6}\n`;
      }
    }
    
    // UPnP
    if (settings.enableUPnP !== undefined) {
      const upnpRegex = /(\[upnp\][\s\S]*?enabled\s*=\s*)(true|false)/;
      if (upnpRegex.test(updatedConfig)) {
        updatedConfig = updatedConfig.replace(upnpRegex, `$1${settings.enableUPnP}`);
      } else {
        const upnpSection = `[upnp]\nenabled = ${settings.enableUPnP}\n`;
        updatedConfig += '\n' + upnpSection;
      }
    }
    
    // Log Level
    if (settings.logLevel !== undefined) {
      const logLevelRegex = /(loglevel\s*=\s*)(debug|info|warn|error|critical|none)/;
      if (logLevelRegex.test(updatedConfig)) {
        updatedConfig = updatedConfig.replace(logLevelRegex, `$1${settings.logLevel}`);
      } else {
        updatedConfig += `\nloglevel = ${settings.logLevel}\n`;
      }
    }
    
    // Floodfill
    if (settings.enableFloodfill !== undefined) {
      const floodfillRegex = /(floodfill\s*=\s*)(true|false)/;
      if (floodfillRegex.test(updatedConfig)) {
        updatedConfig = updatedConfig.replace(floodfillRegex, `$1${settings.enableFloodfill}`);
      } else {
        updatedConfig += `\nfloodfill = ${settings.enableFloodfill}\n`;
      }
    }
    
    // Transit (notransit - инвертированное значение)
    if (settings.enableTransit !== undefined) {
      const transitRegex = /(notransit\s*=\s*)(true|false)/;
      const transitValue = !settings.enableTransit; // Инвертируем
      if (transitRegex.test(updatedConfig)) {
        updatedConfig = updatedConfig.replace(transitRegex, `$1${transitValue}`);
      } else {
        updatedConfig += `\nnotransit = ${transitValue}\n`;
      }
    }
    
    // Max Transit Tunnels
    if (settings.maxTransitTunnels !== undefined) {
      const limitsRegex = /(\[limits\][\s\S]*?transittunnels\s*=\s*)\d+/;
      if (limitsRegex.test(updatedConfig)) {
        updatedConfig = updatedConfig.replace(limitsRegex, `$1${settings.maxTransitTunnels}`);
      } else {
        const limitsSection = `[limits]\ntransittunnels = ${settings.maxTransitTunnels}\n`;
        updatedConfig += '\n' + limitsSection;
      }
    }
    
    // Записываем обновленный конфиг
    fs.writeFileSync(configPath, updatedConfig, 'utf8');
    console.log(`✅ Настройки записаны в конфиг: ${configPath}`);
    
    return { success: true, configPath };
  } catch (error) {
    console.error('❌ Ошибка записи настроек в конфиг:', error);
    return { success: false, error: error.message };
  }
}

// IPC: запись настроек в конфигурационный файл
registerHandler('write-settings-to-config', async (event, settings) => {
  console.log('🔧 IPC: write-settings-to-config вызван с настройками:', settings);
  const result = await writeSettingsToConfig(settings);
  console.log('🔧 IPC: write-settings-to-config результат:', result);
  return result;
});

// IPC: установка масштабирования окна
registerHandler('set-window-zoom', (event, zoomFactor) => {
  console.log(`🔍 set-window-zoom вызван с параметром: ${zoomFactor}`);
  try {
    if (mainWindow) {
      console.log(`🔍 mainWindow найден, применяем масштаб: ${zoomFactor}`);
      mainWindow.webContents.setZoomFactor(zoomFactor);
      console.log(`✅ Масштаб окна установлен: ${zoomFactor}`);
      return { success: true, zoomFactor: zoomFactor };
    }
    console.log(`❌ mainWindow не найден`);
    return { success: false, error: 'Main window not found' };
  } catch (error) {
    console.log(`❌ Ошибка установки масштаба: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// IPC: получение текущего масштаба окна
registerHandler('get-window-zoom', () => {
  console.log('🔍 get-window-zoom вызван');
  try {
    if (mainWindow) {
      const currentZoom = mainWindow.webContents.getZoomFactor();
      console.log(`🔍 Текущий масштаб окна: ${currentZoom}`);
      return { success: true, zoomFactor: currentZoom };
    }
    console.log('❌ mainWindow не найден');
    return { success: false, error: 'Main window not found' };
  } catch (error) {
    console.log(`❌ Ошибка получения масштаба: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// IPC: увеличение интерфейса в 2 раза
registerHandler('zoom-interface-2x', () => {
  console.log('🔍 zoom-interface-2x вызван');
  try {
    if (mainWindow) {
      console.log('🔍 mainWindow найден, применяем увеличение в 2 раза');
      mainWindow.webContents.setZoomFactor(2.0);
      console.log('✅ Интерфейс увеличен в 2 раза');
      return { success: true };
    }
    console.log('❌ mainWindow не найден');
    return { success: false, error: 'Main window not found' };
  } catch (error) {
    console.log(`❌ Ошибка увеличения интерфейса: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// IPC: сброс масштабирования интерфейса
registerHandler('reset-interface-zoom', () => {
  console.log('🔍 reset-interface-zoom вызван');
  try {
    if (mainWindow) {
      console.log('🔍 mainWindow найден, сбрасываем масштаб');
      mainWindow.webContents.setZoomFactor(1.0);
      console.log('✅ Масштаб интерфейса сброшен');
      return { success: true };
    }
    console.log('❌ mainWindow не найден');
    return { success: false, error: 'Main window not found' };
  } catch (error) {
    console.log(`❌ Ошибка сброса масштаба: ${error.message}`);
    return { success: false, error: error.message };
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
app.whenReady().then(async () => {
  // Инициализируем конфигурационные файлы при первом запуске
  await initializeI2pdConfig();
  
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