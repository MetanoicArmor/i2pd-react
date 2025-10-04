import { IPC_CHANNELS, DAEMON_CONFIG } from '../constants';
import { formatBytes, formatTime } from '../utils';

// Сервис для работы с демоном
export class DaemonService {
  constructor(electronAPI) {
    this.electronAPI = electronAPI;
  }

  async checkStatus() {
    if (!this.electronAPI) {
      return { isRunning: false, error: 'Electron API not available' };
    }

    try {
      const result = await this.electronAPI.invoke(IPC_CHANNELS.CHECK_DAEMON_STATUS);
      return result;
    } catch (error) {
      return { isRunning: false, error: error.message };
    }
  }

  async start() {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      const result = await this.electronAPI.invoke(IPC_CHANNELS.START_DAEMON);
      if (!result.success) {
        throw new Error(result.error || 'Failed to start daemon');
      }
      return result;
    } catch (error) {
      throw new Error(`Failed to start daemon: ${error.message}`);
    }
  }

  async stop() {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      const result = await this.electronAPI.invoke(IPC_CHANNELS.STOP_DAEMON);
      if (!result.success) {
        throw new Error(result.error || 'Failed to stop daemon');
      }
      return result;
    } catch (error) {
      throw new Error(`Failed to stop daemon: ${error.message}`);
    }
  }

  async restart() {
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await this.start();
  }

  async getVersion() {
    if (!this.electronAPI) {
      return null;
    }

    try {
      const result = await this.electronAPI.invoke(IPC_CHANNELS.GET_DAEMON_VERSION);
      return result.version;
    } catch (error) {
      console.error('Error getting daemon version:', error);
      return null;
    }
  }
}

// Сервис для работы с настройками
export class SettingsService {
  constructor(electronAPI) {
    this.electronAPI = electronAPI;
  }

  async get(key, defaultValue = null) {
    if (!this.electronAPI) return defaultValue;

    try {
      const result = await this.electronAPI.invoke(IPC_CHANNELS.GET_STORE_VALUE, key);
      return result !== null ? result : defaultValue;
    } catch (error) {
      console.error('Error getting setting:', error);
      return defaultValue;
    }
  }

  async set(key, value) {
    if (!this.electronAPI) return;

    try {
      await this.electronAPI.invoke(IPC_CHANNELS.SET_STORE_VALUE, key, value);
    } catch (error) {
      console.error('Error setting setting:', error);
      throw error;
    }
  }

  async getAll() {
    const settings = {};
    const keys = ['theme', 'language', 'autoStartDaemon', 'httpPort', 'socksPort', 'bandwidth'];
    
    for (const key of keys) {
      settings[key] = await this.get(key);
    }
    
    return settings;
  }

  async reset() {
    const defaultSettings = {
      theme: 'dark',
      language: 'ru',
      autoStartDaemon: false,
      httpPort: DAEMON_CONFIG.defaultHttpPort,
      socksPort: DAEMON_CONFIG.defaultSocksPort,
      bandwidth: DAEMON_CONFIG.defaultBandwidth
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      await this.set(key, value);
    }
  }
}

// Сервис для работы с API демона
export class DaemonAPIService {
  constructor() {
    this.baseUrl = 'http://localhost:4444';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const stats = await this.request('/api/stats');
      return {
        uptime: formatTime(stats.uptime || 0),
        peers: stats.peers || 0,
        bytesReceived: formatBytes(stats.bytesReceived || 0),
        bytesSent: formatBytes(stats.bytesSent || 0),
        tunnels: stats.tunnels || 0,
        routers: stats.routers || 0
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        uptime: '00:00:00',
        peers: 0,
        bytesReceived: '0 B',
        bytesSent: '0 B',
        tunnels: 0,
        routers: 0
      };
    }
  }

  async getTunnels() {
    try {
      return await this.request('/api/tunnels');
    } catch (error) {
      console.error('Error getting tunnels:', error);
      return [];
    }
  }

  async getRouterInfo() {
    try {
      return await this.request('/api/routerinfo');
    } catch (error) {
      console.error('Error getting router info:', error);
      return null;
    }
  }
}

// Сервис для работы с файлами конфигурации
export class ConfigService {
  constructor(electronAPI) {
    this.electronAPI = electronAPI;
  }

  async readConfig(filePath) {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      const result = await this.electronAPI.invoke('read-config-file', filePath);
      return result.content;
    } catch (error) {
      throw new Error(`Failed to read config: ${error.message}`);
    }
  }

  async writeConfig(filePath, content) {
    if (!this.electronAPI) {
      throw new Error('Electron API not available');
    }

    try {
      const result = await this.electronAPI.invoke('write-config-file', filePath, content);
      return result.success;
    } catch (error) {
      throw new Error(`Failed to write config: ${error.message}`);
    }
  }

  parseConfig(content) {
    const config = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          config[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
    
    return config;
  }

  stringifyConfig(config) {
    return Object.entries(config)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n');
  }
}

