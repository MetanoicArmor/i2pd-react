import React from 'react';
import styled from 'styled-components';
import { Settings, Info, RefreshCw, Minimize2 } from 'lucide-react';

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
  font-size: 18px;
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
  return (
    <HeaderContainer>
      <Title>I2P Daemon GUI</Title>
      
      <Controls>
        <StatusIndicator $isRunning={isRunning}>
          <StatusDot $isRunning={isRunning} />
          {isRunning ? 'Running' : 'Stopped'}
        </StatusIndicator>
        
        <ControlButton 
          onClick={onRefreshClick}
          title="Обновить статус"
        >
          <RefreshCw />
        </ControlButton>
        
        <ControlButton 
          onClick={onSettingsClick}
          title="Настройки"
        >
          <Settings />
        </ControlButton>
        
        <ControlButton 
          onClick={onAboutClick}
          title="О программе"
        >
          <Info />
        </ControlButton>
        
        <ControlButton 
          onClick={() => window.electronAPI?.invoke('minimize-to-tray')}
          title="Свернуть в трей"
        >
          <Minimize2 />
        </ControlButton>
      </Controls>
    </HeaderContainer>
  );
}

export default Header;
