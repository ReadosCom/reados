import type { Translations } from "@components/i18n/i18n.types.ts";

export const translations = {
  "Add segment": {
    "tr": { translation: `Kırılım ekle`, translatedBy: `AI` },
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
  "Finalized": {
    "tr": { translation: `Tamamlandı`, translatedBy: `AI` },
  },
  "Label": {
    "tr": { translation: `Etiket`, translatedBy: `AI` },
  },
  "Loading accounting configuration...": {
    "tr": { translation: `Muhasebe yapılandırması yükleniyor...`, translatedBy: `AI` },
  },
  "Segments": {
    "tr": { translation: `Kırılımlar`, translatedBy: `AI` },
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
  "Segment": {
    "tr": { translation: `Kırılım`, translatedBy: `AI` },
  },
  "New Segment": {
    "tr": { translation: `Yeni Kırılım`, translatedBy: `AI` },
  },
  "Select this tab to create and open a new segment.": {
    "tr": { translation: `Yeni bir kırılım oluşturup açmak için bu sekmeyi seçin.`, translatedBy: `AI` },
  },
  "Select New Segment to create your first segment.": {
    "tr": { translation: `İlk kırılımınızı oluşturmak için Yeni Kırılım'ı seçin.`, translatedBy: `AI` },
  },
  "Configuration is finalized. Segment deletion is disabled.": {
    "tr": { translation: `Yapılandırma tamamlandı. Kırılım silme devre dışı bırakıldı.`, translatedBy: `AI` },
  },
  "Configuration finalized.": {
    "tr": { translation: `Yapılandırma tamamlandı.`, translatedBy: `AI` },
  },
  "Could not finalize accounting configuration right now.": {
    "tr": { translation: `Muhasebe yapılandırması şu anda tamamlanamadı.`, translatedBy: `AI` },
  },
  "Finalizing...": {
    "tr": { translation: `Tamamlanıyor...`, translatedBy: `AI` },
  },
  "Finalize Configuration": {
    "tr": { translation: `Yapılandırmayı Tamamla`, translatedBy: `AI` },
  },
  "Saving...": {
    "tr": { translation: `Kaydediliyor...`, translatedBy: `AI` },
  },
  "This is a critical operation. After finalization, future changes may require downtime due to database operations. Do you want to continue?": {
    "tr": { translation: `Bu kritik bir işlemdir. Tamamlandıktan sonra, gelecekteki değişiklikler veritabanı işlemleri nedeniyle kesinti gerektirebilir. Devam etmek istiyor musunuz?`, translatedBy: `AI` },
  },
} as const satisfies Translations;
