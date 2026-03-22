import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Language bundles
import en from './locales/en.ts';
import vi from './locales/vi.ts';

const resources = {
  en: {
    translation: en
  },
  vi: {
    translation: vi
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'navigator', 'path', 'subdomain'],
      caches: ['localStorage']
    }
  });

export default i18n;
