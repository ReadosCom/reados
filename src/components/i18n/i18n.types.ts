export type TranslationLanguage = "tr" | "de" | "es" | "fr" | "it" | "pt" | "nl" | "pl";
export type TranslationSource = "human" | "AI";
export type TranslationEntry = {
  translation: string;
  translatedBy: TranslationSource;
};
export type Translation = Partial<Record<TranslationLanguage, TranslationEntry>>;
export type Translations = Record<string, Translation>;
