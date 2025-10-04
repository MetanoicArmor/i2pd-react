import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SETTINGS } from '../constants/settings';

// Хук для управления настройками приложения
export const useSettings = (electronAPI) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Загрузка настроек
  const loadSettings = useCallback(async () => {
    if (!electronAPI) {
      // В браузере загружаем из localStorage
      try {
        const savedSettings = localStorage.getItem('i2pd-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек из localStorage:', error);
      }
      return;
    }

    setIsLoading(true);
    try {
      const loadedSettings = {};
      
      // Загружаем каждую настройку отдельно
      for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
        try {
          const value = await electronAPI.invoke('get-store-value', key);
          loadedSettings[key] = (value === null || typeof value === 'undefined') ? defaultValue : value;
        } catch (error) {
          console.error(`Ошибка загрузки настройки ${key}:`, error);
          loadedSettings[key] = defaultValue;
        }
      }
      
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setIsLoading(false);
    }
  }, [electronAPI]);

  // Сохранение настроек
  const saveSettings = useCallback(async (newSettings) => {
    if (!electronAPI) {
      // В браузере сохраняем в localStorage
      try {
        localStorage.setItem('i2pd-settings', JSON.stringify(newSettings));
        setSettings(newSettings);
        return true;
      } catch (error) {
        console.error('Ошибка сохранения настроек в localStorage:', error);
        return false;
      }
    }

    setIsSaving(true);
    try {
      // Сохраняем каждую настройку отдельно
      for (const [key, value] of Object.entries(newSettings)) {
        try {
          await electronAPI.invoke('set-store-value', key, value);
        } catch (error) {
          console.error(`Ошибка сохранения настройки ${key}:`, error);
          throw error;
        }
      }
      
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [electronAPI]);

  // Обновление отдельной настройки
  const updateSetting = useCallback(async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    return await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Сброс настроек к значениям по умолчанию
  const resetSettings = useCallback(async () => {
    return await saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  // Валидация настроек
  const validateSettings = useCallback((settingsToValidate) => {
    const errors = {};
    
    // Валидация портов
    if (settingsToValidate.httpPort < 1024 || settingsToValidate.httpPort > 65535) {
      errors.httpPort = 'HTTP порт должен быть в диапазоне 1024-65535';
    }
    
    if (settingsToValidate.socksPort < 1024 || settingsToValidate.socksPort > 65535) {
      errors.socksPort = 'SOCKS порт должен быть в диапазоне 1024-65535';
    }
    
    if (settingsToValidate.httpPort === settingsToValidate.socksPort) {
      errors.socksPort = 'SOCKS порт должен отличаться от HTTP порта';
    }
    
    // Валидация интервала обновления
    if (settingsToValidate.updateInterval < 1 || settingsToValidate.updateInterval > 60) {
      errors.updateInterval = 'Интервал обновления должен быть от 1 до 60 секунд';
    }
    
    // Валидация максимальных туннелей
    if (settingsToValidate.maxTransitTunnels < 100 || settingsToValidate.maxTransitTunnels > 50000) {
      errors.maxTransitTunnels = 'Максимальное количество туннелей должно быть от 100 до 50000';
    }
    
    return errors;
  }, []);

  // Загрузка настроек при инициализации
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    loadSettings,
    saveSettings,
    updateSetting,
    resetSettings,
    validateSettings
  };
};

