/// <reference types="vite/client" />
import type { TranslationEntry, TranslationLanguage, Translations } from "@components/i18n/i18n.types.ts";
import { useEffect, useState } from "react";
import { useTranslation as useI18NextTranslation } from "react-i18next";

type TranslationModule = {
  translations?: Translations;
};

const translationImporters = import.meta.glob("../*/*.i18n.ts");
const translationImportersByPath: Record<string, () => Promise<TranslationModule>> = {};
const loadedBundles = new Set<string>();
const inFlightBundleLoads = new Map<string, Promise<void>>();
const loadedModules = new Map<string, TranslationModule>();
const inFlightModuleLoads = new Map<string, Promise<TranslationModule>>();

for (const [path, importer] of Object.entries(translationImporters)) {
  const match = path.match(/^\.\.\/([^/]+\/[^/]+\.i18n\.ts)$/u);

  if (!match) {
    continue;
  }

  const [, relativePath] = match;
  const fullPath = `@components/${relativePath}`;
  translationImportersByPath[fullPath] = importer as () => Promise<TranslationModule>;
}

const resolveCanonicalPath = (componentPath: string) => {
  if (componentPath.startsWith(`@components/`)) {
    return componentPath;
  }

  if (!componentPath.startsWith(`./`)) {
    throw new Error(`Translation path must start with "./" or "@components/": ${componentPath}`);
  }

  const fileName = componentPath.slice(2);
  const matches = Object.keys(translationImportersByPath).filter((fullPath) => fullPath.endsWith(`/${fileName}`));

  if (matches.length === 1) {
    return matches[0]!;
  }

  if (matches.length === 0) {
    throw new Error(`No translation file found for relative path: ${componentPath}`);
  }

  throw new Error(`Ambiguous translation path "${componentPath}". Matches: ${matches.join(`, `)}`);
};

const buildNamespaceResource = (translations: Translations, language: string) => {
  const namespaceResource: Record<string, string> = {};

  for (const [sourceText, localizedByLanguage] of Object.entries(translations)) {
    const localizedEntry = (localizedByLanguage as Partial<Record<string, TranslationEntry>>)[language as TranslationLanguage];
    namespaceResource[sourceText] = localizedEntry?.translation ?? sourceText;
  }

  return namespaceResource;
};

const normalizeLanguage = (language: string) => language.toLowerCase().split(`-`)[0] ?? language.toLowerCase();

const buildLoadKey = (language: string, namespace: string) => `${language}::${namespace}`;

const loadTranslationModule = async (namespace: string, importer: () => Promise<TranslationModule>) => {
  const cachedModule = loadedModules.get(namespace);

  if (cachedModule) {
    return cachedModule;
  }

  const inFlightModule = inFlightModuleLoads.get(namespace);

  if (inFlightModule) {
    return inFlightModule;
  }

  const modulePromise = importer().then((moduleValue) => {
    loadedModules.set(namespace, moduleValue);
    return moduleValue;
  });

  inFlightModuleLoads.set(namespace, modulePromise);

  try {
    return await modulePromise;
  } finally {
    inFlightModuleLoads.delete(namespace);
  }
};

export const useTranslation = (componentPath: string) => {
  const [, setVersion] = useState(0);
  const namespace = resolveCanonicalPath(componentPath);
  const { t, i18n: i18next } = useI18NextTranslation(namespace);

  useEffect(() => {
    const importer = translationImportersByPath[namespace];

    if (!importer) {
      return;
    }

    let isDisposed = false;

    const loadResources = async () => {
      const moduleValue = await loadTranslationModule(namespace, importer);
      const translations = moduleValue.translations;

      if (!translations || isDisposed) {
        return;
      }

      const activeLanguage = i18next.resolvedLanguage ?? i18next.language ?? "en";
      const normalizedLanguage = normalizeLanguage(activeLanguage);
      const loadKey = buildLoadKey(normalizedLanguage, namespace);

      if (loadedBundles.has(loadKey)) {
        return;
      }

      const existingLoad = inFlightBundleLoads.get(loadKey);

      if (existingLoad) {
        await existingLoad;
        return;
      }

      const loadBundle = async () => {
        const resource = buildNamespaceResource(translations, normalizedLanguage);
        i18next.addResourceBundle(normalizedLanguage, namespace, resource, true, true);
        loadedBundles.add(loadKey);
      };
      const loadPromise = loadBundle();

      inFlightBundleLoads.set(loadKey, loadPromise);

      try {
        await loadPromise;
      } finally {
        inFlightBundleLoads.delete(loadKey);
      }

      if (isDisposed) {
        return;
      }

      setVersion((current) => current + 1);
    };

    void loadResources();

    return () => {
      isDisposed = true;
    };
  }, [i18next, namespace]);

  return { t, i18n: i18next };
};
