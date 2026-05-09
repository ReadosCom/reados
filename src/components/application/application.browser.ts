type BrowserLocation = {
  protocol: string;
  hostname: string;
  host: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  replace: (url: string) => void;
};

export const getBrowserLocation = (): BrowserLocation | null => {
  const browserWindow = (
    globalThis as {
      window?: {
        location: BrowserLocation;
      };
    }
  ).window;

  if (!browserWindow) {
    return null;
  }

  return browserWindow.location;
};

export const getBrowserHostname = () => getBrowserLocation()?.hostname ?? null;

export const getBrowserProtocol = () => getBrowserLocation()?.protocol ?? null;

export const getBrowserHost = () => getBrowserLocation()?.host ?? null;

export const getBrowserPort = () => getBrowserLocation()?.port ?? null;

export const getBrowserPathname = () => getBrowserLocation()?.pathname ?? null;

export const getBrowserSearch = () => getBrowserLocation()?.search ?? null;

export const getBrowserHash = () => getBrowserLocation()?.hash ?? null;

export const getBrowserOrigin = () => {
  const protocol = getBrowserProtocol();
  const host = getBrowserHost();

  if (!protocol || !host) {
    return null;
  }

  return `${protocol}//${host}`;
};

export const setBrowserLocation = (url: string) => {
  const location = getBrowserLocation();

  if (!location) {
    return;
  }

  location.replace(url);
};
