import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSettings } from '../hooks/useSettings';
import { 
  SETTINGS_CATEGORIES
} from '../constants/settings';
import { useTranslatedConstants } from '../utils/translatedConstants';
import ConfigManagement from './ConfigManagement';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

// Стилизованные компоненты
const ModalOverlay = styled.div`
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
`;

const Modal = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: ${props => props.theme.colors.border};
  }
`;

const Warning = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: ${props => props.theme.colors.warning || '#FFF3CD'};
  border: 1px solid ${props => props.theme.colors.warningBorder || '#FFEAA7'};
  border-radius: 8px;
  margin-bottom: 16px;
  color: ${props => props.theme.colors.warningText || '#856404'};
  font-size: 14px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: none;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.background};
  }
`;

const TabContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
`;

const Description = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 4px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const ResetButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background-color: transparent;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.colors.border};
  }
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background-color: transparent;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.colors.border};
  }
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary}dd;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Компонент настроек
const SettingsModal = ({ isOpen, onClose, electronAPI, onSaved, settings: extSettings, saveSettings: extSaveSettings, validateSettings: extValidateSettings }) => {
  const { t } = useTranslation();
  const translatedConstants = useTranslatedConstants();
  const [activeTab, setActiveTab] = useState(SETTINGS_CATEGORIES.GENERAL);
  const [localSettings, setLocalSettings] = useState({});
  const [errors, setErrors] = useState({});
  
  const hook = useSettings(electronAPI);
  const settings = extSettings ?? hook.settings;
  const isLoading = hook.isLoading;
  const isSaving = hook.isSaving;
  const saveSettings = extSaveSettings ?? hook.saveSettings;
  const validateSettings = extValidateSettings ?? hook.validateSettings;
  const resetSettings = hook.resetSettings;

  // Инициализация локальных настроек
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setErrors({});
    }
  }, [isOpen, settings]);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    
    // Валидация
    if (validateSettings) {
      const validation = validateSettings({ ...localSettings, [key]: value });
      if (validation && validation[key]) {
        setErrors(prev => ({ ...prev, [key]: validation[key] }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      const success = await saveSettings(localSettings);
      if (success) {
        onSaved && onSaved(localSettings);
        
        // Проверяем, есть ли изменения настроек демона
        const daemonSettings = ['httpPort', 'socksPort', 'bandwidth', 'enableIPv6', 'enableUPnP', 'logLevel', 'enableFloodfill', 'enableTransit', 'maxTransitTunnels'];
        const hasDaemonChanges = daemonSettings.some(key => localSettings[key] !== settings[key]);
        
        if (hasDaemonChanges && electronAPI) {
          // Проверяем статус демона
          const statusResult = await electronAPI.invoke('check-daemon-status');
          if (statusResult.isRunning) {
            // Показываем диалог с предложением перезапустить демон
            const shouldRestart = window.confirm(t('Settings require daemon restart to take effect. Restart daemon now?'));
            if (shouldRestart) {
              try {
                console.log('🔄 Перезапускаем демон...');
                await electronAPI.invoke('stop-daemon');
                console.log('⏳ Ждем остановки демона...');
                
                // Ждем остановки демона
                let attempts = 0;
                while (attempts < 10) {
                  const checkResult = await electronAPI.invoke('check-daemon-status');
                  if (!checkResult.isRunning) {
                    break;
                  }
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  attempts++;
                }
                
                console.log('🚀 Запускаем демон с новыми настройками...');
                await electronAPI.invoke('start-daemon');
                console.log('✅ Демон перезапущен с новыми настройками');
              } catch (error) {
                console.error('❌ Ошибка перезапуска демона:', error);
                alert(t('Failed to restart daemon. Please restart manually.'));
              }
            }
          }
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{t('Settings')}</ModalTitle>
          <ModalCloseButton onClick={onClose}>✕</ModalCloseButton>
        </ModalHeader>

        <TabContainer>
          <Tab 
            $active={activeTab === SETTINGS_CATEGORIES.GENERAL}
            onClick={() => setActiveTab(SETTINGS_CATEGORIES.GENERAL)}
          >
            {t('General')}
          </Tab>
          <Tab 
            $active={activeTab === SETTINGS_CATEGORIES.NETWORK}
            onClick={() => setActiveTab(SETTINGS_CATEGORIES.NETWORK)}
          >
            {t('Network')}
          </Tab>
          <Tab 
            $active={activeTab === SETTINGS_CATEGORIES.ADVANCED}
            onClick={() => setActiveTab(SETTINGS_CATEGORIES.ADVANCED)}
          >
            {t('Advanced')}
          </Tab>
          <Tab 
            $active={activeTab === SETTINGS_CATEGORIES.APPEARANCE}
            onClick={() => setActiveTab(SETTINGS_CATEGORIES.APPEARANCE)}
          >
            {t('Appearance')}
          </Tab>
          <Tab 
            $active={activeTab === SETTINGS_CATEGORIES.CONFIG}
            onClick={() => setActiveTab(SETTINGS_CATEGORIES.CONFIG)}
          >
            {t('Config')}
          </Tab>
        </TabContainer>

        <TabContent>
          {activeTab === SETTINGS_CATEGORIES.GENERAL && (
            <>
              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.autoStartDaemon || false}
                    onChange={(e) => handleSettingChange('autoStartDaemon', e.target.checked)}
                  />
                  {t('Auto-start daemon on app launch')}
                </CheckboxLabel>
                <Description>
                  {t('Daemon will automatically start when opening the app')}
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.startMinimized || false}
                    onChange={(e) => handleSettingChange('startMinimized', e.target.checked)}
                  />
                  {t('Start minimized')}
                </CheckboxLabel>
                <Description>
                  {t('App will start minimized to tray')}
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.minimizeToTray || false}
                    onChange={(e) => handleSettingChange('minimizeToTray', e.target.checked)}
                  />
                  {t('Minimize to tray')}
                </CheckboxLabel>
                <Description>
                  {t('When minimizing, window will hide to system tray')}
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.closeToTray || false}
                    onChange={(e) => handleSettingChange('closeToTray', e.target.checked)}
                  />
                  {t('Close to tray')}
                </CheckboxLabel>
                <Description>
                  {t('When closing window, app will hide to tray instead of quitting')}
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.hideFromDock || false}
                    onChange={(e) => handleSettingChange('hideFromDock', e.target.checked)}
                  />
                  {t('Hide from Dock (macOS)')}
                </CheckboxLabel>
                <Description>
                  {t('App will not be displayed in Dock on macOS')}
                </Description>
              </FormGroup>
            </>
          )}

          {activeTab === SETTINGS_CATEGORIES.NETWORK && (
            <>
              <FormGroup>
                <Label>{t('HTTP Proxy Port')}</Label>
                <Input
                  type="number"
                  value={localSettings.httpPort || 4444}
                  onChange={(e) => handleSettingChange('httpPort', parseInt(e.target.value))}
                  min="1024"
                  max="65535"
                />
                <Description>
                  {t('Port for HTTP proxy (default: 4444)')}
                </Description>
              </FormGroup>

              <FormGroup>
                <Label>{t('SOCKS Proxy Port')}</Label>
                <Input
                  type="number"
                  value={localSettings.socksPort || 4447}
                  onChange={(e) => handleSettingChange('socksPort', parseInt(e.target.value))}
                  min="1024"
                  max="65535"
                />
                <Description>
                  {t('Port for SOCKS proxy (default: 4447)')}
                </Description>
              </FormGroup>

              <FormGroup>
                <Label>{t('Bandwidth')}</Label>
                <Select
                  value={localSettings.bandwidth || 'L'}
                  onChange={(e) => handleSettingChange('bandwidth', e.target.value)}
                >
                  {translatedConstants.bandwidthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Description>
                  {t('Node bandwidth limit')}
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.enableIPv6 || false}
                    onChange={(e) => handleSettingChange('enableIPv6', e.target.checked)}
                  />
                  {t('Enable IPv6')}
                </CheckboxLabel>
                <Description>
                  {t('Allow connections via IPv6')}
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.enableUPnP || false}
                    onChange={(e) => handleSettingChange('enableUPnP', e.target.checked)}
                  />
                  {t('Enable UPnP')}
                </CheckboxLabel>
                <Description>
                  {t('Automatically configure router port forwarding')}
                </Description>
              </FormGroup>
            </>
          )}

          {activeTab === SETTINGS_CATEGORIES.ADVANCED && (
            <>
              <FormGroup>
                <Label>{t('Log Level')}</Label>
                <Select
                  value={localSettings.logLevel || 'info'}
                  onChange={(e) => handleSettingChange('logLevel', e.target.value)}
                >
                  {translatedConstants.logLevelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Description>
                  {t('Minimum log level to display')}
                </Description>
              </FormGroup>

              <FormGroup>
                <Label>{t('Update Interval')}</Label>
                <Input
                  type="number"
                  value={localSettings.updateInterval || 5}
                  onChange={(e) => handleSettingChange('updateInterval', parseInt(e.target.value))}
                  min="1"
                  max="60"
                />
                <Description>
                  {t('Network statistics update interval (seconds)')}
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.autoClearLogs || false}
                    onChange={(e) => handleSettingChange('autoClearLogs', e.target.checked)}
                  />
                  {t('Auto-clear logs')}
                </CheckboxLabel>
                <Description>
                  {t('Automatically clear old log entries')}
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.enableFloodfill || false}
                    onChange={(e) => handleSettingChange('enableFloodfill', e.target.checked)}
                  />
                  {t('Enable Floodfill')}
                </CheckboxLabel>
                <Description>
                  {t('Participate in network floodfill')}
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.enableTransit || false}
                    onChange={(e) => handleSettingChange('enableTransit', e.target.checked)}
                  />
                  {t('Enable Transit')}
                </CheckboxLabel>
                <Description>
                  {t('Allow transit traffic through this router')}
                </Description>
              </FormGroup>

              <FormGroup>
                <Label>{t('Max Transit Tunnels')}</Label>
                <Input
                  type="number"
                  value={localSettings.maxTransitTunnels || 5}
                  onChange={(e) => handleSettingChange('maxTransitTunnels', parseInt(e.target.value))}
                  min="0"
                  max="50"
                />
                <Description>
                  {t('Maximum number of transit tunnels')}
                </Description>
              </FormGroup>
            </>
          )}

          {activeTab === SETTINGS_CATEGORIES.APPEARANCE && (
            <>
              <FormGroup>
                <Label>{t('Theme')}</Label>
                <Select
                  value={localSettings.theme || 'system'}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  {translatedConstants.themeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Description>
                  {t('Application color scheme')}
                </Description>
              </FormGroup>

              <FormGroup>
                <Label>{t('Language')}</Label>
                <Select
                  value={localSettings.language || 'en'}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  {translatedConstants.languageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Description>
                  {t('Application interface language')}
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.showNotifications !== false}
                    onChange={(e) => handleSettingChange('showNotifications', e.target.checked)}
                  />
                  {t('Show Notifications')}
                </CheckboxLabel>
                <Description>
                  {t('Display system notifications')}
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    checked={localSettings.enableAnimations !== false}
                    onChange={(e) => handleSettingChange('enableAnimations', e.target.checked)}
                  />
                  {t('Enable Animations')}
                </CheckboxLabel>
                <Description>
                  {t('Smooth transitions and animations in interface')}
                </Description>
              </FormGroup>
            </>
          )}

          {activeTab === SETTINGS_CATEGORIES.CONFIG && (
            <ConfigManagement electronAPI={electronAPI} />
          )}
        </TabContent>

        <ModalFooter>
          <ResetButton onClick={handleReset}>
            {t('Reset')}
          </ResetButton>
          <CancelButton onClick={onClose}>
            {t('Cancel')}
          </CancelButton>
          <SaveButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('Saving...') : t('Save')}
          </SaveButton>
        </ModalFooter>
      </Modal>
    </ModalOverlay>
  );
};

export default SettingsModal;