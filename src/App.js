import React, { useState, useEffect, useRef } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

// Компоненты
import SettingsModal from './components/SettingsModal';
import NetworkMonitoring from './components/NetworkMonitoring';

// Хуки
import { useElectron } from './hooks/useElectron';
import { useSettings } from './hooks/useSettings';
import { useNetworkMonitoring } from './hooks/useNetworkMonitoring';
import { useNetworkInfo } from './hooks/useNetworkInfo';

// Константы
import { DEFAULT_SETTINGS } from './constants/settings';
import { IPC_CHANNELS } from './constants';

// Простые темы
const lightTheme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    shadow: 'rgba(0, 0, 0, 0.1)',
    primaryDark: '#0056CC'
  }
};

const darkTheme = {
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    shadow: 'rgba(0, 0, 0, 0.3)',
    primaryDark: '#0056CC'
  }
};

const themes = {
  light: lightTheme,
  dark: darkTheme
};

// Глобальные стили
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    overflow: hidden;
  }

  #root {
    height: 100vh;
    width: 100vw;
  }
`;

// Стилизованные компоненты
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  -webkit-app-region: drag;
  user-select: none;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
  flex: 1;
  text-align: center;
`;

const HeaderButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: no-drag;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  background: ${props => props.$isRunning 
    ? props.theme.colors.success + '20' 
    : props.theme.colors.error + '20'};
  border: 1px solid ${props => props.$isRunning 
    ? props.theme.colors.success 
    : props.theme.colors.error};
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$isRunning 
    ? props.theme.colors.success 
    : props.theme.colors.error};
`;

const StatusText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.$isRunning 
    ? props.theme.colors.success 
    : props.theme.colors.error};
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ControlButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LogsContainer = styled.div`
  height: 200px;
  overflow: auto;
  background-color: #000000;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
