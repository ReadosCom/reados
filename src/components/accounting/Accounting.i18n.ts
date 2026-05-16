import type { Translations } from "@components/i18n/i18n.types.ts";

export const translations = {
  "Accounting summary": {
    "tr": { translation: `Muhasebe özeti`, translatedBy: `AI` },
  },
  "Could not load accounting summary right now.": {
    "tr": { translation: `Muhasebe özeti şu anda yüklenemedi.`, translatedBy: `AI` },
  },
  "Loading accounting configuration...": {
    "tr": { translation: `Muhasebe yapılandırması yükleniyor...`, translatedBy: `AI` },
  },
  "Loading accounting summary...": {
    "tr": { translation: `Muhasebe özeti yükleniyor...`, translatedBy: `AI` },
  },
  "Open invoices": {
    "tr": { translation: `Açık faturalar`, translatedBy: `AI` },
  },
  "Overdue invoices": {
    "tr": { translation: `Gecikmiş faturalar`, translatedBy: `AI` },
  },
  "Unpaid balance": {
    "tr": { translation: `Ödenmemiş bakiye`, translatedBy: `AI` },
  },
} as const satisfies Translations;
