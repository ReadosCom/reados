import type { Translations } from '@components/i18n/i18n.types.ts';

export const translations = {
  Label: {
    tr: { translation: `Etiket`, translatedBy: `AI` },
  },
  Remove: {
    tr: { translation: `Kaldır`, translatedBy: `AI` },
  },
  'Removing...': {
    tr: { translation: `Kaldırılıyor...`, translatedBy: `AI` },
  },
  "Required segments can't be deleted": {
    tr: { translation: `Zorunlu segmentler silinemez`, translatedBy: `AI` },
  },
  'Save segment': {
    tr: { translation: `Segmenti kaydet`, translatedBy: `AI` },
  },
  'Saving...': {
    tr: { translation: `Kaydediliyor...`, translatedBy: `AI` },
  },
  'Segment saved.': {
    tr: { translation: `Segment kaydedildi.`, translatedBy: `AI` },
  },
  'Could not save segment right now.': {
    tr: { translation: `Segment şu anda kaydedilemedi.`, translatedBy: `AI` },
  },
} as const satisfies Translations;
