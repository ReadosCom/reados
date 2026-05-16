import type { Translations } from "@components/i18n/i18n.types.ts";

export const translations = {
  "Account": {
    "tr": { translation: `Hesap`, translatedBy: `AI` },
  },
  "Active": {
    "tr": { translation: `Aktif`, translatedBy: `AI` },
  },
  "Add segment": {
    "tr": { translation: `Segment ekle`, translatedBy: `AI` },
  },
  "Accounting configuration": {
    "tr": { translation: `Muhasebe yapılandırması`, translatedBy: `AI` },
  },
  "Allow users to continue from configuration to accounting workflows.": {
    "tr": { translation: `Kullanıcıların yapılandırmadan muhasebe iş akışlarına devam etmesine izin verin.`, translatedBy: `AI` },
  },
  "Could not load accounting configuration right now.": {
    "tr": { translation: `Muhasebe yapılandırması şu anda yüklenemedi.`, translatedBy: `AI` },
  },
  "Could not save configuration right now.": {
    "tr": { translation: `Yapılandırma şu anda kaydedilemedi.`, translatedBy: `AI` },
  },
  "Entity": {
    "tr": { translation: `Varlık`, translatedBy: `AI` },
  },
  "Finalized": {
    "tr": { translation: `Tamamlandı`, translatedBy: `AI` },
  },
  "Label": {
    "tr": { translation: `Etiket`, translatedBy: `AI` },
  },
  "Loading accounting configuration...": {
    "tr": { translation: `Muhasebe yapılandırması yükleniyor...`, translatedBy: `AI` },
  },
  "Optional segments": {
    "tr": { translation: `İsteğe bağlı segmentler`, translatedBy: `AI` },
  },
  "Required segments": {
    "tr": { translation: `Zorunlu segmentler`, translatedBy: `AI` },
  },
  "Remove": {
    "tr": { translation: `Kaldır`, translatedBy: `AI` },
  },
  "Save configuration": {
    "tr": { translation: `Yapılandırmayı kaydet`, translatedBy: `AI` },
  },
  "Configuration saved.": {
    "tr": { translation: `Yapılandırma kaydedildi.`, translatedBy: `AI` },
  },
  "System required segment": {
    "tr": { translation: `Sistem tarafından zorunlu segment`, translatedBy: `AI` },
  },
} as const satisfies Translations;
