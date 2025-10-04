import React from 'react';
import styled from 'styled-components';
import { Download, Upload, Shield, Wifi, RefreshCw } from 'lucide-react';

const Card = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px ${props => props.theme.colors.shadow};
  backdrop-filter: blur(20px);
  background-color: ${props => props.theme.colors.surface}E6;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);

  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
    border-color: ${props => props.theme.colors.primary};
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 16px;
  background-color: ${props => props.theme.colors.background};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${props => props.theme.colors.shadow};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, ${props => props.color}20, ${props => props.color}10);
  color: ${props => props.color};
  margin-bottom: 12px;
  box-shadow: 0 2px 8px ${props => props.color}20;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
`;

function NetworkStats({ 
  bytesReceived, 
  bytesSent, 
  activeTunnels, 
  peerCount, 
  onRefresh, 
  isRunning 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          📊 Сетевая статистика
        </CardTitle>
        <RefreshButton 
          onClick={onRefresh}
          disabled={!isRunning}
          title="Обновить статистику"
        >
          <RefreshCw />
        </RefreshButton>
      </CardHeader>
      
      <StatsGrid>
        <StatItem>
          <StatIcon color="#34C759">
            <Download size={20} />
          </StatIcon>
          <StatValue>{bytesReceived}</StatValue>
          <StatLabel>Получено</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatIcon color="#007AFF">
            <Upload size={20} />
          </StatIcon>
          <StatValue>{bytesSent}</StatValue>
          <StatLabel>Отправлено</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatIcon color="#5856D6">
            <Shield size={20} />
          </StatIcon>
          <StatValue>{activeTunnels}</StatValue>
          <StatLabel>Туннели</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatIcon color="#FF9500">
            <Wifi size={20} />
          </StatIcon>
          <StatValue>{peerCount}</StatValue>
          <StatLabel>Роутеры</StatLabel>
        </StatItem>
      </StatsGrid>
    </Card>
  );
}

export default NetworkStats;

