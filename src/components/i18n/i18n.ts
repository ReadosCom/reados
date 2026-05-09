import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  lng: 'tr',
  parseMissingKeyHandler: (key) => key,
  react: {
    useSuspense: false,
  },
  returnEmptyString: false,
});

export default i18n;
