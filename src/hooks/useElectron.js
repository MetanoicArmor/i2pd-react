import { useState, useEffect, useCallback } from 'react';

// Хук для работы с Electron API
export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState(null);

  // Инициализация Electron API
  useEffect(() => {
    console.log('🔍 useElectron: Проверяем window.electronAPI...');
    console.log('🔍 useElectron: window.electronAPI =', window.electronAPI);
    console.log('🔍 useElectron: typeof window.electronAPI =', typeof window.electronAPI);
    
    if (window.electronAPI) {
      console.log('✅ useElectron: electronAPI найден!');
      setIsElectron(true);
      setElectronAPI(window.electronAPI);
    } else {
      console.log('❌ useElectron: electronAPI НЕ найден!');
      setIsElectron(false);
      setElectronAPI(null);
    }
  }, []);

  // Получение значения из хранилища
  const getStoreValue = useCallback(async (key, defaultValue = null) => {
    if (!isElectron || !electronAPI) {
      // В браузере используем localStorage
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      } catch {
        return defaultValue;
      }
    }

    try {
      return await electronAPI.invoke('get-store-value', key) || defaultValue;
    } catch (error) {
      console.error('Ошибка получения значения из хранилища:', error);
      return defaultValue;
    }
  }, [isElectron, electronAPI]);

  // Установка значения в хранилище
  const setStoreValue = useCallback(async (key, value) => {
    if (!isElectron || !electronAPI) {
      // В браузере используем localStorage
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }

    try {
      await electronAPI.invoke('set-store-value', key, value);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения значения в хранилище:', error);
      return false;
    }
  }, [isElectron, electronAPI]);

  // Обновление статуса в трее
  const updateTrayStatus = useCallback(async (status) => {
    if (!isElectron || !electronAPI) return;

    try {
      await electronAPI.invoke('update-tray-status', status);
    } catch (error) {
      console.error('Ошибка обновления статуса трея:', error);
    }
  }, [isElectron, electronAPI]);

  // Показать диалог сообщения
  const showMessageBox = useCallback(async (options) => {
    if (!isElectron || !electronAPI) {
      // В браузере используем alert
      alert(options.message);
      return { response: 0 };
    }

    try {
      return await electronAPI.invoke('show-message-box', options);
    } catch (error) {
      console.error('Ошибка показа диалога:', error);
      return { response: 0 };
    }
  }, [isElectron, electronAPI]);

  // Показать диалог открытия файла
  const showOpenDialog = useCallback(async (options) => {
    if (!isElectron || !electronAPI) {
      // В браузере возвращаем mock результат
      return { canceled: true, filePaths: [] };
    }

    try {
      return await electronAPI.invoke('show-open-dialog', options);
    } catch (error) {
      console.error('Ошибка показа диалога открытия:', error);
      return { canceled: true, filePaths: [] };
    }
  }, [isElectron, electronAPI]);

  // Показать диалог сохранения файла
  const showSaveDialog = useCallback(async (options) => {
    if (!isElectron || !electronAPI) {
      // В браузере возвращаем mock результат
      return { canceled: true, filePath: '' };
    }

    try {
      return await electronAPI.invoke('show-save-dialog', options);
    } catch (error) {
      console.error('Ошибка показа диалога сохранения:', error);
      return { canceled: true, filePath: '' };
    }
  }, [isElectron, electronAPI]);

  // Открыть внешнюю ссылку
  const openExternal = useCallback(async (url) => {
    if (!isElectron || !electronAPI) {
      // В браузере используем window.open
      window.open(url, '_blank');
      return;
    }

    try {
      await electronAPI.invoke('open-external', url);
    } catch (error) {
      console.error('Ошибка открытия внешней ссылки:', error);
    }
  }, [isElectron, electronAPI]);

  // Получить версию приложения
  const getAppVersion = useCallback(async () => {
    if (!isElectron || !electronAPI) {
      return '1.0.0 (web)';
    }

    try {
      return await electronAPI.invoke('get-app-version');
    } catch (error) {
      console.error('Ошибка получения версии приложения:', error);
      return '1.0.0';
    }
  }, [isElectron, electronAPI]);

  return {
    isElectron,
    electronAPI,
    getStoreValue,
    setStoreValue,
    updateTrayStatus,
    showMessageBox,
    showOpenDialog,
    showSaveDialog,
    openExternal,
    getAppVersion
  };
}

