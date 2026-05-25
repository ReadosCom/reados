import type { Translations } from "@components/i18n/i18n.types.ts";

export const translations = {
  "Actions": {
    "tr": { translation: `İşlemler`, translatedBy: `AI` },
  },
  "Could not load segment list right now.": {
    "tr": { translation: `Segment listesi şu anda yüklenemedi.`, translatedBy: `AI` },
  },
  "Could not delete segment right now.": {
    "tr": { translation: `Segment şu anda silinemedi.`, translatedBy: `AI` },
  },
  "Could not reorder segments right now.": {
    "tr": { translation: `Segment sırası şu anda değiştirilemedi.`, translatedBy: `AI` },
  },
  "Label": {
    "tr": { translation: `Etiket`, translatedBy: `AI` },
  },
  "Delete segment": {
    "tr": { translation: `Segmenti sil`, translatedBy: `AI` },
  },
  "Loading segment list...": {
    "tr": { translation: `Segment listesi yükleniyor...`, translatedBy: `AI` },
  },
  "No segments yet.": {
    "tr": { translation: `Henüz segment yok.`, translatedBy: `AI` },
  },
  "Required": {
    "tr": { translation: `Zorunlu`, translatedBy: `AI` },
  },
  "Segment List": {
    "tr": { translation: `Segment Listesi`, translatedBy: `AI` },
  },
  "Move segment down": {
    "tr": { translation: `Segmenti aşağı taşı`, translatedBy: `AI` },
  },
  "Move segment up": {
    "tr": { translation: `Segmenti yukarı taşı`, translatedBy: `AI` },
  },
  "New Segment": {
    "tr": { translation: `Yeni Segment`, translatedBy: `AI` },
  },
  "Yes": {
    "tr": { translation: `Evet`, translatedBy: `AI` },
  },
  "No": {
    "tr": { translation: `Hayır`, translatedBy: `AI` },
  },
} as const satisfies Translations;
