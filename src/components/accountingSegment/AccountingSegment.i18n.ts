import type { Translations } from "@components/i18n/i18n.types.ts";

export const translations = {
  "Label": {
    "tr": { translation: `Etiket`, translatedBy: `AI` },
  },
  "Remove": {
    "tr": { translation: `Kaldır`, translatedBy: `AI` },
  },
  "Required segments can't be deleted": {
    "tr": { translation: `Zorunlu segmentler silinemez`, translatedBy: `AI` },
  },
} as const satisfies Translations;
