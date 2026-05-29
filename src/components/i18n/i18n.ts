import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const defaultLanguage = `en`;

const normalizeLanguage = (language: string) => language.trim().toLowerCase().split(`-`)[0] ?? defaultLanguage;

void i18n.use(initReactI18next).init({
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  lng: defaultLanguage,
  parseMissingKeyHandler: (key) => key,
  react: {
    useSuspense: false,
  },
  returnEmptyString: false,
});

export const languagePreference = {
  defaultLanguage,
};

export const applyPreferredLanguage = async (language: string) => {
  const normalized = normalizeLanguage(language);

  if (i18n.resolvedLanguage === normalized || i18n.language === normalized) {
    return;
  }

  await i18n.changeLanguage(normalized);
};

export default i18n;
