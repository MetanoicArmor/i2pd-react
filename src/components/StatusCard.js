import React from 'react';
import styled from 'styled-components';
import { Clock, Users, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  gap: 8px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.$isRunning ? props.theme.colors.success : props.theme.colors.error};
  color: white;
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: white;
  animation: ${props => props.$isRunning ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${props => props.color}20;
  color: ${props => props.color};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 2px;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

function StatusCard({ isRunning, uptime, peerCount }) {
  const { t } = useTranslation();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Daemon Status')}</CardTitle>
        <StatusBadge $isRunning={isRunning}>
          <StatusDot $isRunning={isRunning} />
          {isRunning ? t('Running') : t('Stopped')}
        </StatusBadge>
      </CardHeader>
      
      <StatsGrid>
        <StatItem>
          <StatIcon color="#007AFF">
            <Clock size={16} />
          </StatIcon>
          <StatContent>
            <StatLabel>{t('Uptime')}</StatLabel>
            <StatValue>{uptime}</StatValue>
          </StatContent>
        </StatItem>
        
        <StatItem>
          <StatIcon color="#34C759">
            <Users size={16} />
          </StatIcon>
          <StatContent>
            <StatLabel>{t('Connections')}</StatLabel>
            <StatValue>{peerCount}</StatValue>
          </StatContent>
        </StatItem>
      </StatsGrid>
    </Card>
  );
}

export default StatusCard;
