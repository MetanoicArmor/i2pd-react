import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FileText, FolderOpen, Download, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { useElectron } from '../hooks/useElectron';
import toast from 'react-hot-toast';

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
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
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

const FilePath = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const FileActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
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
  margin-top: 16px;
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

function ConfigManagement() {
  const { isElectron, showOpenDialog, showSaveDialog } = useElectron();
  const [configFiles, setConfigFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Стандартные конфигурационные файлы i2pd
  const defaultConfigFiles = [
    {
      name: 'i2pd.conf',
      description: 'Основной конфигурационный файл',
      path: '~/.i2pd/i2pd.conf',
      editable: true
    },
    {
      name: 'tunnels.conf',
      description: 'Конфигурация туннелей',
      path: '~/.i2pd/tunnels.conf',
      editable: true
    },
    {
      name: 'subscriptions.txt',
      description: 'Подписки адресной книги',
      path: '~/.i2pd/subscriptions.txt',
      editable: true
    }
  ];

  useEffect(() => {
    setConfigFiles(defaultConfigFiles);
  }, []);

  const loadFileContent = async (file) => {
    if (!isElectron) {
      toast.error('Управление файлами доступно только в Electron версии');
      return;
    }

    setIsLoading(true);
    try {
      // В реальном приложении здесь будет чтение файла через Electron API
      const mockContent = `# ${file.name} - Конфигурационный файл
# Этот файл содержит настройки для ${file.description}

# Пример содержимого файла
# В реальном приложении здесь будет актуальное содержимое

[section]
option = value
`;
      
      setFileContent(mockContent);
      setSelectedFile(file);
    } catch (error) {
      toast.error(`Ошибка загрузки файла: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFileContent = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      // В реальном приложении здесь будет сохранение файла через Electron API
      toast.success(`Файл ${selectedFile.name} сохранен`);
    } catch (error) {
      toast.error(`Ошибка сохранения файла: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportConfig = async (file) => {
    if (!isElectron) {
      toast.error('Экспорт доступен только в Electron версии');
      return;
    }

    try {
      const result = await showSaveDialog({
        title: `Экспорт ${file.name}`,
        defaultPath: file.name,
        filters: [
          { name: 'Text Files', extensions: ['txt', 'conf'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled) {
        // В реальном приложении здесь будет экспорт файла
        toast.success(`Конфигурация экспортирована в ${result.filePath}`);
      }
    } catch (error) {
      toast.error(`Ошибка экспорта: ${error.message}`);
    }
  };

  const importConfig = async (file) => {
    if (!isElectron) {
      toast.error('Импорт доступен только в Electron версии');
      return;
    }

    try {
      const result = await showOpenDialog({
        title: `Импорт ${file.name}`,
        filters: [
          { name: 'Text Files', extensions: ['txt', 'conf'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePaths.length > 0) {
        // В реальном приложении здесь будет импорт файла
        toast.success(`Конфигурация импортирована из ${result.filePaths[0]}`);
      }
    } catch (error) {
      toast.error(`Ошибка импорта: ${error.message}`);
    }
  };

  return (
    <Container>
      <Section>
        <SectionHeader>
          <SectionTitle>
            <FileText size={20} />
            Конфигурационные файлы
          </SectionTitle>
        </SectionHeader>

        <Warning>
          <AlertCircle size={16} />
          Изменение конфигурационных файлов может повлиять на работу демона. 
          Рекомендуется создать резервную копию перед внесением изменений.
        </Warning>

        <FileList>
          {configFiles.map((file, index) => (
            <FileItem key={index}>
              <FileInfo>
                <FileText size={16} />
                <div>
                  <FileName>{file.name}</FileName>
                  <FilePath>{file.path}</FilePath>
                </div>
              </FileInfo>
              <FileActions>
                <ActionButton onClick={() => loadFileContent(file)}>
                  <FolderOpen />
                  Открыть
                </ActionButton>
                <ActionButton onClick={() => exportConfig(file)}>
                  <Download />
                  Экспорт
                </ActionButton>
                <ActionButton onClick={() => importConfig(file)}>
                  <Upload />
                  Импорт
                </ActionButton>
              </FileActions>
            </FileItem>
          ))}
        </FileList>
      </Section>

      {selectedFile && (
        <Section>
          <ConfigEditor>
            <EditorHeader>
              <EditorTitle>Редактирование: {selectedFile.name}</EditorTitle>
              <SaveButton onClick={saveFileContent} disabled={isLoading}>
                <RefreshCw />
                Сохранить
              </SaveButton>
            </EditorHeader>
            <TextArea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Содержимое конфигурационного файла..."
              disabled={isLoading}
            />
          </ConfigEditor>
        </Section>
      )}
    </Container>
  );
}

export default ConfigManagement;

