import { useTranslation } from 'react-i18next';

// Функция для получения переведенных опций темы
export const getTranslatedThemeOptions = (t) => [
  { value: 'dark', label: t('Dark') },
  { value: 'light', label: t('Light') }
];

// Функция для получения переведенных опций языка
export const getTranslatedLanguageOptions = (t) => [
  { value: 'ru', label: t('Russian') },
  { value: 'en', label: 'English' }
];

// Функция для получения переведенных опций пропускной способности
export const getTranslatedBandwidthOptions = (t) => [
  { value: 'L', label: 'L (32 KB/s)', description: t('Normal node') },
  { value: 'M', label: 'M (128 KB/s)', description: t('Medium bandwidth') },
  { value: 'H', label: 'H (512 KB/s)', description: t('High bandwidth') },
  { value: 'P', label: 'P (2 MB/s) - ' + t('Recommended'), description: t('Maximum bandwidth') },
  { value: 'X', label: 'X (Unlimited)', description: t('Unlimited bandwidth') }
];

// Функция для получения переведенных опций уровня логов
export const getTranslatedLogLevelOptions = (t) => [
  { value: 'debug', label: 'Debug', description: t('All messages') },
  { value: 'info', label: 'Info', description: t('Informational messages') },
  { value: 'warn', label: 'Warning', description: t('Warnings') },
  { value: 'error', label: 'Error', description: t('Errors only') },
  { value: 'critical', label: 'Critical', description: t('Critical errors') },
  { value: 'none', label: 'None', description: t('Disable logging') }
];

// Функция для получения переведенных опций интервала обновления
export const getTranslatedUpdateIntervalOptions = (t) => [
  { value: 1, label: t('1 second') },
  { value: 3, label: t('3 seconds') },
  { value: 5, label: t('5 seconds') },
  { value: 10, label: t('10 seconds') },
  { value: 15, label: t('15 seconds') },
  { value: 30, label: t('30 seconds') }
];

// Хук для получения всех переведенных констант
export const useTranslatedConstants = () => {
  const { t } = useTranslation();
  
  return {
    themeOptions: getTranslatedThemeOptions(t),
    languageOptions: getTranslatedLanguageOptions(t),
    bandwidthOptions: getTranslatedBandwidthOptions(t),
    logLevelOptions: getTranslatedLogLevelOptions(t),
    updateIntervalOptions: getTranslatedUpdateIntervalOptions(t)
  };
};
