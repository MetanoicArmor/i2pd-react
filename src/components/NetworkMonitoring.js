import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Download, 
  Upload, 
  Shield, 
  Wifi, 
  RefreshCw, 
  Activity,
  Clock,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Стилизованные компоненты
const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 12px ${props => props.theme.colors.shadow};
  backdrop-filter: blur(20px);
  background-color: ${props => props.theme.colors.surface}E6;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: ${props => props.theme.colors.primary};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: ${props => props.theme.colors.background};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  margin-bottom: 8px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
  text-align: center;
`;

const DetailedStats = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const DetailedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const DetailedItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const DetailedIcon = styled.div`
  color: ${props => props.color || props.theme.colors.textSecondary};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DetailedText = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

const DetailedValue = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: auto;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 50%;
  border-top-color: ${props => props.theme.colors.primary};
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: ${props => props.theme.colors.error}20;
  border: 1px solid ${props => props.theme.colors.error};
  border-radius: 8px;
  color: ${props => props.theme.colors.error};
  font-size: 14px;
  margin-top: 16px;
`;

// Компонент расширенного мониторинга сети
const NetworkMonitoring = ({ 
  isRunning, 
  stats = {
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
  },
  onRefresh, 
  isLoading = false,
  error = null 
}) => {
  const { t } = useTranslation();

  // Обработка обновления
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <BarChart3 size={20} />
          {t('Network Statistics')}
        </CardTitle>
        <RefreshButton 
          onClick={handleRefresh}
          disabled={!isRunning || isLoading}
          title={t('Refresh statistics')}
        >
          {isLoading ? <LoadingSpinner /> : <RefreshCw />}
        </RefreshButton>
      </CardHeader>

      {error && (
        <ErrorMessage>
          <Activity size={16} />
          {error}
        </ErrorMessage>
      )}

      {/* Основная статистика */}
      <StatsGrid>
        <StatItem>
          <StatIcon color="#34C759">
            <Download size={20} />
          </StatIcon>
          <StatValue>{stats.bytesReceived}</StatValue>
          <StatLabel>{t('Received')}</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatIcon color="#007AFF">
            <Upload size={20} />
          </StatIcon>
          <StatValue>{stats.bytesSent}</StatValue>
          <StatLabel>{t('Sent')}</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatIcon color="#5856D6">
            <Shield size={20} />
          </StatIcon>
          <StatValue>{stats.activeTunnels}</StatValue>
          <StatLabel>{t('Tunnels')}</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatIcon color="#FF9500">
            <Wifi size={20} />
          </StatIcon>
          <StatValue>{stats.peerCount}</StatValue>
          <StatLabel>{t('Routers')}</StatLabel>
        </StatItem>
      </StatsGrid>

      {/* Детальная статистика */}
      <DetailedStats>
        <CardTitle style={{ fontSize: '14px', marginBottom: '16px' }}>
          {t('Information')}
        </CardTitle>
        
        <DetailedGrid>
          <DetailedItem>
            <DetailedIcon color="#8E8E93">
              <Clock size={16} />
            </DetailedIcon>
            <DetailedText>{t('Uptime')}</DetailedText>
            <DetailedValue>{stats.uptime}</DetailedValue>
          </DetailedItem>

          <DetailedItem>
            <DetailedIcon color="#34C759">
              <Shield size={16} />
            </DetailedIcon>
            <DetailedText>{t('Inbound tunnels')}</DetailedText>
            <DetailedValue>{stats.inboundTunnels}</DetailedValue>
          </DetailedItem>

          <DetailedItem>
            <DetailedIcon color="#007AFF">
              <Shield size={16} />
            </DetailedIcon>
            <DetailedText>{t('Outbound tunnels')}</DetailedText>
            <DetailedValue>{stats.outboundTunnels}</DetailedValue>
          </DetailedItem>

          <DetailedItem>
            <DetailedIcon color={stats.floodfill ? "#FF9500" : "#8E8E93"}>
              <Activity size={16} />
            </DetailedIcon>
            <DetailedText>Floodfill</DetailedText>
            <DetailedValue>{stats.floodfill ? t('Yes') : t('No')}</DetailedValue>
          </DetailedItem>

          <DetailedItem>
            <DetailedIcon color="#5856D6">
              <Users size={16} />
            </DetailedIcon>
            <DetailedText>RouterInfo</DetailedText>
            <DetailedValue>{stats.routerInfo}</DetailedValue>
          </DetailedItem>

          <DetailedItem>
            <DetailedIcon color="#FF9500">
              <TrendingUp size={16} />
            </DetailedIcon>
            <DetailedText>{t('NetDB size')}</DetailedText>
            <DetailedValue>{stats.netDbSize} KB</DetailedValue>
          </DetailedItem>

          <DetailedItem>
            <DetailedIcon color="#34C759">
              <Activity size={16} />
            </DetailedIcon>
            <DetailedText>CPU</DetailedText>
            <DetailedValue>{stats.cpuUsage}%</DetailedValue>
          </DetailedItem>

          <DetailedItem>
            <DetailedIcon color="#007AFF">
              <Activity size={16} />
            </DetailedIcon>
            <DetailedText>{t('Memory')}</DetailedText>
            <DetailedValue>{stats.memoryUsage}%</DetailedValue>
          </DetailedItem>

          <DetailedItem>
            <DetailedIcon color="#FF9500">
              <TrendingUp size={16} />
            </DetailedIcon>
            <DetailedText>{t('Bandwidth')}</DetailedText>
            <DetailedValue>{stats.bandwidthLimit}</DetailedValue>
          </DetailedItem>

          <DetailedItem>
            <DetailedIcon color="#5856D6">
              <Wifi size={16} />
            </DetailedIcon>
            <DetailedText>{t('Connections')}</DetailedText>
            <DetailedValue>{stats.connections}</DetailedValue>
          </DetailedItem>

          <DetailedItem>
            <DetailedIcon color="#34C759">
              <Download size={16} />
            </DetailedIcon>
            <DetailedText>{t('Packets received')}</DetailedText>
            <DetailedValue>{stats.packetsReceived}</DetailedValue>
          </DetailedItem>

          <DetailedItem>
            <DetailedIcon color="#007AFF">
              <Upload size={16} />
            </DetailedIcon>
            <DetailedText>{t('Packets sent')}</DetailedText>
            <DetailedValue>{stats.packetsSent}</DetailedValue>
          </DetailedItem>
        </DetailedGrid>

        {stats.lastUpdate && (
          <div style={{ 
            marginTop: '16px', 
            fontSize: '12px', 
            color: '#8E8E93',
            textAlign: 'center'
          }}>
            Последнее обновление: {stats.lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </DetailedStats>
    </Card>
  );
};

export default NetworkMonitoring;
