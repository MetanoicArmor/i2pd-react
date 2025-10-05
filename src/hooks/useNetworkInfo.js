import { useState, useEffect, useCallback } from 'react';

export const useNetworkInfo = (electronAPI) => {
  const [networkInfo, setNetworkInfo] = useState({
    httpPort: 4444,
    socksPort: 4447,
    bandwidth: 'L',
    externalPort: null,
    isLoading: false,
    error: null
  });

  const fetchNetworkInfo = useCallback(async () => {
    if (!electronAPI) {
      console.log('❌ useNetworkInfo: electronAPI недоступен');
      return;
    }

    setNetworkInfo(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🔍 useNetworkInfo: Получение информации о сети из веб-консоли...');
      const result = await electronAPI.invoke('get-daemon-network-info');
      
      if (result.success) {
        console.log('✅ useNetworkInfo: Информация получена:', result.networkInfo);
        setNetworkInfo(prev => ({
          ...prev,
          ...result.networkInfo,
          isLoading: false,
          error: null
        }));
      } else {
        console.log('❌ useNetworkInfo: Ошибка получения информации:', result.error);
        setNetworkInfo(prev => ({
          ...prev,
          isLoading: false,
          error: result.error
        }));
      }
    } catch (error) {
      console.error('❌ useNetworkInfo: Исключение при получении информации:', error);
      setNetworkInfo(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, [electronAPI]);

  // Автоматически загружаем информацию при монтировании компонента
  useEffect(() => {
    fetchNetworkInfo();
  }, [fetchNetworkInfo]);

  return {
    networkInfo,
    fetchNetworkInfo,
    isLoading: networkInfo.isLoading,
    error: networkInfo.error
  };
};