`;

// Главный компонент приложения
const App = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [daemonVersion, setDaemonVersion] = useState(null);
  
  const { isElectron, electronAPI } = useElectron();
  const settingsHook = useSettings(electronAPI);
  const settings = settingsHook.settings;
  
  // Информация о сети из веб-консоли
  const { networkInfo, isLoading: networkInfoLoading, error: networkInfoError } = useNetworkInfo(electronAPI);
  
  // Мониторинг сети
  const { 
    stats: networkStats, 
    isLoading: statsLoading, 
    error: statsError, 
    refreshStats 
  } = useNetworkMonitoring(
    isElectron,
    electronAPI,
    isRunning,
    // интервал обновления: берем из настроек (сек), по умолчанию 10
    (settings.updateInterval && Number(settings.updateInterval)) || 10
  );

  // Добавление лога
  const addLog = (level, message) => {
    const timestamp = new Date();
    const newLog = {
      id: Date.now() + Math.random(),
      timestamp,
      level,
      message
    };
    
    setLogs(prev => [...prev.slice(-99), newLog]);
  };

  // Проверка статуса демона
  const checkStatus = async () => {
    if (!isElectron || !electronAPI) {
      addLog('info', t('Running in browser - daemon unavailable'));
      return;
    }

    // Логируем только изменения статуса, чтобы не спамить
    const prevRunningRef = checkStatus.__prevRunningRef || (checkStatus.__prevRunningRef = { current: null });

    try {
      console.log('🔍 Проверяем статус демона...');
      const result = await electronAPI.invoke('check-daemon-status');
      console.log('📊 Результат проверки статуса:', result);
      
      if (result.isRunning) {
        setIsRunning(true);
        if (prevRunningRef.current !== true) {
          addLog('info', t('Daemon is running'));
          // Получаем версию демона при первом обнаружении запущенного демона
          fetchDaemonVersion();
        }
        // Обновляем статистику при запуске
        refreshStats();
      } else {
        setIsRunning(false);
        if (prevRunningRef.current !== false) {
          addLog('info', t('Daemon is stopped'));
        }
      }

      prevRunningRef.current = !!result.isRunning;
    } catch (error) {
      addLog('error', `${t('Status check error')}: ${error.message}`);
      setIsRunning(false);
    }
  };

  // Запуск демона
  const startDaemon = async () => {
    if (operationInProgress) {
      addLog('warning', t('Operation already in progress'));
      return;
    }

    if (isRunning) {
      addLog('warning', t('Daemon already running'));
      return;
    }

    if (!isElectron || !electronAPI) {
      addLog('error', t('Electron API not available'));
      return;
    }

    setOperationInProgress(true);
    addLog('info', t('Starting daemon...'));

    try {
      const result = await electronAPI.invoke('start-daemon');
      if (result.success) {
        setIsRunning(true);
        addLog('info', t('Daemon started successfully'));
        // Обновляем статистику после запуска
        setTimeout(() => {
          if (typeof refreshStats === 'function') {
            refreshStats();
          }
        }, 3000);
        // Обновляем версию демона после запуска
        setTimeout(() => fetchDaemonVersion(), 2000);
      } else {
        throw new Error(result.error || 'Неизвестная ошибка');
      }
    } catch (error) {
      addLog('error', `${t('Daemon start error')}: ${error.message}`);
    } finally {
      setOperationInProgress(false);
    }
  };

  // Остановка демона
  const stopDaemon = async () => {
    if (operationInProgress) {
      addLog('warning', t('Operation already in progress'));
      return;
    }

    if (!isRunning) {
      addLog('warning', t('Daemon already stopped'));
      return;
    }

    if (!isElectron || !electronAPI) {
      addLog('error', t('Electron API not available'));
      return;
    }

    setOperationInProgress(true);
    addLog('info', t('Stopping daemon...'));

    try {
      const result = await electronAPI.invoke('stop-daemon');
      if (result.success) {
        setIsRunning(false);
        addLog('info', t('Daemon stopped successfully'));
      } else {
        throw new Error(result.error || 'Неизвестная ошибка');
      }
    } catch (error) {
      addLog('error', `${t('Daemon stop error')}: ${error.message}`);
    } finally {
      setOperationInProgress(false);
    }
  };

  // Перезагрузка демона
  const restartDaemon = async () => {
    if (operationInProgress) {
      addLog('warning', t('Operation already in progress'));
      return;
    }

    if (!isElectron || !electronAPI) {
      addLog('error', t('Electron API not available'));
      return;
    }

    setOperationInProgress(true);
    addLog('info', t('Restarting daemon...'));

    try {
      // Сначала останавливаем демон, если он запущен
      if (isRunning) {
        addLog('info', t('Stopping daemon for restart...'));
        const stopResult = await electronAPI.invoke('stop-daemon');
        if (!stopResult.success) {
          throw new Error(stopResult.error || 'Не удалось остановить демон');
        }
        setIsRunning(false);
        
        // Ждем немного перед запуском
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Запускаем демон заново
        addLog('info', t('Starting daemon after restart...'));
      const startResult = await electronAPI.invoke('start-daemon');
      if (startResult.success) {
        setIsRunning(true);
        addLog('success', t('Daemon restarted successfully'));
        
        // Обновляем статистику и версию после перезагрузки
        setTimeout(() => {
          if (typeof refreshStats === 'function') {
            refreshStats();
          }
          fetchDaemonVersion();
        }, 3000);
      } else {
        throw new Error(startResult.error || 'Не удалось запустить демон после перезапуска');
      }
    } catch (error) {
      addLog('error', `${t('Daemon restart error')}: ${error.message}`);
    } finally {
      setOperationInProgress(false);
    }
  };

  // Открытие веб-консоли i2pd
  const openWebConsole = async () => {
    if (!isElectron || !electronAPI) {
      addLog('error', t('Electron API not available'));
      return;
    }

    try {
      addLog('info', t('Opening web console...'));
      const result = await electronAPI.invoke(IPC_CHANNELS.OPEN_WEB_CONSOLE);
      
      if (result.success) {
        addLog('info', `${t('Web console opened')}: ${result.url}`);
      } else {
        addLog('error', `${t('Failed to open web console')}: ${result.error}`);
      }
    } catch (error) {
      addLog('error', `${t('Web console error')}: ${error.message}`);
    }
  };

  // Получение версии демона
  // Получение версии демона (с throttling)
  const fetchDaemonVersion = async () => {
    if (!isElectron || !electronAPI) return;
    
    console.log('🔄 fetchDaemonVersion вызван');
    
    // Throttling: не запрашиваем версию чаще чем раз в 30 секунд
    const now = Date.now();
    if (fetchDaemonVersion.lastCall && (now - fetchDaemonVersion.lastCall < 30000)) {
      console.log('⏰ Throttling: пропускаем запрос версии');
      return;
    }
    fetchDaemonVersion.lastCall = now;
    
    try {
      console.log('📡 Запрашиваем версию демона...');
      const result = await electronAPI.invoke('get-daemon-version');
      console.log('📄 Результат получения версии:', result);
      
      if (result.success) {
        setDaemonVersion(result.version);
        addLog('info', `${t('Daemon version')}: ${result.version}`);
        console.log('✅ Версия установлена:', result.version);
      } else {
        addLog('warning', `${t('Failed to get daemon version')}: ${result.error}`);
        console.log('❌ Ошибка получения версии:', result.error);
      }
    } catch (error) {
      console.error('❌ Ошибка получения версии демона:', error);
      addLog('error', `${t('Daemon version error')}: ${error.message}`);
    }
  };

  // Инициализация
  useEffect(() => {
    const initializeApp = async () => {
      if (isElectron) {
        addLog('info', t('Application initialized'));
        
        // Проверяем статус демона
        await checkStatus();
        
        // НЕ получаем версию демона при инициализации - только после запуска
        // await fetchDaemonVersion();
        
        // Автозапуск если включен
        if (settings.autoStartDaemon && !isRunning && !operationInProgress) {
          setTimeout(async () => {
            try {
              const result = await electronAPI.invoke('check-daemon-status');
              if (!result.isRunning && !operationInProgress) {
                addLog('info', t('Auto-starting daemon...'));
                await startDaemon();
              }
            } catch (error) {
              addLog('error', `${t('Auto-start error')}: ${error.message}`);
            }
          }, 3000);
        }
        
        // Запуск в свернутом виде если включен
        if (settings.startMinimized) {
          setTimeout(async () => {
            try {
              await electronAPI.invoke('minimize-to-tray');
              addLog('info', t('Application started minimized'));
            } catch (error) {
              addLog('error', `${t('Minimize error')}: ${error.message}`);
            }
          }, 1000);
        }
      }
    };

    initializeApp();
  }, [isElectron, settings.autoStartDaemon]);

  // Периодическая проверка статуса
  useEffect(() => {
    if (!isElectron) return;

    const intervalMs = Math.max(3000, (settings.updateInterval || 5) * 1000);
    const interval = setInterval(() => {
      if (!operationInProgress) {
        checkStatus();
        // НЕ вызываем fetchDaemonVersion в периодической проверке - только при запуске
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isElectron, operationInProgress, settings.updateInterval]);

  // Автоочистка логов
  useEffect(() => {
    if (settings.autoClearLogs && logs.length > 100) {
      setLogs(prev => prev.slice(-50));
    }
  }, [logs.length, settings.autoClearLogs]);

  const currentThemeName = settings.theme === 'light' ? 'light' : 'dark';
  // Синхронизируем фон окна Electron при смене темы
  useEffect(() => {
    try {
      if (electronAPI && typeof electronAPI.invoke === 'function') {
        electronAPI.invoke('set-window-theme', currentThemeName);
      }
    } catch (_) {}
  }, [electronAPI, currentThemeName]);

  // Обработчик события открытия настроек из трея
  useEffect(() => {
    if (!isElectron || !electronAPI) return;

    const handleOpenSettings = () => {
      setShowSettings(true);
    };

    electronAPI.on('open-settings', handleOpenSettings);

    return () => {
      electronAPI.removeListener('open-settings', handleOpenSettings);
    };
  }, [isElectron, electronAPI]);

  return (
    <ThemeProvider theme={themes[currentThemeName]}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Title>{t('I2P Daemon GUI')}</Title>
          <HeaderButtons>
            <Button onClick={() => setShowSettings(true)}>
              ⚙️ {t('Settings')}
            </Button>
            <Button onClick={openWebConsole} disabled={!isRunning}>
              🌐 {t('Web Console')}
            </Button>
            <Button onClick={() => electronAPI?.invoke('quit-app')}>
              {t('Quit')}
            </Button>
            <StatusIndicator $isRunning={isRunning}>
              <StatusDot $isRunning={isRunning} />
              <StatusText $isRunning={isRunning}>
                {isRunning ? t('Running') : t('Stopped')}
              </StatusText>
            </StatusIndicator>
          </HeaderButtons>
        </Header>
        
        <Content>
          {/* Мониторинг сети */}
          <NetworkMonitoring
            isRunning={isRunning}
            stats={networkStats}
            onRefresh={refreshStats}
            isLoading={statsLoading}
            error={statsError}
          />

          {/* Управление демоном */}
          <Card>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', textAlign: 'center' }}>{t('Manage Daemon')}</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <ControlButton 
                onClick={startDaemon} 
                disabled={isRunning || operationInProgress}
              >
                {operationInProgress ? t('Starting I2P daemon...') : t('Start')}
              </ControlButton>
              <ControlButton 
                onClick={stopDaemon} 
                disabled={!isRunning || operationInProgress}
              >
                {operationInProgress ? t('Stopping I2P daemon...') : t('Stop')}
              </ControlButton>
              <ControlButton 
                onClick={restartDaemon} 
                disabled={operationInProgress}
                style={{ 
                  background: 'linear-gradient(135deg, #FF9F0A, #FF9F0ACC)',
                  color: 'white',
                  border: 'none'
                }}
              >
                {operationInProgress ? t('Restarting daemon...') : t('Restart')}
              </ControlButton>
            </div>
          </Card>

          {/* Логи */}
          <Card>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>{t('System Logs')}</h3>
            <LogsContainer>
              {logs.length === 0 ? (
                <div style={{ color: '#8E8E93' }}>{t('Logs will appear when daemon starts')}</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} style={{ 
                    marginBottom: '4px',
                    color: log.level === 'error' ? '#FF453A' : 
                           log.level === 'warning' ? '#FF9F0A' : 
                           log.level === 'info' ? '#30D158' : '#8E8E93'
                  }}>
                    [{log.timestamp.toLocaleTimeString()}] {log.level.toUpperCase()}: {log.message}
                  </div>
                ))
              )}
            </LogsContainer>
          </Card>

          {/* Информация */}
          <Card>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
              {t('Information')}
            </h3>
            <p style={{ margin: '0', color: '#8E8E93' }}>{isElectron ? 'Electron' : t('Browser')}</p>
            <p style={{ margin: '8px 0 0 0', color: '#8E8E93' }}>{t('Status')}: {isRunning ? t('Running') : t('Stopped')}</p>
            <p style={{ margin: '8px 0 0 0', color: '#8E8E93' }}>{t('Operation')}: {operationInProgress ? t('In progress') : t('System ready')}</p>
            <p style={{ margin: '8px 0 0 0', color: '#8E8E93' }}>{t('App Theme')}: {settings.theme === 'dark' ? t('Dark') : t('Light')}</p>
            <p style={{ margin: '8px 0 0 0', color: '#8E8E93' }}>{t('Auto-start Daemon')}: {settings.autoStartDaemon ? t('Enabled') : t('Disabled')}</p>
            <p style={{ margin: '8px 0 0 0', color: '#8E8E93' }}>
              HTTP: {networkInfoLoading ? '...' : (networkInfo.httpPort || 4444)}
              {networkInfoError && !isRunning && <span style={{ color: '#FF9F0A', fontSize: '12px' }}> (демон не запущен)</span>}
              {networkInfoError && isRunning && <span style={{ color: '#FF3B30', fontSize: '12px' }}> (ошибка)</span>}
            </p>
            <p style={{ margin: '8px 0 0 0', color: '#8E8E93' }}>
              SOCKS: {networkInfoLoading ? '...' : (networkInfo.socksPort || 4447)}
              {networkInfoError && !isRunning && <span style={{ color: '#FF9F0A', fontSize: '12px' }}> (демон не запущен)</span>}
              {networkInfoError && isRunning && <span style={{ color: '#FF3B30', fontSize: '12px' }}> (ошибка)</span>}
            </p>
            <p style={{ margin: '8px 0 0 0', color: '#8E8E93' }}>{t('Refresh')}: {(settings.updateInterval || 5)} s</p>
          </Card>
        </Content>

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          electronAPI={electronAPI}
          settings={settingsHook.settings}
          validateSettings={settingsHook.validateSettings}
          onSaved={async (newSettings) => {
            console.log('🚀🚀🚀 APP: onSaved ВЫЗВАН С НАСТРОЙКАМИ! 🚀🚀🚀');
            console.log('📋 App: newSettings:', newSettings);
            
            // Обновляем настройки в хуке
            try {
              console.log('🔄 App: Вызываем settingsHook.saveSettings...');
              await settingsHook.saveSettings(newSettings);
              console.log('✅✅✅ APP: НАСТРОЙКИ УСПЕШНО СОХРАНЕНЫ В ХУКЕ! ✅✅✅');
            } catch (error) {
              console.error('❌❌❌ APP: ОШИБКА СОХРАНЕНИЯ НАСТРОЕК В ХУКЕ! ❌❌❌', error);
            }
            
            // мгновенно переключаем тему без перезапуска
            if (newSettings && newSettings.theme) {
              // Ничего не делаем здесь — ThemeProvider получает значения из settingsHook
            }
            if (newSettings && newSettings.language) {
              try { i18n.changeLanguage(newSettings.language); } catch (_) {}
            }
          }}
        />

        {/* Футер с версией */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '8px 0', 
          marginTop: '16px', 
          color: '#8E8E93', 
          fontSize: '11px' 
        }}>
          <div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#8E8E93' }}>v{isRunning ? (daemonVersion || '?') : '?'}</span>
          </div>
        </div>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;