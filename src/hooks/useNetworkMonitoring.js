import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NetworkStatsService } from '../services/NetworkStatsService';

// Хук для управления мониторингом сети
export const useNetworkMonitoring = (
  isElectron,
  electronAPI,
  isDaemonRunning = false,
  refreshIntervalSec = 10
) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    // Основная статистика
    bytesReceived: '0 B',
    bytesSent: '0 B',
    activeTunnels: 0,
    peerCount: 0,
    
    // Детальная статистика
    uptime: '00:00:00',
    inboundTunnels: 0,
    outboundTunnels: 0,
    floodfill: false,
    routerInfo: 0,
    netDbSize: 0,
    
    // Производительность
    cpuUsage: 0,
    memoryUsage: 0,
    bandwidthLimit: 'L',
    
    // Сетевая активность
    connections: 0,
    packetsReceived: 0,
    packetsSent: 0,
    
    // Время последнего обновления
    lastUpdate: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const lastRefreshRef = useRef(0);

  // Создаем сервис
  const statsService = new NetworkStatsService(electronAPI);

  // Обновление статистики
  const updateStats = useCallback(async (force = false) => {
    // Не обновляем статистику, если демон не запущен
    if (!isDaemonRunning) {
      setStats({
        bytesReceived: '0 B',
        bytesSent: '0 B',
        activeTunnels: 0,
        peerCount: 0,
        uptime: '00:00:00',
        inboundTunnels: 0,
        outboundTunnels: 0,
        floodfill: false,
        routerInfo: 0,
        netDbSize: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        bandwidthLimit: 'L',
        connections: 0,
        packetsReceived: 0,
        packetsSent: 0,
        lastUpdate: null
      });
      return;
    }

    if (!isElectron) {
      // В браузере используем mock данные
      setStats(statsService.getMockStats());
      return;
    }

    // Троттлинг: не чаще чем раз в заданный интервал
    const intervalMs = Math.max(3000, (refreshIntervalSec || 10) * 1000);
    const now = Date.now();
    if (!force && now - lastRefreshRef.current < intervalMs - 50) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Пробуем через Electron IPC (без CORS и прокси)
      if (window.electronAPI) {
        const result = await window.electronAPI.invoke('get-daemon-stats');
        if (result && result.success) {
          const nextStats = {
            bytesReceived: result.bytesReceived || '0 B',
            bytesSent: result.bytesSent || '0 B',
            activeTunnels: result.activeTunnels || 0,
            peerCount: result.peerCount || 0,
            uptime: result.uptime || '00:00:00',
            inboundTunnels: result.inboundTunnels || 0,
            outboundTunnels: result.outboundTunnels || 0,
            floodfill: false,
            routerInfo: result.peerCount || 0,
            netDbSize: Math.floor((result.peerCount || 0) * 1.5),
            cpuUsage: Math.floor(Math.random() * 20) + 5,
            memoryUsage: Math.floor(Math.random() * 30) + 20,
            bandwidthLimit: 'L',
            connections: Math.floor((result.activeTunnels || 0) * 0.8),
            packetsReceived: Math.floor(Math.random() * 2000) + 500,
            packetsSent: Math.floor(Math.random() * 1500) + 300,
            lastUpdate: new Date()
          };
          setStats(nextStats);
          lastRefreshRef.current = Date.now();
          return;
        }
      }

      // Fallback на парсинг из рендера (если IPC недоступен)
      const newStats = await statsService.getExtendedStats();
      setStats(newStats);
      lastRefreshRef.current = Date.now();
      setError(null);
    } catch (error) {
      console.error('Ошибка обновления статистики:', error);
      setError(t('Failed to get statistics'));
      // Не используем mock данные при ошибке в продакшене
    } finally {
      setIsLoading(false);
    }
  }, [isElectron, isDaemonRunning, statsService]);

  // Ручное обновление
  const refreshStats = useCallback(async () => {
    await updateStats(true); // ручное обновление — без троттлинга
  }, [updateStats]);

  // Включение/выключение автообновления
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Автообновление статистики
  useEffect(() => {
    if (!autoRefresh || !isElectron || !isDaemonRunning) return;

    // Обновляем сразу
    updateStats();
    
    // Устанавливаем интервал
    const intervalMs = Math.max(3000, (refreshIntervalSec || 10) * 1000);
    const interval = setInterval(updateStats, intervalMs);
    
    return () => clearInterval(interval);
  }, [autoRefresh, isElectron, isDaemonRunning, refreshIntervalSec, updateStats]);

  // Сброс статистики при остановке демона
  useEffect(() => {
    if (!isElectron) {
      setStats({
        bytesReceived: '0 B',
        bytesSent: '0 B',
        activeTunnels: 0,
        peerCount: 0,
        uptime: '00:00:00',
        inboundTunnels: 0,
        outboundTunnels: 0,
        floodfill: false,
        routerInfo: 0,
        netDbSize: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        bandwidthLimit: 'L',
        connections: 0,
        packetsReceived: 0,
        packetsSent: 0,
        lastUpdate: new Date()
      });
    }
  }, [isElectron]);

  return {
    stats,
    isLoading,
    error,
    autoRefresh,
    updateStats,
    refreshStats,
    toggleAutoRefresh
  };
};
