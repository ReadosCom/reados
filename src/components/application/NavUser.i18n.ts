import type { Translations } from "@components/i18n/i18n.types.ts";
export const translations = {
  "Signing out...": {
    "tr": { translation: `Çıkış yapılıyor...`, translatedBy: `AI` },
    "de": { translation: `Abmeldung...`, translatedBy: `AI` },
    "es": { translation: `Cerrando sesión...`, translatedBy: `AI` },
    "fr": { translation: `Déconnexion...`, translatedBy: `AI` },
    "it": { translation: `Disconnessione in corso...`, translatedBy: `AI` },
    "pt": { translation: `Saindo...`, translatedBy: `AI` },
    "nl": { translation: `Afmelden...`, translatedBy: `AI` },
    "pl": { translation: `Wylogowywanie...`, translatedBy: `AI` },
  },
  "Sign out": {
    "tr": { translation: `Çıkış yap`, translatedBy: `AI` },
    "de": { translation: `Abmelden`, translatedBy: `AI` },
    "es": { translation: `Cerrar sesión`, translatedBy: `AI` },
    "fr": { translation: `Se déconnecter`, translatedBy: `AI` },
    "it": { translation: `Esci`, translatedBy: `AI` },
    "pt": { translation: `Sair`, translatedBy: `AI` },
    "nl": { translation: `Afmelden`, translatedBy: `AI` },
    "pl": { translation: `Wyloguj się`, translatedBy: `AI` },
  },
  "Go to home": {
    "tr": { translation: `Ana sayfaya git`, translatedBy: `AI` },
    "de": { translation: `Zur Startseite`, translatedBy: `AI` },
    "es": { translation: `Ir al inicio`, translatedBy: `AI` },
    "fr": { translation: `Aller à l'accueil`, translatedBy: `AI` },
    "it": { translation: `Vai alla home`, translatedBy: `AI` },
    "pt": { translation: `Ir para a página inicial`, translatedBy: `AI` },
    "nl": { translation: `Ga naar home`, translatedBy: `AI` },
    "pl": { translation: `Przejdź do strony głównej`, translatedBy: `AI` },
  },
} as const satisfies Translations;
