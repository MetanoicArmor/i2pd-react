import React, { createContext, useContext, useReducer } from 'react';
import { themes } from '../theme';
import { APP_CONFIG } from '../constants';

// Начальное состояние приложения
const initialState = {
  theme: 'dark',
  language: 'ru',
  isElectron: false,
  electronAPI: null,
  appVersion: APP_CONFIG.version,
  isLoading: false,
  error: null,
  modals: {
    settings: false,
    about: false
  }
};

// Типы действий
const ACTION_TYPES = {
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_ELECTRON: 'SET_ELECTRON',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  SET_APP_VERSION: 'SET_APP_VERSION'
};

// Редьюсер
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_THEME:
      return { ...state, theme: action.payload };
    
    case ACTION_TYPES.SET_LANGUAGE:
      return { ...state, language: action.payload };
    
    case ACTION_TYPES.SET_ELECTRON:
      return { 
        ...state, 
        isElectron: action.payload.isElectron,
        electronAPI: action.payload.electronAPI 
      };
    
    case ACTION_TYPES.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ACTION_TYPES.TOGGLE_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload]: !state.modals[action.payload]
        }
      };
    
    case ACTION_TYPES.SET_APP_VERSION:
      return { ...state, appVersion: action.payload };
    
    default:
      return state;
  }
};

// Создаем контекст
const AppContext = createContext();

// Провайдер контекста
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Действия
  const actions = {
    setTheme: (theme) => dispatch({ type: ACTION_TYPES.SET_THEME, payload: theme }),
    setLanguage: (language) => dispatch({ type: ACTION_TYPES.SET_LANGUAGE, payload: language }),
    setElectron: (isElectron, electronAPI) => dispatch({ 
      type: ACTION_TYPES.SET_ELECTRON, 
      payload: { isElectron, electronAPI } 
    }),
    setLoading: (isLoading) => dispatch({ type: ACTION_TYPES.SET_LOADING, payload: isLoading }),
    setError: (error) => dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ACTION_TYPES.CLEAR_ERROR }),
    toggleModal: (modalName) => dispatch({ type: ACTION_TYPES.TOGGLE_MODAL, payload: modalName }),
    setAppVersion: (version) => dispatch({ type: ACTION_TYPES.SET_APP_VERSION, payload: version })
  };

  // Вычисляемые значения
  const currentTheme = themes[state.theme];
  const isModalOpen = (modalName) => state.modals[modalName];

  const value = {
    ...state,
    currentTheme,
    isModalOpen,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Хук для использования контекста
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

