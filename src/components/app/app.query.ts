import { useQuery } from '@tanstack/react-query';

const getCurrentBrowserOrigin = () => {
  const browserWindow = (
    globalThis as {
      window?: {
        location: {
          hostname: string;
          protocol: string;
        };
      };
    }
  ).window;

  if (!browserWindow) {
    return null;
  }

  return browserWindow.location;
};

/**
 * Builds the core service origin for the current browser hostname.
 */
export const getCoreServiceOrigin = () => {
  const browserLocation = getCurrentBrowserOrigin();

  if (!browserLocation) {
    return null;
  }

  const { hostname, protocol } = browserLocation;

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
