import styled from 'styled-components';

// Основной контейнер приложения
export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-app-region: no-drag;
`;

// Макет с сеткой
export const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  padding: 20px;
  height: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 15px;
  }
`;

// Область контента
export const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
`;

// Карточка
export const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 12px ${props => props.theme.colors.shadow};
  backdrop-filter: blur(20px);
  background-color: ${props => props.theme.colors.surface}E6;
`;

// Заголовок карточки
export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

// Кнопка
export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.primary};
  color: white;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 123, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Иконка
export const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${props => props.theme.colors.textSecondary};
`;

// Разделитель
export const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border};
  margin: 16px 0;
`;

// Группа элементов формы
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

// Метка
export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

// Поле ввода
export const Input = styled.input`
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

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

// Селект
export const Select = styled.select`
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

// Чекбокс
export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  accent-color: ${props => props.theme.colors.primary};
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
`;

