import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useTranslation } from 'react-i18next';

import { DEFAULT_SETTINGS } from '../constants/settings';

// Хук для управления настройками приложения
export const useSettings = (electronAPI) => {
  const { t } = useTranslation();
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
    console.log('🚀🚀🚀 НАЧАЛО СОХРАНЕНИЯ НАСТРОЕК! 🚀🚀🚀');
    console.log('📋 useSettings: newSettings:', newSettings);
    console.log('📋 useSettings: current settings:', settings);
    
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
      // Сохраняем каждую настройку отдельно в electron-store
      for (const [key, value] of Object.entries(newSettings)) {
        try {
          await electronAPI.invoke('set-store-value', key, value);
        } catch (error) {
          console.error(`Ошибка сохранения настройки ${key}:`, error);
          throw error;
        }
      }
      
      // Определяем, какие настройки влияют на демон
      const daemonSettings = {
        httpPort: newSettings.httpPort,
        socksPort: newSettings.socksPort,
        bandwidth: newSettings.bandwidth,
        enableIPv6: newSettings.enableIPv6,
        enableUPnP: newSettings.enableUPnP,
        logLevel: newSettings.logLevel,
        enableFloodfill: newSettings.enableFloodfill,
        enableTransit: newSettings.enableTransit,
        maxTransitTunnels: newSettings.maxTransitTunnels
      };
      
      // Фильтруем только измененные настройки демона
      const changedDaemonSettings = {};
      for (const [key, value] of Object.entries(daemonSettings)) {
        if (value !== undefined && value !== settings[key]) {
          changedDaemonSettings[key] = value;
        }
      }
      
      console.log('🔍 Анализ изменений настроек демона:');
      console.log('📋 Все настройки демона:', daemonSettings);
      console.log('📋 Текущие настройки:', settings);
      console.log('🔍 Измененные настройки:', changedDaemonSettings);
      
      // Если есть изменения в настройках демона, записываем их в конфиг
      console.log('🔍 Проверяем изменения настроек демона...');
      console.log('📋 Все настройки демона:', daemonSettings);
      console.log('📋 Текущие настройки:', settings);
      console.log('📋 Новые настройки:', newSettings);
      console.log('🔍 Измененные настройки:', changedDaemonSettings);
      console.log('🔍 Количество изменений:', Object.keys(changedDaemonSettings).length);
      
      if (Object.keys(changedDaemonSettings).length > 0) {
        console.log('📝 Записываем изменения настроек в конфиг:', changedDaemonSettings);
        console.log('🔧 Вызываем IPC write-settings-to-config...');
        
        const configResult = await electronAPI.invoke('write-settings-to-config', changedDaemonSettings);
        console.log('🔧 IPC write-settings-to-config вернул:', configResult);
        
        if (!configResult.success) {
          throw new Error(`Ошибка записи в конфиг: ${configResult.error}`);
        }
        
        console.log('✅ Настройки успешно записаны в конфиг');
        
        // ========================================
        // 🔄 ПЕРЕЗАПУСК ДЕМОНА ПОСЛЕ СОХРАНЕНИЯ
        // ========================================
        console.log('🔍 Проверяем статус демона...');
        const statusResult = await electronAPI.invoke('check-daemon-status');
        console.log('📊 Статус демона:', statusResult);
        
        if (statusResult.isRunning) {
          console.log('🔄🔄🔄 ДЕМОН ЗАПУЩЕН - НАЧИНАЕМ ПЕРЕЗАПУСК! 🔄🔄🔄');
          const restartResult = await electronAPI.invoke('restart-daemon');
          console.log('🔧 restart-daemon вернул:', restartResult);
          
          if (restartResult.success) {
            console.log('✅✅✅ ДЕМОН УСПЕШНО ПЕРЕЗАПУЩЕН! ✅✅✅');
            console.log('🎉🎉🎉 НАСТРОЙКИ ПРИМЕНЕНЫ И ДЕМОН ПЕРЕЗАПУЩЕН! 🎉🎉🎉');
            console.log('✨ Все изменения вступили в силу! ✨');
          } else {
            console.error('❌❌❌ ОШИБКА ПЕРЕЗАПУСКА ДЕМОНА! ❌❌❌', restartResult.error);
            throw new Error(`Ошибка перезапуска демона: ${restartResult.error}`);
          }
        } else {
          console.log('ℹ️ Демон не запущен, перезапуск не требуется');
        }
        // ========================================
      } else {
        console.log('ℹ️ Нет изменений настроек демона, конфиг не обновляется');
      }
      
      // Обновляем настройки трея если изменились соответствующие параметры
      const traySettingsChanged = (
        newSettings.minimizeToTray !== settings.minimizeToTray ||
        newSettings.closeToTray !== settings.closeToTray
      );
      
      if (traySettingsChanged) {
        console.log('🔄 Обновляем настройки трея...');
        try {
          await electronAPI.invoke('update-tray-settings');
          console.log('✅ Настройки трея обновлены');
        } catch (error) {
          console.error('❌ Ошибка обновления настроек трея:', error);
        }
      }

      // Обновляем размер интерфейса если изменился соответствующий параметр
      const doubleSizeChanged = newSettings.doubleSize !== settings.doubleSize;
      
      if (doubleSizeChanged) {
        console.log('🔍 Применяем изменение размера интерфейса:', newSettings.doubleSize);
        console.log('🔍 electronAPI доступен:', !!electronAPI);
        try {
          if (newSettings.doubleSize) {
            // Включаем двойной размер (2.0x zoom)
            console.log('🔍 Вызываем set-window-zoom с параметром 2.0');
            const result = await electronAPI.invoke('set-window-zoom', 2.0);
            console.log('🔍 Результат set-window-zoom:', result);
            console.log('✅ Двойной размер интерфейса включен (2.0x zoom)');
          } else {
            // Отключаем двойной размер (стандартный масштаб)
            console.log('🔍 Вызываем set-window-zoom с параметром 1.0');
            const result = await electronAPI.invoke('set-window-zoom', 1.0);
            console.log('🔍 Результат set-window-zoom:', result);
            console.log('✅ Двойной размер интерфейса отключен (1.0x zoom)');
          }
        } catch (error) {
          console.error('❌ Ошибка обновления размера интерфейса:', error);
        }
      }
      
      setSettings(newSettings);
      
      // Обновляем контекстное меню трея
      try {
        await electronAPI.invoke('update-tray-settings');
        console.log('✅ Контекстное меню трея обновлено');
      } catch (error) {
        console.error('❌ Ошибка обновления трея:', error);
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [electronAPI, settings]);

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
      errors.httpPort = t('HTTP port must be in range 1024-65535');
    }
    
    if (settingsToValidate.socksPort < 1024 || settingsToValidate.socksPort > 65535) {
      errors.socksPort = t('SOCKS port must be in range 1024-65535');
    }
    
    if (settingsToValidate.httpPort === settingsToValidate.socksPort) {
      errors.socksPort = t('SOCKS port must be different from HTTP port');
    }
    
    // Валидация интервала обновления
    if (settingsToValidate.updateInterval < 1 || settingsToValidate.updateInterval > 60) {
      errors.updateInterval = t('Update interval must be between 1 and 60 seconds');
    }
    
    // Валидация максимальных туннелей
    if (settingsToValidate.maxTransitTunnels < 0 || settingsToValidate.maxTransitTunnels > 50) {
      errors.maxTransitTunnels = t('Maximum tunnels must be between 0 and 50');
    }
    
    return errors;
  }, [t]);

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

