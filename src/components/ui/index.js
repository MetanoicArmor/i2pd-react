import styled from 'styled-components';

// Индикатор статуса
export const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  background: ${props => props.$isRunning 
    ? props.theme.colors.success + '20' 
    : props.theme.colors.error + '20'};
  border: 1px solid ${props => props.$isRunning 
    ? props.theme.colors.success 
    : props.theme.colors.error};
`;

export const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$isRunning 
    ? props.theme.colors.success 
    : props.theme.colors.error};
  animation: ${props => props.$isRunning ? 'pulse 2s infinite' : 'none'};
`;

export const StatusText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.$isRunning 
    ? props.theme.colors.success 
    : props.theme.colors.error};
`;

// Бейдж статуса
export const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => props.$isRunning 
    ? props.theme.colors.success + '20' 
    : props.theme.colors.error + '20'};
  color: ${props => props.$isRunning 
    ? props.theme.colors.success 
    : props.theme.colors.error};
`;

// Кнопки управления
export const StartButton = styled.button`
  background: linear-gradient(135deg, ${props => props.theme.colors.success}, #28a745);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 199, 89, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const StopButton = styled.button`
  background: linear-gradient(135deg, ${props => props.theme.colors.error}, #dc3545);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 59, 48, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const RestartButton = styled.button`
  background: linear-gradient(135deg, ${props => props.theme.colors.warning}, #fd7e14);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 149, 0, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Модальное окно
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
`;

export const Modal = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  background-color: ${props => props.theme.colors.surface}E6;
  animation: slideIn 0.3s ease-out;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ModalContent = styled.div`
  margin-bottom: 24px;
`;

export const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

// Кнопки модального окна
export const CancelButton = styled.button`
  padding: 12px 24px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  background-color: transparent;
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.surface};
    border-color: ${props => props.theme.colors.textSecondary};
  }
`;

export const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryDark});
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Лоадер
export const Loader = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
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

// Тултип
export const Tooltip = styled.div`
  position: relative;
  display: inline-block;

  &:hover::after {
    content: '${props => props.tooltip}';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
  }
`;

