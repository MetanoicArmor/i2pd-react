import React from 'react';
import styled from 'styled-components';
import { Trash2, FileText } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  background-color: ${props => props.theme.colors.surface}E6;
  box-shadow: 0 4px 20px ${props => props.theme.colors.shadow};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.background};
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);

  &:hover {
    background-color: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
    border-color: ${props => props.theme.colors.error};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LogsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const LogEntry = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.background};
    transform: translateX(4px);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Timestamp = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  min-width: 70px;
  font-size: 12px;
  font-weight: 500;
`;

const Level = styled.div`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
  background-color: ${props => {
    switch (props.level) {
      case 'error': return props.theme.colors.error;
      case 'warn': return props.theme.colors.warning;
      case 'info': return props.theme.colors.primary;
      case 'debug': return props.theme.colors.textSecondary;
      default: return props.theme.colors.border;
    }
  }};
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Message = styled.div`
  flex: 1;
  color: ${props => props.theme.colors.text};
  word-break: break-word;
  font-weight: 400;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  padding: 40px;
`;

const EmptyIcon = styled.div`
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const EmptyDescription = styled.div`
  font-size: 14px;
  opacity: 0.7;
`;

function LogsViewer({ logs, onClear }) {
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <Container>
      <Header>
        <Title>
          📋 Логи системы
        </Title>
        {logs.length > 0 && (
          <ClearButton onClick={onClear}>
            <Trash2 />
            Очистить
          </ClearButton>
        )}
      </Header>
      
      <LogsContainer>
        {logs.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <FileText size={48} />
            </EmptyIcon>
            <EmptyTitle>Система готова к работе</EmptyTitle>
            <EmptyDescription>
              Логи появятся при запуске демона
            </EmptyDescription>
          </EmptyState>
        ) : (
          logs.map((log) => (
            <LogEntry key={log.id}>
              <Timestamp>{formatTime(log.timestamp)}</Timestamp>
              <Level level={log.level}>{log.level.toUpperCase()}</Level>
              <Message>{log.message}</Message>
            </LogEntry>
          ))
        )}
      </LogsContainer>
    </Container>
  );
}

export default LogsViewer;

