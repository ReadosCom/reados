import { applicationFetch } from "@components/application/application.client.ts";
import type { AppConfig } from "@components/application/application.schema.ts";

const defaultAppConfig: AppConfig = {
  rootFqdn: `reados.localhost`,
  appFqdn: `app.reados.localhost`,
  tenantServiceFqdn: `tenant.reados.localhost`,
};

let appConfig: AppConfig = defaultAppConfig;

export const getAppConfig = () => {
  return appConfig;
};

const parseAppConfig = (value: unknown): AppConfig => {
  if (!value || typeof value !== `object`) {
    return defaultAppConfig;
  }

  const candidate = value as {
    rootFqdn?: unknown;
    appFqdn?: unknown;
    tenantServiceFqdn?: unknown;
  };

  if (typeof candidate.rootFqdn !== `string`) {
    return defaultAppConfig;
  }

  const trimmedRootFqdn = candidate.rootFqdn.trim();

  if (!trimmedRootFqdn) {
    return defaultAppConfig;
  }

  const trimmedAppFqdn = typeof candidate.appFqdn === `string` ? candidate.appFqdn.trim() : ``;
  const trimmedTenantServiceFqdn = typeof candidate.tenantServiceFqdn === `string` ? candidate.tenantServiceFqdn.trim() : ``;

  return {
    rootFqdn: trimmedRootFqdn,
    appFqdn: trimmedAppFqdn || `app.${trimmedRootFqdn}`,
    tenantServiceFqdn: trimmedTenantServiceFqdn || `tenant.${trimmedRootFqdn}`,
  };
};

export const loadAppConfig = async (): Promise<AppConfig> => {
  const loadConfigFromUrl = async (url: string): Promise<AppConfig | null> => {
    try {
      const response = await applicationFetch({
        cache: `no-store`,
        credentials: `same-origin`,
        path: url,
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as unknown;
      return parseAppConfig(payload);
    } catch {
      return null;
    }
  };

  try {
    const primaryConfig = await loadConfigFromUrl(`/config.json`);

    if (primaryConfig) {
      appConfig = primaryConfig;
      return primaryConfig;
    }

    const fallbackConfig = await loadConfigFromUrl(`/default.config.json`);

    if (fallbackConfig) {
      appConfig = fallbackConfig;
      return fallbackConfig;
    }

    appConfig = defaultAppConfig;
    return defaultAppConfig;
  } catch {
    appConfig = defaultAppConfig;
    return defaultAppConfig;
  }
};
