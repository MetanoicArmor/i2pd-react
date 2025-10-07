import React from 'react';

import {
  Info,
  Minimize2,
  RefreshCw,
  Settings,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  -webkit-app-region: drag;
  backdrop-filter: blur(20px);
  background-color: ${props => props.theme.colors.surface}CC;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: ${props => props.$isRunning ? props.theme.colors.success : props.theme.colors.error};
  color: white;
  font-size: 12px;
  font-weight: 500;
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

function Header({ 
  onSettingsClick, 
  onAboutClick, 
  onRefreshClick, 
  isRunning 
}) {
  const { t } = useTranslation();
  
  return (
    <HeaderContainer>
      <Title>I2P Daemon GUI</Title>
      
      <Controls>
        <StatusIndicator $isRunning={isRunning}>
          <StatusDot $isRunning={isRunning} />
          {isRunning ? t('Running') : t('Stopped')}
        </StatusIndicator>
        
        <ControlButton 
          onClick={onRefreshClick}
          title={t('Refresh status')}
        >
          <RefreshCw />
        </ControlButton>
        
        <ControlButton 
          onClick={onSettingsClick}
          title={t('Settings')}
        >
          <Settings />
        </ControlButton>
        
        <ControlButton 
          onClick={onAboutClick}
          title={t('About')}
        >
          <Info />
        </ControlButton>
        
        <ControlButton 
          onClick={() => {
            console.log('🔍 Увеличиваем интерфейс...');
            if (window.electronAPI) {
              // Используем встроенную функциональность Electron
              window.electronAPI.invoke('set-window-zoom', 2.0).then(result => {
                console.log('🔍 Результат увеличения:', result);
              });
            }
          }}
          title="Увеличить интерфейс в 2 раза"
          style={{ backgroundColor: '#4CAF50', color: 'white' }}
        >
          <ZoomIn />
        </ControlButton>
        
        <ControlButton 
          onClick={() => {
            console.log('🔍 Сбрасываем масштаб интерфейса...');
            if (window.electronAPI) {
              // Используем встроенную функциональность Electron
              window.electronAPI.invoke('set-window-zoom', 1.0).then(result => {
                console.log('🔍 Результат сброса масштаба:', result);
              });
            }
          }}
          title="Сбросить масштаб интерфейса"
          style={{ backgroundColor: '#FF9800', color: 'white' }}
        >
          <ZoomOut />
        </ControlButton>
        
        <ControlButton 
          onClick={() => window.electronAPI?.invoke('minimize-to-tray')}
          title={t('Minimize to tray')}
        >
          <Minimize2 />
        </ControlButton>
        
        <ControlButton 
          onClick={() => {
            console.log('🧪 Тестируем иконки трея...');
            window.electronAPI?.invoke('test-tray-icons').then(result => {
              console.log('🧪 Результат теста иконок:', result);
            });
          }}
          title="Тест иконок трея"
          style={{ backgroundColor: '#ff6b6b', color: 'white' }}
        >
          🎭
        </ControlButton>
      </Controls>
    </HeaderContainer>
  );
}

export default Header;
