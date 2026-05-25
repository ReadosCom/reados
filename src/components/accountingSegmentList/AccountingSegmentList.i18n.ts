import type { Translations } from "@components/i18n/i18n.types.ts";

export const translations = {
  "Actions": {
    "tr": { translation: `İşlemler`, translatedBy: `AI` },
  },
  "Could not load segment list right now.": {
    "tr": { translation: `Kırılım listesi şu anda yüklenemedi.`, translatedBy: `AI` },
  },
  "Could not delete segment right now.": {
    "tr": { translation: `Kırılım şu anda silinemedi.`, translatedBy: `AI` },
  },
  "Could not reorder segments right now.": {
    "tr": { translation: `Kırılım sırası şu anda değiştirilemedi.`, translatedBy: `AI` },
  },
  "Are you sure, segment deletion will re-shape whole General Ledger?": {
    "tr": { translation: `Emin misiniz, kırılım silme işlemi tüm Genel Muhasebe Defteri yapısını yeniden şekillendirecek?`, translatedBy: `AI` },
  },
  "Label": {
    "tr": { translation: `Etiket`, translatedBy: `AI` },
  },
  "Delete segment": {
    "tr": { translation: `Kırılımı sil`, translatedBy: `AI` },
  },
  "Delete": {
    "tr": { translation: `Sil`, translatedBy: `AI` },
  },
  "Loading segment list...": {
    "tr": { translation: `Kırılım listesi yükleniyor...`, translatedBy: `AI` },
  },
  "No segments yet.": {
    "tr": { translation: `Henüz kırılım yok.`, translatedBy: `AI` },
  },
  "Required": {
    "tr": { translation: `Zorunlu`, translatedBy: `AI` },
  },
  "Segment List": {
    "tr": { translation: `Kırılım Listesi`, translatedBy: `AI` },
  },
  "Move segment down": {
    "tr": { translation: `Kırılımı aşağı taşı`, translatedBy: `AI` },
  },
  "Move segment up": {
    "tr": { translation: `Kırılımı yukarı taşı`, translatedBy: `AI` },
  },
  "New Segment": {
    "tr": { translation: `Yeni Kırılım`, translatedBy: `AI` },
  },
  "Yes": {
    "tr": { translation: `Evet`, translatedBy: `AI` },
  },
  "No": {
    "tr": { translation: `Hayır`, translatedBy: `AI` },
  },
} as const satisfies Translations;
