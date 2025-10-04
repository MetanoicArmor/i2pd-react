import React from 'react';
import styled from 'styled-components';
import { Play, Square, RotateCcw, Settings } from 'lucide-react';

const Container = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    transition: all 0.1s ease;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const StartButton = styled(Button)`
  background: linear-gradient(135deg, ${props => props.theme.colors.success}, ${props => props.theme.colors.success}CC);
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${props => props.theme.colors.success}DD, ${props => props.theme.colors.success}BB);
  }
`;

const StopButton = styled(Button)`
  background: linear-gradient(135deg, ${props => props.theme.colors.error}, ${props => props.theme.colors.error}CC);
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${props => props.theme.colors.error}DD, ${props => props.theme.colors.error}BB);
  }
`;

const RestartButton = styled(Button)`
  background: linear-gradient(135deg, ${props => props.theme.colors.warning}, ${props => props.theme.colors.warning}CC);
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${props => props.theme.colors.warning}DD, ${props => props.theme.colors.warning}BB);
  }
`;

const SettingsButton = styled(Button)`
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  backdrop-filter: blur(20px);

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.border};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function ControlButtons({ 
  isRunning, 
  isLoading, 
  onStart, 
  onStop, 
  onRestart, 
  onSettings 
}) {
  return (
    <Container>
      <StartButton 
        onClick={onStart}
        disabled={isRunning || isLoading}
      >
        {isLoading ? <LoadingSpinner /> : <Play />}
        Запустить
      </StartButton>
      
      <StopButton 
        onClick={onStop}
        disabled={!isRunning || isLoading}
      >
        {isLoading ? <LoadingSpinner /> : <Square />}
        Остановить
      </StopButton>
      
      <RestartButton 
        onClick={onRestart}
        disabled={isLoading}
      >
        {isLoading ? <LoadingSpinner /> : <RotateCcw />}
        Перезапустить
      </RestartButton>
      
      <SettingsButton 
        onClick={onSettings}
        disabled={isLoading}
      >
        <Settings />
        Настройки
      </SettingsButton>
    </Container>
  );
}

export default ControlButtons;
