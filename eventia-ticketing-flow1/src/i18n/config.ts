import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      hi: {
        translation: hiTranslation
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'translation',
    ns: ['translation', 'common', 'payment', 'booking', 'event'],
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    keySeparator: '.',
    nsSeparator: ':',
    pluralSeparator: '_',
    contextSeparator: '_',
    fallbackNS: 'common',
    debug: process.env.NODE_ENV === 'development'
  });

export default i18n;
