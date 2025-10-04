import React from 'react';
import styled from 'styled-components';
import { X, ExternalLink, Github, Heart } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
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

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const AppInfo = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const AppName = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0 0 8px 0;
`;

const AppDescription = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const Version = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 24px;
`;

const Features = styled.div`
  margin-bottom: 24px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
`;

const FeatureIcon = styled.div`
  color: ${props => props.theme.colors.primary};
`;

const TechStack = styled.div`
  margin-bottom: 24px;
`;

const TechTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 12px 0;
`;

const TechList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TechTag = styled.span`
  padding: 4px 8px;
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const Links = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const LinkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background-color: transparent;
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.border};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
  text-align: center;
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

function AboutModal({ isOpen, onClose, version }) {
  if (!isOpen) return null;

  const openExternal = (url) => {
    if (window.electronAPI) {
      window.electronAPI.invoke('open-external', url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>О программе</Title>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </Header>
        
        <Content>
          <AppInfo>
            <AppName>I2P Daemon GUI</AppName>
            <AppDescription>
              Современный кроссплатформенный GUI для управления I2P Daemon
            </AppDescription>
            <Version>Версия: {version}</Version>
          </AppInfo>

          <Features>
            <FeatureList>
              <FeatureItem>
                <FeatureIcon>🚀</FeatureIcon>
                Управление демоном в реальном времени
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon>📊</FeatureIcon>
                Мониторинг сетевой статистики
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon>🌐</FeatureIcon>
                Кроссплатформенность (Windows, macOS, Linux)
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon>🎨</FeatureIcon>
                Современный адаптивный интерфейс
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon>🔧</FeatureIcon>
                Гибкие настройки конфигурации
              </FeatureItem>
            </FeatureList>
          </Features>

          <TechStack>
            <TechTitle>Технологии:</TechTitle>
            <TechList>
              <TechTag>React</TechTag>
              <TechTag>Electron</TechTag>
              <TechTag>Styled Components</TechTag>
              <TechTag>i18next</TechTag>
              <TechTag>Node.js</TechTag>
            </TechList>
          </TechStack>

          <Links>
            <LinkButton onClick={() => openExternal('https://github.com/i2p-gui')}>
              <Github />
              GitHub
            </LinkButton>
            <LinkButton onClick={() => openExternal('https://geti2p.net')}>
              <ExternalLink />
              I2P Project
            </LinkButton>
          </Links>
        </Content>

        <Footer>
          Сделано с <Heart size={12} style={{ color: '#ff6b6b', margin: '0 2px' }} /> для сообщества I2P
        </Footer>
      </Modal>
    </Overlay>
  );
}

export default AboutModal;

