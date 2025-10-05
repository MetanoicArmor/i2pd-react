import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FileText, FolderOpen, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Section = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FileItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  margin-bottom: 16px;
`;

const FileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const FileDescription = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const OpenButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background-color: transparent;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ConfigEditor = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const EditorTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.primary}dd;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Warning = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: ${props => props.theme.colors.warning}20;
  border: 1px solid ${props => props.theme.colors.warning};
  border-radius: 8px;
  color: ${props => props.theme.colors.warning};
  font-size: 12px;
`;

function ConfigManagement({ electronAPI }) {
  const { t } = useTranslation();
  const [configFiles, setConfigFiles] = useState([]);
  const [expandedFiles, setExpandedFiles] = useState({});
  const [fileContents, setFileContents] = useState({});
  const [isLoading, setIsLoading] = useState({});

  // Стандартные конфигурационные файлы i2pd
  const defaultConfigFiles = [
    {
      name: 'i2pd.conf',
      description: t('Main configuration file'),
      editable: true
    },
    {
      name: 'tunnels.conf',
      description: t('Tunnel configuration'),
      editable: true
    },
    {
      name: 'subscriptions.txt',
      description: t('Address book subscriptions'),
      editable: true
    }
  ];

  useEffect(() => {
    setConfigFiles(defaultConfigFiles);
  }, [t]);

  const loadFileContent = async (fileName) => {
    if (!electronAPI) {
      toast.error(t('File management is only available in Electron version'));
      return;
    }

    setIsLoading(prev => ({ ...prev, [fileName]: true }));
    try {
      const result = await electronAPI.invoke('read-config-file', fileName);
      if (result.success) {
        setFileContents(prev => ({ ...prev, [fileName]: result.content }));
        setExpandedFiles(prev => ({ ...prev, [fileName]: true }));
      } else {
        toast.error(`${t('File loading error')}: ${result.error}`);
      }
    } catch (error) {
      toast.error(`${t('File loading error')}: ${error.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [fileName]: false }));
    }
  };

  const saveFileContent = async (fileName) => {
    if (!electronAPI) return;

    setIsLoading(prev => ({ ...prev, [fileName]: true }));
    try {
      const content = fileContents[fileName] || '';
      const result = await electronAPI.invoke('write-config-file', fileName, content);
      if (result.success) {
        toast.success(t('File saved'));
        
        // Если сохранили i2pd.conf, перезапускаем демон
        if (fileName === 'i2pd.conf') {
          const statusResult = await electronAPI.invoke('check-daemon-status');
          if (statusResult.isRunning) {
            const restartResult = await electronAPI.invoke('restart-daemon');
            if (restartResult.success) {
              toast.success(t('Daemon restarted'));
            } else {
              toast.error(`${t('Daemon restart error')}: ${restartResult.error}`);
            }
          }
        }
      } else {
        toast.error(`${t('File saving error')}: ${result.error}`);
      }
    } catch (error) {
      toast.error(`${t('File saving error')}: ${error.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [fileName]: false }));
    }
  };

  const toggleFileExpansion = (fileName) => {
    if (expandedFiles[fileName]) {
      setExpandedFiles(prev => ({ ...prev, [fileName]: false }));
    } else {
      loadFileContent(fileName);
    }
  };

  return (
    <Container>
      <Section>
        <SectionHeader>
          <SectionTitle>
            <FileText size={20} />
            {t('Configuration Files')}
          </SectionTitle>
        </SectionHeader>

        <Warning>
          <AlertCircle size={16} />
          {t('Changing configuration files may affect daemon operation. It is recommended to create a backup before making changes.')}
        </Warning>

        <FileList>
          {configFiles.map((file, index) => (
            <FileItem key={index}>
              <FileHeader>
                <FileInfo>
                  <FileText size={16} />
                  <div>
                    <FileName>{file.name}</FileName>
                    <FileDescription>{file.description}</FileDescription>
                  </div>
                </FileInfo>
                <OpenButton onClick={() => toggleFileExpansion(file.name)}>
                  <FolderOpen />
                  {expandedFiles[file.name] ? t('Hide') : t('Open')}
                </OpenButton>
              </FileHeader>

              {expandedFiles[file.name] && (
                <ConfigEditor>
                  <EditorHeader>
                    <EditorTitle>{t('Editing')}: {file.name}</EditorTitle>
                    <SaveButton 
                      onClick={() => saveFileContent(file.name)} 
                      disabled={isLoading[file.name]}
                    >
                      <RefreshCw />
                      {isLoading[file.name] ? t('Saving...') : t('Save')}
                    </SaveButton>
                  </EditorHeader>
                  <TextArea
                    value={fileContents[file.name] || ''}
                    onChange={(e) => setFileContents(prev => ({ 
                      ...prev, 
                      [file.name]: e.target.value 
                    }))}
                    placeholder={t('Configuration file content')}
                    disabled={isLoading[file.name]}
                  />
                </ConfigEditor>
              )}
            </FileItem>
          ))}
        </FileList>
      </Section>
    </Container>
  );
}

export default ConfigManagement;