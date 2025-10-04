import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSettings } from '../hooks/useSettings';
import { 
  SETTINGS_CATEGORIES, 
  BANDWIDTH_OPTIONS, 
  LOG_LEVEL_OPTIONS, 
  LANGUAGE_OPTIONS, 
  THEME_OPTIONS, 
  UPDATE_INTERVAL_OPTIONS 
} from '../constants/settings';

// Стилизованные компоненты
const ModalOverlay = styled.div`
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
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 0;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  border: 1px solid ${props => props.theme.colors.border};
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
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
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Tab = styled.button`
  flex: 1;
  padding: 16px 24px;
  border: none;
  background: ${props => props.$active ? props.theme.colors.surface : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};

  &:hover {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
  }
`;

const TabContent = styled.div`
  padding: 24px;
  max-height: 400px;
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
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:invalid {
    border-color: ${props => props.theme.colors.error};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: 8px 0;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  accent-color: ${props => props.theme.colors.primary};
`;

const Description = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 4px;
`;

const ErrorText = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.error};
  margin-top: 4px;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  border: 1px solid ${props => props.theme.colors.border};
  background-color: transparent;
  color: ${props => props.theme.colors.text};

  &:hover {
    background-color: ${props => props.theme.colors.surface};
    border-color: ${props => props.theme.colors.textSecondary};
  }
`;

const SaveButton = styled(Button)`
  background: ${props => props.theme.colors.primary};
  color: white;

  &:hover {
    opacity: 0.8;
  }
`;

const ResetButton = styled(Button)`
  background: ${props => props.theme.colors.warning};
  color: white;

  &:hover {
    opacity: 0.8;
  }
