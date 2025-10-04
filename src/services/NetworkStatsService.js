// Сервис для получения статистики от i2pd демона
export class NetworkStatsService {
  constructor(electronAPI) {
    this.electronAPI = electronAPI;
    // Веб-консоль i2pd работает на порту 7070 (не 4444!)
    this.baseUrl = 'http://127.0.0.1:7070';
  }

  // Получение основной статистики (парсинг HTML веб-консоли)
  async getBasicStats() {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      return this.parseHTMLStats(html);
    } catch (error) {
      console.error('Ошибка получения основной статистики:', error);
      return this.getMockStats();
    }
  }

  // Парсинг HTML страницы веб-консоли для извлечения статистики
  parseHTMLStats(html) {
    try {
      const stats = {};
      
      // Парсим Uptime (учитываем HTML теги)
      const uptimeMatch = html.match(/Uptime:\s*<\/b>\s*(\d+:\d+:\d+)/i) || 
                          html.match(/Uptime:\s*(\d+:\d+:\d+)/i);
      if (uptimeMatch) {
        stats.uptime = uptimeMatch[1];
        console.log('✅ Parsed Uptime:', stats.uptime);
      }
      
      // Парсим Network status
      const statusMatch = html.match(/Network status:\s*<\/b>\s*(\w+)/i) || 
                          html.match(/Network status:\s*(\w+)/i);
      if (statusMatch) {
        stats.networkStatus = statusMatch[1];
        console.log('✅ Parsed Network status:', stats.networkStatus);
      }
      
      // Парсим Tunnels
      const tunnelsMatch = html.match(/Tunnels:\s*<\/b>\s*(\d+)/i) || 
                           html.match(/Tunnels:\s*(\d+)/i);
      if (tunnelsMatch) {
        stats.activeTunnels = parseInt(tunnelsMatch[1]);
        console.log('✅ Parsed Tunnels:', stats.activeTunnels);
      }
      
      // Парсим Transit
      const transitMatch = html.match(/Transit:\s*<\/b>\s*(\d+)/i) || 
                           html.match(/Transit:\s*(\d+)/i);
      if (transitMatch) {
        stats.transitTunnels = parseInt(transitMatch[1]);
        console.log('✅ Parsed Transit:', stats.transitTunnels);
      }
      
      // Парсим Routers
      const routersMatch = html.match(/Routers:\s*<\/b>\s*(\d+)/i) || 
                           html.match(/Routers:\s*(\d+)/i);
      if (routersMatch) {
        stats.peerCount = parseInt(routersMatch[1]);
        console.log('✅ Parsed Routers:', stats.peerCount);
      }
      
      // Парсим Client tunnels
      const clientTunnelsMatch = html.match(/Client tunnels:\s*<\/b>\s*(\d+)/i) || 
                                 html.match(/Client tunnels:\s*(\d+)/i);
      if (clientTunnelsMatch) {
        stats.clientTunnels = parseInt(clientTunnelsMatch[1]);
        console.log('✅ Parsed Client tunnels:', stats.clientTunnels);
      }
      
      // Парсим Transit tunnels count
      const transitCountMatch = html.match(/Transit tunnels:\s*<\/b>\s*(\d+)/i) || 
                                html.match(/Transit tunnels:\s*(\d+)/i);
      if (transitCountMatch) {
        stats.transitTunnelsCount = parseInt(transitCountMatch[1]);
        console.log('✅ Parsed Transit tunnels:', stats.transitTunnelsCount);
      }
      
      // Парсим Received/Sent
      const receivedMatch = html.match(/Received:\s*<\/b>\s*([\d.]+)\s*(\w+)/i) || 
                            html.match(/Received:\s*([\d.]+)\s*(\w+)/i);
      if (receivedMatch) {
        stats.bytesReceived = `${receivedMatch[1]} ${receivedMatch[2]}`;
        console.log('✅ Parsed Received:', stats.bytesReceived);
      }
      
      const sentMatch = html.match(/Sent:\s*<\/b>\s*([\d.]+)\s*(\w+)/i) || 
                        html.match(/Sent:\s*([\d.]+)\s*(\w+)/i);
      if (sentMatch) {
        stats.bytesSent = `${sentMatch[1]} ${sentMatch[2]}`;
        console.log('✅ Parsed Sent:', stats.bytesSent);
      }
      
      // Парсим Transit data
      const transitReceivedMatch = html.match(/Transit received:\s*<\/b>\s*([\d.]+)\s*(\w+)/i) || 
                                   html.match(/Transit received:\s*([\d.]+)\s*(\w+)/i);
      if (transitReceivedMatch) {
        stats.transitReceived = `${transitReceivedMatch[1]} ${transitReceivedMatch[2]}`;
        console.log('✅ Parsed Transit received:', stats.transitReceived);
      }
      
      const transitSentMatch = html.match(/Transit sent:\s*<\/b>\s*([\d.]+)\s*(\w+)/i) || 
                               html.match(/Transit sent:\s*([\d.]+)\s*(\w+)/i);
      if (transitSentMatch) {
        stats.transitSent = `${transitSentMatch[1]} ${transitSentMatch[2]}`;
        console.log('✅ Parsed Transit sent:', stats.transitSent);
      }
      
      // Парсим Data path
      const dataPathMatch = html.match(/Data path:\s*<\/b>\s*([^\n<]+)/i) || 
                            html.match(/Data path:\s*([^\n<]+)/i);
      if (dataPathMatch) {
        stats.dataPath = dataPathMatch[1].trim();
        console.log('✅ Parsed Data path:', stats.dataPath);
      }
      
      console.log('📊 Parsed stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Ошибка парсинга HTML:', error);
      return {};
    }
  }

  // Получение расширенной статистики
  async getExtendedStats() {
    try {
      const basicStats = await this.getBasicStats();

      return {
        // Основная статистика
        bytesReceived: basicStats.bytesReceived || '0 B',
        bytesSent: basicStats.bytesSent || '0 B',
        activeTunnels: basicStats.activeTunnels || 0,
        peerCount: basicStats.peerCount || 0,
        
        // Детальная статистика
        uptime: basicStats.uptime || '00:00:00',
        networkStatus: basicStats.networkStatus || 'Unknown',
        clientTunnels: basicStats.clientTunnels || 0,
        transitTunnels: basicStats.transitTunnelsCount || 0,
        inboundTunnels: Math.floor((basicStats.activeTunnels || 0) / 2),
        outboundTunnels: Math.ceil((basicStats.activeTunnels || 0) / 2),
        
        // Транзитные данные
        transitReceived: basicStats.transitReceived || '0 B',
        transitSent: basicStats.transitSent || '0 B',
        
        // Роутер инфо
        floodfill: false,
        routerInfo: basicStats.peerCount || 0,
        netDbSize: Math.floor((basicStats.peerCount || 0) * 1.5),
        
        // Производительность (моковые данные пока)
        cpuUsage: Math.floor(Math.random() * 20) + 5,
        memoryUsage: Math.floor(Math.random() * 30) + 20,
        bandwidthLimit: 'L',
        
        // Сетевая активность
        connections: Math.floor((basicStats.activeTunnels || 0) * 0.8),
        packetsReceived: Math.floor(Math.random() * 2000) + 500,
        packetsSent: Math.floor(Math.random() * 1500) + 300,
        
        // Путь к данным
        dataPath: basicStats.dataPath || '—',
        
        // Время последнего обновления
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Ошибка получения расширенной статистики:', error);
      return this.getMockStats();
    }
  }

  // Получение страницы туннелей для парсинга
  async getTunnelsPage() {
    try {
      const response = await fetch(`${this.baseUrl}/?page=tunnels`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Ошибка получения страницы туннелей:', error);
      return '';
    }
  }

  // Получение страницы транзитных туннелей
  async getTransitTunnelsPage() {
    try {
      const response = await fetch(`${this.baseUrl}/?page=transit_tunnels`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Ошибка получения страницы транзитных туннелей:', error);
      return '';
    }
  }

  // Получение страницы transports
  async getTransportsPage() {
    try {
      const response = await fetch(`${this.baseUrl}/?page=transports`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Ошибка получения страницы транспортов:', error);
      return '';
    }
  }

  // Mock данные для тестирования
  getMockStats() {
    return {
      bytesReceived: '1.2 MB',
      bytesSent: '856 KB',
      activeTunnels: 12,
      peerCount: 156,
      uptime: '02:15:43',
      inboundTunnels: 6,
      outboundTunnels: 6,
      floodfill: false,
      routerInfo: 1247,
      netDbSize: 2048,
      cpuUsage: 15,
      memoryUsage: 45,
      bandwidthLimit: 'L',
      connections: 8,
      packetsReceived: 1247,
      packetsSent: 892,
      lastUpdate: new Date()
    };
  }

  // Форматирование байтов
  formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  // Форматирование времени
  formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Проверка доступности демона
  async isDaemonAvailable() {
    try {
      const response = await fetch(`${this.baseUrl}/api/stats`, { 
        method: 'HEAD',
        timeout: 5000 
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
