import { getBrowserHash, getBrowserHostname, getBrowserPathname, getBrowserPort, getBrowserProtocol, getBrowserSearch, setBrowserLocation } from '@components/app/app.browser.ts';

let authenticationEntryHost = `app.reados.localhost`;

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
