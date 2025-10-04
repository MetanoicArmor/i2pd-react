import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Хук для управления I2P демоном
export function useI2pdManager() {
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [uptime, setUptime] = useState('00:00:00');
  const [peerCount, setPeerCount] = useState(0);
  const [bytesReceived, setBytesReceived] = useState(0);
  const [bytesSent, setBytesSent] = useState(0);
  const [activeTunnels, setActiveTunnels] = useState(0);
  const [routerInfos, setRouterInfos] = useState(0);
  const [daemonVersion, setDaemonVersion] = useState('—');
  const [logs, setLogs] = useState([]);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Добавление лога
  const addLog = useCallback((level, message) => {
    const timestamp = new Date();
    const newLog = {
      id: Date.now() + Math.random(),
      timestamp,
      level,
      message
    };
    
    setLogs(prev => [...prev.slice(-99), newLog]); // Храним последние 100 логов
  }, []);

  // Форматирование байтов
  const formatBytes = useCallback((bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // Проверка статуса демона
  const checkStatus = useCallback(async () => {
    if (isCheckingStatus) {
      return; // Предотвращаем множественные вызовы
    }
    
    setIsCheckingStatus(true);
    
    try {
      addLog('debug', 'Проверка статуса демона...');
      
      // В Electron используем IPC для выполнения команд
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.invoke('check-daemon-status');
          if (result && result.success !== false) {
            setIsRunning(result.isRunning || false);
            setUptime(result.uptime || '00:00:00');
            setPeerCount(result.peerCount || 0);
            setBytesReceived(result.bytesReceived || 0);
            setBytesSent(result.bytesSent || 0);
            setActiveTunnels(result.activeTunnels || 0);
            setRouterInfos(result.routerInfos || 0);
            
            if (result.isRunning) {
              addLog('info', 'Демон работает');
            } else {
              addLog('info', 'Демон остановлен');
            }
          } else {
            addLog('error', result?.error || 'Ошибка проверки статуса');
            setIsRunning(false);
          }
        } catch (ipcError) {
          addLog('error', `Ошибка IPC: ${ipcError.message}`);
          setIsRunning(false);
        }
      } else {
        // В браузере используем mock данные для разработки
        const mockRunning = Math.random() > 0.5;
        setIsRunning(mockRunning);
        if (mockRunning) {
          setUptime('01:23:45');
          setPeerCount(Math.floor(Math.random() * 100) + 50);
          setBytesReceived(Math.floor(Math.random() * 1000000));
          setBytesSent(Math.floor(Math.random() * 1000000));
          setActiveTunnels(Math.floor(Math.random() * 10) + 5);
          setRouterInfos(Math.floor(Math.random() * 1000) + 500);
        }
      }
    } catch (error) {
      console.error('Error in checkStatus:', error);
      addLog('error', `Ошибка проверки статуса: ${error.message}`);
    } finally {
      setIsCheckingStatus(false);
    }
  }, [addLog]); // Убираем isCheckingStatus из зависимостей чтобы избежать циклов

  // Запуск демона
  const startDaemon = useCallback(async () => {
    if (operationInProgress) {
      toast.error('Операция уже выполняется');
      return;
    }

    if (isRunning) {
      toast.warning('I2P daemon уже запущен');
      return;
    }

    setOperationInProgress(true);
    addLog('info', 'Запуск I2P daemon...');

    try {
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.invoke('start-daemon');
          if (result && result.success) {
            setIsRunning(true);
            addLog('info', 'Демон успешно запущен');
            toast.success('Демон запущен');
            
            // Обновляем статистику через несколько секунд
            setTimeout(() => {
              if (!isCheckingStatus) {
                checkStatus();
              }
              getExtendedStats();
            }, 3000);
          } else {
            throw new Error(result?.error || 'Неизвестная ошибка');
          }
        } catch (ipcError) {
          throw new Error(`Ошибка IPC: ${ipcError.message}`);
        }
      } else {
        // Mock для разработки
        setTimeout(() => {
          setIsRunning(true);
          setOperationInProgress(false);
          addLog('info', 'Демон запущен (mock)');
          toast.success('Демон запущен');
        }, 2000);
      }
    } catch (error) {
      addLog('error', `Ошибка запуска демона: ${error.message}`);
      toast.error(`Ошибка запуска: ${error.message}`);
    } finally {
      setOperationInProgress(false);
    }
  }, [operationInProgress, isRunning, addLog, checkStatus]);

  // Остановка демона
  const stopDaemon = useCallback(async () => {
    if (operationInProgress) {
      toast.error('Операция уже выполняется');
      return;
    }

    if (!isRunning) {
      toast.warning('I2P daemon не запущен');
      return;
    }

    setOperationInProgress(true);
    addLog('info', 'Остановка I2P daemon...');

    try {
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.invoke('stop-daemon');
          if (result && result.success) {
            setIsRunning(false);
            addLog('info', 'Демон остановлен');
            toast.success('Демон остановлен');
            
            // Сбрасываем статистику
            setUptime('00:00:00');
            setPeerCount(0);
            setBytesReceived(0);
            setBytesSent(0);
            setActiveTunnels(0);
            setRouterInfos(0);
          } else {
            throw new Error(result?.error || 'Неизвестная ошибка');
          }
        } catch (ipcError) {
          throw new Error(`Ошибка IPC: ${ipcError.message}`);
        }
      } else {
        // Mock для разработки
        setTimeout(() => {
          setIsRunning(false);
          setOperationInProgress(false);
          addLog('info', 'Демон остановлен (mock)');
          toast.success('Демон остановлен');
          
          // Сбрасываем статистику
          setUptime('00:00:00');
          setPeerCount(0);
          setBytesReceived(0);
          setBytesSent(0);
          setActiveTunnels(0);
          setRouterInfos(0);
        }, 2000);
      }
    } catch (error) {
      addLog('error', `Ошибка остановки демона: ${error.message}`);
      toast.error(`Ошибка остановки: ${error.message}`);
    } finally {
      setOperationInProgress(false);
    }
  }, [operationInProgress, isRunning, addLog]);

  // Перезапуск демона
  const restartDaemon = useCallback(async () => {
    if (operationInProgress) {
      toast.error('Операция уже выполняется');
      return;
    }

    addLog('info', 'Перезапуск демона...');
    await stopDaemon();
    setTimeout(async () => {
      await startDaemon();
    }, 2000);
  }, [operationInProgress, stopDaemon, startDaemon, addLog]);

  // Получение расширенной статистики
  const getExtendedStats = useCallback(async () => {
    if (!isRunning) return;
    
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoke('get-daemon-stats');
        if (result.success) {
          setPeerCount(result.peerCount || 0);
          setBytesReceived(result.bytesReceived || 0);
          setBytesSent(result.bytesSent || 0);
          setActiveTunnels(result.activeTunnels || 0);
          setRouterInfos(result.routerInfos || 0);
          setUptime(result.uptime || '00:00:00');
          addLog('info', 'Статистика обновлена');
        }
      } else {
        // Mock обновление статистики
        setPeerCount(Math.floor(Math.random() * 100) + 50);
        setBytesReceived(Math.floor(Math.random() * 1000000));
        setBytesSent(Math.floor(Math.random() * 1000000));
        setActiveTunnels(Math.floor(Math.random() * 10) + 5);
        setRouterInfos(Math.floor(Math.random() * 1000) + 500);
        addLog('info', 'Статистика обновлена (mock)');
      }
    } catch (error) {
      addLog('error', `Ошибка получения статистики: ${error.message}`);
    }
  }, [isRunning, addLog]);

  // Получение версии демона
  const fetchDaemonVersion = useCallback(async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.invoke('get-daemon-version');
        if (result.success) {
          setDaemonVersion(result.version || '—');
        }
      } else {
        setDaemonVersion('2.58.0 (mock)');
      }
    } catch (error) {
      console.error('Error in fetchDaemonVersion:', error);
      addLog('error', `Ошибка получения версии: ${error.message}`);
    }
  }, [addLog]);

  // Очистка логов
  const clearLogs = useCallback(() => {
    setLogs([]);
    addLog('info', 'Логи очищены');
    toast.success('Логи очищены');
  }, [addLog]);

  // Инициализация
  useEffect(() => {
    if (isInitialized) return;
    
    let isMounted = true;
    
    const initializeApp = async () => {
      if (isMounted && !isInitialized) {
        setIsInitialized(true);
        try {
          await checkStatus();
          await fetchDaemonVersion();
        } catch (error) {
          console.error('Error during initialization:', error);
        }
      }
    };
    
    initializeApp();
    
    // Периодическое обновление статуса
    const interval = setInterval(() => {
      if (isMounted && isRunning && !isCheckingStatus) {
        checkStatus();
      }
    }, 15000); // Увеличиваем интервал до 15 секунд

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isInitialized, isRunning, isCheckingStatus]); // Добавляем зависимости для контроля

  return {
    isRunning,
    isLoading,
    operationInProgress,
    uptime,
    peerCount,
    bytesReceived: formatBytes(bytesReceived),
    bytesSent: formatBytes(bytesSent),
    activeTunnels,
    routerInfos,
    daemonVersion,
    logs,
    startDaemon,
    stopDaemon,
    restartDaemon,
    checkStatus,
    getExtendedStats,
    clearLogs,
    addLog
  };
}

