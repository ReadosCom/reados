import { useQuery } from '@tanstack/react-query';

import { getBrowserHostname, getBrowserProtocol } from '@components/application/application.browser.ts';

/**
 * Builds the core service origin for the current browser hostname.
 */
export const getCoreServiceOrigin = () => {
  const hostname = getBrowserHostname();
  const protocol = getBrowserProtocol();

  if (!hostname || !protocol) {
    return null;
  }

  return `${protocol}//core.${hostname}`;
};

/**
 * Probes whether the browser is running on the root Reados application host.
 */
export const probeRootApplication = async () => {
  const coreServiceOrigin = getCoreServiceOrigin();

  if (!coreServiceOrigin) {
    return false;
  }

  try {
    const response = await fetch(`${coreServiceOrigin}/whoami`);

    if (!response.ok) {
      return false;
    }

    const body = (await response.json()) as {
      whoami?: string;
    };

    return body.whoami === `root`;
  } catch {
    return false;
  }
};

/**
 * Detect whether the current browser host is the root application host by asking the core service.
 */
export const useRootApplicationQuery = () => {
  return useQuery({
    gcTime: Infinity,
    queryFn: probeRootApplication,
    queryKey: [`app`, `rootApplication`],
    staleTime: Infinity,
  });
};
