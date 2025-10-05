import { useState, useEffect, useCallback } from 'react';
import { IPC_CHANNELS } from '../constants';

export const useNetworkInfo = (electronAPI) => {
  const [networkInfo, setNetworkInfo] = useState({
    httpPort: 4444,
    socksPort: 4447,
    bandwidth: 'L',
    externalPort: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNetworkInfo = useCallback(async () => {
    if (!electronAPI) {
      console.log('❌ useNetworkInfo: electronAPI недоступен');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 useNetworkInfo: Получение информации о сети из веб-консоли...');
      const result = await electronAPI.invoke(IPC_CHANNELS.GET_DAEMON_NETWORK_INFO);
      
      if (result.success) {
        console.log('✅ useNetworkInfo: Информация получена:', result.networkInfo);
        setNetworkInfo(result.networkInfo);
        setError(null);
      } else {
        console.log('❌ useNetworkInfo: Ошибка получения информации:', result.error);
        // Не показываем ошибку, если демон просто не запущен
        if (result.error && !result.error.includes('не запущен')) {
          setError(result.error);
        } else {
          setError(null);
        }
      }
    } catch (error) {
      console.error('❌ useNetworkInfo: Исключение при получении информации:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [electronAPI]);

  // Автоматически загружаем информацию при монтировании компонента
  useEffect(() => {
    fetchNetworkInfo();
  }, [fetchNetworkInfo]);

  return {
    networkInfo,
    isLoading,
    error,
    refreshNetworkInfo: fetchNetworkInfo
  };
};

