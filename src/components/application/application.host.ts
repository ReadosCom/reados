import { getBrowserHash, getBrowserHostname, getBrowserPathname, getBrowserPort, getBrowserProtocol, getBrowserSearch, setBrowserLocation } from "@components/application/application.browser.ts";

let authenticationEntryHost = `app.reados.localhost`;

const getServiceOrigin = (service: string) => {
  const hostname = getBrowserHostname();
  const protocol = getBrowserProtocol();

  if (!hostname || !protocol) {
    throw new Error(`${service} service origin could not be resolved from browser location.`);
  }

  return `${protocol}//${service}.${hostname}`;
};

export const setAuthenticationEntryHost = (appFqdn: string) => {
  const normalized = appFqdn.trim();

  if (!normalized) {
    return;
  }

  authenticationEntryHost = normalized;
};

export const redirectRootFqdnToAppHost = (rootFqdn: string, appFqdn: string) => {
  const hostname = getBrowserHostname();
  const protocol = getBrowserProtocol();
  const port = getBrowserPort();
  const pathname = getBrowserPathname();
  const search = getBrowserSearch();
  const hash = getBrowserHash();

  if (!hostname || !protocol || pathname === null || search === null || hash === null) {
    return;
  }

  if (hostname !== rootFqdn) {
    return;
  }

  const targetUrl = `${protocol}//${appFqdn}${port ? `:${port}` : ``}${pathname}${search}${hash}`;
  setBrowserLocation(targetUrl);
};

/**
 * Detect whether the current host should start the root authentication journey.
 */
export const isAuthenticationEntryHost = () => {
  const hostname = getBrowserHostname();

  if (!hostname) {
    return true;
  }

  return hostname === authenticationEntryHost;
};

/**
 * Returns authentication service origin using the current browser protocol and hostname.
 * Example: from `http://tenant.reados.localhost`, returns `http://authentication.tenant.reados.localhost`.
 */
export const getAuthenticationServiceOrigin = () => getServiceOrigin(`authentication`);
/**
 * Returns core service origin using the current browser protocol and hostname.
 * Example: from `http://tenant.reados.localhost`, returns `http://core.tenant.reados.localhost`.
 */
export const getCoreServiceOrigin = () => getServiceOrigin(`core`);
/**
 * Returns ERP service origin using the current browser protocol and hostname.
 * Example: from `http://tenant.reados.localhost`, returns `http://erp.tenant.reados.localhost`.
 */
export const getErpServiceOrigin = () => getServiceOrigin(`erp`);
