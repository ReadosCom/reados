import { useEffect, useMemo, useRef, useState } from 'react';
import { getBrowserPathname, setBrowserLocation } from '@components/application/application.browser.ts';
import { isAuthenticationEntryHost } from '@components/application/application.host.ts';
import { useAuthenticationSessionQuery, useUpdateAuthenticationProfileMutation } from '@components/authentication/authentication.query.ts';
import i18n, { applyPreferredLanguage, languagePreference } from '@components/i18n/i18n.ts';

const normalizeLanguage = (language: string) => language.trim().toLowerCase().split(`-`)[0] ?? languagePreference.defaultLanguage;

/**
 * Synchronizes i18n language with authentication-owned user profile language.
 */
export const useLanguagePreferenceSync = () => {
  const { data: authenticationSession, isFetched } = useAuthenticationSessionQuery();
  const { mutateAsync: updateProfileLanguage } = useUpdateAuthenticationProfileMutation();
  const latestProfileLanguageRef = useRef<string>(languagePreference.defaultLanguage);
  const [activeLanguage, setActiveLanguage] = useState<string>(i18n.resolvedLanguage || i18n.language || languagePreference.defaultLanguage);

  useEffect(() => {
    if (!isFetched) {
      return;
    }

    const profileLanguage = authenticationSession?.authenticated ? authenticationSession.session?.language : null;

    if (!profileLanguage) {
      return;
    }

    const normalized = normalizeLanguage(profileLanguage);
    latestProfileLanguageRef.current = normalized;
    void applyPreferredLanguage(normalized);
  }, [authenticationSession?.authenticated, authenticationSession?.session?.language, isFetched]);

  useEffect(() => {
    const onLanguageChanged = (language: string) => {
      const normalized = normalizeLanguage(language);
      setActiveLanguage(normalized);

      if (latestProfileLanguageRef.current === normalized) {
        return;
      }

      latestProfileLanguageRef.current = normalized;
      void updateProfileLanguage({
        language: normalized,
      });
    };

    i18n.on(`languageChanged`, onLanguageChanged);

    return () => {
      i18n.off(`languageChanged`, onLanguageChanged);
    };
  }, [updateProfileLanguage]);

  useEffect(() => {
    if (authenticationSession?.authenticated !== false) {
      return;
    }

    if (isAuthenticationEntryHost()) {
      return;
    }

    const pathname = getBrowserPathname();

    if (pathname === `/authentication`) {
      return;
    }

    setBrowserLocation(`/authentication`);
  }, [authenticationSession?.authenticated]);

  const isReady = useMemo(() => {
    if (isAuthenticationEntryHost()) {
      return true;
    }

    if (!isFetched) {
      return false;
    }

    const profileLanguage = authenticationSession?.authenticated ? authenticationSession.session?.language : null;

    if (!profileLanguage) {
      return true;
    }

    return normalizeLanguage(profileLanguage) === normalizeLanguage(activeLanguage);
  }, [activeLanguage, authenticationSession?.authenticated, authenticationSession?.session?.language, isFetched]);

  return isReady;
};
