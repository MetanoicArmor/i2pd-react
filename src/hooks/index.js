import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { IPC_CHANNELS } from '../constants';

// Хук для работы с Electron API
export const useElectron = () => {
  const { isElectron, electronAPI } = useApp();
  
  const invoke = useCallback(async (channel, ...args) => {
    if (!isElectron || !electronAPI) {
      throw new Error('Electron API not available');
    }
    return electronAPI.invoke(channel, ...args);
  }, [isElectron, electronAPI]);

  const on = useCallback((channel, callback) => {
    if (!isElectron || !electronAPI) return;
    electronAPI.on(channel, callback);
  }, [isElectron, electronAPI]);

  const removeListener = useCallback((channel, callback) => {
    if (!isElectron || !electronAPI) return;
    electronAPI.removeListener(channel, callback);
  }, [isElectron, electronAPI]);

  return {
    isElectron,
    electronAPI,
    invoke,
    on,
    removeListener
  };
};

// Хук для работы с настройками
export const useSettings = () => {
  const { invoke, isElectron } = useElectron();
  
  const getSetting = useCallback(async (key, defaultValue = null) => {
    if (!isElectron) return defaultValue;
    try {
      const result = await invoke(IPC_CHANNELS.GET_STORE_VALUE, key);
      return result !== null ? result : defaultValue;
    } catch (error) {
      console.error('Error getting setting:', error);
      return defaultValue;
    }
  }, [invoke, isElectron]);

  const setSetting = useCallback(async (key, value) => {
    if (!isElectron) return;
    try {
      await invoke(IPC_CHANNELS.SET_STORE_VALUE, key, value);
    } catch (error) {
      console.error('Error setting setting:', error);
    }
  }, [invoke, isElectron]);

  return {
    getSetting,
    setSetting
  };
};

// Хук для работы с логами
export const useLogs = () => {
  const [logs, setLogs] = useState([]);
  const { UI_CONFIG } = require('../constants');

  const addLog = useCallback((level, message, timestamp = Date.now()) => {
    const logEntry = {
      id: Date.now() + Math.random(),
      level,
      message,
      timestamp: new Date(timestamp)
    };

    setLogs(prevLogs => {
      const newLogs = [...prevLogs, logEntry];
      // Ограничиваем количество логов
      if (newLogs.length > UI_CONFIG.maxLogEntries) {
        return newLogs.slice(-UI_CONFIG.maxLogEntries);
      }
      return newLogs;
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const getLogsByLevel = useCallback((level) => {
    return logs.filter(log => log.level === level);
  }, [logs]);

  return {
    logs,
    addLog,
    clearLogs,
    getLogsByLevel
  };
};

// Хук для работы с модальными окнами
export const useModal = (modalName) => {
  const { isModalOpen, toggleModal } = useApp();
  
  const isOpen = isModalOpen(modalName);
  
  const open = useCallback(() => {
    if (!isOpen) {
      toggleModal(modalName);
    }
  }, [isOpen, toggleModal, modalName]);

  const close = useCallback(() => {
    if (isOpen) {
      toggleModal(modalName);
    }
  }, [isOpen, toggleModal, modalName]);

  return {
    isOpen,
    open,
    close,
    toggle: () => toggleModal(modalName)
  };
};

// Хук для работы с темой
export const useTheme = () => {
  const { theme, setTheme, currentTheme } = useApp();
  const { setSetting } = useSettings();

  const changeTheme = useCallback(async (newTheme) => {
    setTheme(newTheme);
    await setSetting('theme', newTheme);
  }, [setTheme, setSetting]);

  return {
    theme,
    currentTheme,
    changeTheme
  };
};

// Хук для работы с языком
export const useLanguage = () => {
  const { language, setLanguage } = useApp();
  const { setSetting } = useSettings();

  const changeLanguage = useCallback(async (newLanguage) => {
    setLanguage(newLanguage);
    await setSetting('language', newLanguage);
  }, [setLanguage, setSetting]);

  return {
    language,
    changeLanguage
  };
};

// Хук для работы с состоянием загрузки
export const useLoading = () => {
  const { isLoading, setLoading } = useApp();

  const startLoading = useCallback(() => {
    setLoading(true);
  }, [setLoading]);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    setLoading
  };
};

// Хук для работы с ошибками
export const useError = () => {
  const { error, setError, clearError } = useApp();

  const showError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, [setError]);

  return {
    error,
    showError,
    clearError
  };
};

