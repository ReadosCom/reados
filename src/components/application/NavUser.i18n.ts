import type { Translations } from '@components/i18n/i18n.types.ts';
export const translations = {
  'Signing out...': {
    tr: { translation: `Çıkış yapılıyor...`, translatedBy: `AI` },
    de: { translation: `Abmeldung...`, translatedBy: `AI` },
    es: { translation: `Cerrando sesión...`, translatedBy: `AI` },
    fr: { translation: `Déconnexion...`, translatedBy: `AI` },
    it: { translation: `Disconnessione in corso...`, translatedBy: `AI` },
    pt: { translation: `Saindo...`, translatedBy: `AI` },
    nl: { translation: `Afmelden...`, translatedBy: `AI` },
    pl: { translation: `Wylogowywanie...`, translatedBy: `AI` },
  },
  'Sign out': {
    tr: { translation: `Çıkış yap`, translatedBy: `AI` },
    de: { translation: `Abmelden`, translatedBy: `AI` },
    es: { translation: `Cerrar sesión`, translatedBy: `AI` },
    fr: { translation: `Se déconnecter`, translatedBy: `AI` },
    it: { translation: `Esci`, translatedBy: `AI` },
    pt: { translation: `Sair`, translatedBy: `AI` },
    nl: { translation: `Afmelden`, translatedBy: `AI` },
    pl: { translation: `Wyloguj się`, translatedBy: `AI` },
  },
  Profile: {
    tr: { translation: `Profil`, translatedBy: `AI` },
    de: { translation: `Profil`, translatedBy: `AI` },
    es: { translation: `Perfil`, translatedBy: `AI` },
    fr: { translation: `Profil`, translatedBy: `AI` },
    it: { translation: `Profilo`, translatedBy: `AI` },
    pt: { translation: `Perfil`, translatedBy: `AI` },
    nl: { translation: `Profiel`, translatedBy: `AI` },
    pl: { translation: `Profil`, translatedBy: `AI` },
  },
} as const satisfies Translations;