`;

// Компонент настроек
// Можно пробросить наружные настройки/сохранение, чтобы использовать один и тот же хук из App
const SettingsModal = ({ isOpen, onClose, electronAPI, onSaved, settings: extSettings, saveSettings: extSaveSettings, validateSettings: extValidateSettings }) => {
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

  // Обработка изменений
  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    // Валидация
    const validationErrors = validateSettings(newSettings);
    setErrors(validationErrors);
  };

  // Сохранение настроек
  const handleSave = async () => {
    const validationErrors = validateSettings(localSettings);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const success = await saveSettings(localSettings);
    if (success) {
      try {
        if (typeof onSaved === 'function') {
          await onSaved(localSettings);
        }
      } catch (_) {}
      onClose();
    }
  };

  // Сброс настроек
  const handleReset = async () => {
    if (window.confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
      await resetSettings();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Настройки</ModalTitle>
          <ModalCloseButton onClick={onClose}>✕</ModalCloseButton>
        </ModalHeader>

        <TabContainer>
          <Tab 
            $active={activeTab === SETTINGS_CATEGORIES.GENERAL}
            onClick={() => setActiveTab(SETTINGS_CATEGORIES.GENERAL)}
          >
            Общие
          </Tab>
          <Tab 
            $active={activeTab === SETTINGS_CATEGORIES.NETWORK}
            onClick={() => setActiveTab(SETTINGS_CATEGORIES.NETWORK)}
          >
            Сеть
          </Tab>
          <Tab 
            $active={activeTab === SETTINGS_CATEGORIES.ADVANCED}
            onClick={() => setActiveTab(SETTINGS_CATEGORIES.ADVANCED)}
          >
            Продвинутые
          </Tab>
          <Tab 
            $active={activeTab === SETTINGS_CATEGORIES.APPEARANCE}
            onClick={() => setActiveTab(SETTINGS_CATEGORIES.APPEARANCE)}
          >
            Внешний вид
          </Tab>
        </TabContainer>

        <TabContent>
          {activeTab === SETTINGS_CATEGORIES.GENERAL && (
            <>
              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.autoStartDaemon || false}
                    onChange={(e) => handleSettingChange('autoStartDaemon', e.target.checked)}
                  />
                  Автозапуск демона при старте приложения
                </CheckboxLabel>
                <Description>
                  Демон будет автоматически запускаться при открытии приложения
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.startMinimized || false}
                    onChange={(e) => handleSettingChange('startMinimized', e.target.checked)}
                  />
                  Запуск в свернутом виде
                </CheckboxLabel>
                <Description>
                  Приложение будет запускаться свернутым в трей
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.minimizeToTray || false}
                    onChange={(e) => handleSettingChange('minimizeToTray', e.target.checked)}
                  />
                  Сворачивать в трей
                </CheckboxLabel>
                <Description>
                  При сворачивании окно будет скрываться в системный трей
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.closeToTray || false}
                    onChange={(e) => handleSettingChange('closeToTray', e.target.checked)}
                  />
                  Закрывать в трей
                </CheckboxLabel>
                <Description>
                  При закрытии окна приложение будет скрываться в трей вместо завершения
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.hideFromDock || false}
                    onChange={(e) => handleSettingChange('hideFromDock', e.target.checked)}
                  />
                  Скрыть из Dock (macOS)
                </CheckboxLabel>
                <Description>
                  Приложение не будет отображаться в Dock на macOS
                </Description>
              </FormGroup>
            </>
          )}

          {activeTab === SETTINGS_CATEGORIES.NETWORK && (
            <>
              <FormGroup>
                <Label>HTTP прокси порт</Label>
                <Input
                  type="number"
                  min="1024"
                  max="65535"
                  value={localSettings.httpPort || 4444}
                  onChange={(e) => handleSettingChange('httpPort', parseInt(e.target.value))}
                />
                {errors.httpPort && <ErrorText>{errors.httpPort}</ErrorText>}
                <Description>
                  Порт для HTTP прокси (по умолчанию: 4444)
                </Description>
              </FormGroup>

              <FormGroup>
                <Label>SOCKS прокси порт</Label>
                <Input
                  type="number"
                  min="1024"
                  max="65535"
                  value={localSettings.socksPort || 4447}
                  onChange={(e) => handleSettingChange('socksPort', parseInt(e.target.value))}
                />
                {errors.socksPort && <ErrorText>{errors.socksPort}</ErrorText>}
                <Description>
                  Порт для SOCKS прокси (по умолчанию: 4447)
                </Description>
              </FormGroup>

              <FormGroup>
                <Label>Пропускная способность</Label>
                <Select
                  value={localSettings.bandwidth || 'L'}
                  onChange={(e) => handleSettingChange('bandwidth', e.target.value)}
                >
                  {BANDWIDTH_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </Select>
                <Description>
                  Ограничение пропускной способности узла
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.enableIPv6 || false}
                    onChange={(e) => handleSettingChange('enableIPv6', e.target.checked)}
                  />
                  Включить IPv6
                </CheckboxLabel>
                <Description>
                  Разрешить подключения через IPv6
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.enableUPnP || false}
                    onChange={(e) => handleSettingChange('enableUPnP', e.target.checked)}
                  />
                  Включить UPnP
                </CheckboxLabel>
                <Description>
                  Автоматическое проброс портов через UPnP
                </Description>
              </FormGroup>
            </>
          )}

          {activeTab === SETTINGS_CATEGORIES.ADVANCED && (
            <>
              <FormGroup>
                <Label>Уровень логирования</Label>
                <Select
                  value={localSettings.logLevel || 'info'}
                  onChange={(e) => handleSettingChange('logLevel', e.target.value)}
                >
                  {LOG_LEVEL_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </Select>
                <Description>
                  Детализация сообщений в логах
                </Description>
              </FormGroup>

              <FormGroup>
                <Label>Интервал обновления статистики (секунды)</Label>
                <Select
                  value={localSettings.updateInterval || 5}
                  onChange={(e) => handleSettingChange('updateInterval', parseInt(e.target.value))}
                >
                  {UPDATE_INTERVAL_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.updateInterval && <ErrorText>{errors.updateInterval}</ErrorText>}
                <Description>
                  Как часто обновлять статистику сети
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.autoClearLogs || false}
                    onChange={(e) => handleSettingChange('autoClearLogs', e.target.checked)}
                  />
                  Автоочистка логов
                </CheckboxLabel>
                <Description>
                  Автоматически очищать старые записи в логах
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.enableFloodfill || false}
                    onChange={(e) => handleSettingChange('enableFloodfill', e.target.checked)}
                  />
                  Режим Floodfill
                </CheckboxLabel>
                <Description>
                  Включить режим floodfill (требует больше ресурсов)
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.enableTransit !== false}
                    onChange={(e) => handleSettingChange('enableTransit', e.target.checked)}
                  />
                  Разрешить транзитный трафик
                </CheckboxLabel>
                <Description>
                  Узел будет передавать трафик других пользователей
                </Description>
              </FormGroup>

              <FormGroup>
                <Label>Максимальное количество транзитных туннелей</Label>
                <Input
                  type="number"
                  min="100"
                  max="50000"
                  value={localSettings.maxTransitTunnels || 10000}
                  onChange={(e) => handleSettingChange('maxTransitTunnels', parseInt(e.target.value))}
                />
                {errors.maxTransitTunnels && <ErrorText>{errors.maxTransitTunnels}</ErrorText>}
                <Description>
                  Максимальное количество одновременных транзитных туннелей
                </Description>
              </FormGroup>
            </>
          )}

          {activeTab === SETTINGS_CATEGORIES.APPEARANCE && (
            <>
              <FormGroup>
                <Label>Тема</Label>
                <Select
                  value={localSettings.theme || 'dark'}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  {THEME_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Description>
                  Цветовая схема интерфейса
                </Description>
              </FormGroup>

              <FormGroup>
                <Label>Язык</Label>
                <Select
                  value={localSettings.language || 'ru'}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  {LANGUAGE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Description>
                  Язык интерфейса приложения (применяется сразу)
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.showNotifications !== false}
                    onChange={(e) => handleSettingChange('showNotifications', e.target.checked)}
                  />
                  Показывать уведомления
                </CheckboxLabel>
                <Description>
                  Отображать системные уведомления о событиях
                </Description>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={localSettings.enableAnimations !== false}
                    onChange={(e) => handleSettingChange('enableAnimations', e.target.checked)}
                  />
                  Включить анимации
                </CheckboxLabel>
                <Description>
                  Плавные переходы и анимации в интерфейсе
                </Description>
              </FormGroup>
            </>
          )}
        </TabContent>

        <ModalFooter>
          <ResetButton onClick={handleReset}>
            Сбросить
          </ResetButton>
          <CancelButton onClick={onClose}>
            Отмена
          </CancelButton>
          <SaveButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </SaveButton>
        </ModalFooter>
      </Modal>
    </ModalOverlay>
  );
};

export default SettingsModal;