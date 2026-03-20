import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './en';
import es from './es';
import fr from './fr';
import de from './de';

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
};

let isInitialized = false;

export const initI18n = async (language?: string): Promise<typeof i18n> => {
  if (isInitialized) {
    return i18n;
  }

  let defaultLanguage = 'en';
  
  try {
    const locales = getLocales();
    const deviceLanguage = locales[0]?.languageCode ?? 'en';
    defaultLanguage = SUPPORTED_LANGUAGES.includes(deviceLanguage as SupportedLanguage) 
      ? deviceLanguage 
      : 'en';
  } catch (e) {
    console.warn('expo-localization not available, using default language');
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language || defaultLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v4',
    });

  isInitialized = true;
  return i18n;
};

export const changeLanguage = (language: SupportedLanguage) => {
  return i18n.changeLanguage(language);
};

export default i18n;