import { readFileSync } from 'node:fs';
import path from 'node:path';

type FrontendConfig = {
  rootFqdn: string;
  appFqdn: string;
  tenantServiceFqdn: string;
};

const defaultConfig: FrontendConfig = {
  rootFqdn: `reados.localhost`,
  appFqdn: `app.reados.localhost`,
  tenantServiceFqdn: `tenant.reados.localhost`,
};

const parseFrontendConfig = (value: unknown): FrontendConfig => {
  if (!value || typeof value !== `object`) {
    return defaultConfig;
  }

  const payload = value as {
    rootFqdn?: unknown;
    appFqdn?: unknown;
    tenantServiceFqdn?: unknown;
  };

  if (typeof payload.rootFqdn !== `string` || !payload.rootFqdn.trim()) {
    return defaultConfig;
  }

  const rootFqdn = payload.rootFqdn.trim();
  const appFqdn = typeof payload.appFqdn === `string` && payload.appFqdn.trim() ? payload.appFqdn.trim() : `app.${rootFqdn}`;
  const tenantServiceFqdn = typeof payload.tenantServiceFqdn === `string` && payload.tenantServiceFqdn.trim() ? payload.tenantServiceFqdn.trim() : `tenant.${rootFqdn}`;

  return {
    rootFqdn,
    appFqdn,
    tenantServiceFqdn,
  };
};

const loadConfigFromFile = (filePath: string): FrontendConfig | null => {
  try {
    const raw = readFileSync(filePath, `utf8`);
    return parseFrontendConfig(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const getFrontendConfig = (): FrontendConfig => {
  const runtimeConfigPath = path.join(process.cwd(), `public/config.json`);
  const defaultConfigPath = path.join(process.cwd(), `public/default.config.json`);

  return loadConfigFromFile(runtimeConfigPath) ?? loadConfigFromFile(defaultConfigPath) ?? defaultConfig;
};

export const getAppOrigin = () => {
  return `http://${getFrontendConfig().appFqdn}`;
};

export const getTenantOrigin = (tenantSlug: string) => {
  return `http://${tenantSlug}.${getFrontendConfig().rootFqdn}`;
};

export const getAuthenticationOrigin = (tenantSlug: string) => {
  return `http://authentication.${tenantSlug}.${getFrontendConfig().rootFqdn}`;
};

export const getCoreOrigin = (tenantSlug: string) => {
  return `http://core.${tenantSlug}.${getFrontendConfig().rootFqdn}`;
};

export const getRootCoreOrigin = () => {
  return `http://core.${getFrontendConfig().rootFqdn}`;
};
