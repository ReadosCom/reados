import * as React from "react";

const MOBILE_BREAKPOINT = 768;
type WindowLike = {
  innerWidth: number;
  matchMedia: (query: string) => {
    addEventListener: (event: "change", listener: () => void) => void;
    removeEventListener: (event: "change", listener: () => void) => void;
  };
};

const getWindow = (): WindowLike | null => {
  const candidate = globalThis as unknown as { window?: WindowLike };
  return candidate.window ?? null;
};

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    const currentWindow = getWindow();
    return currentWindow ? currentWindow.innerWidth < MOBILE_BREAKPOINT : false;
  });

  React.useEffect(() => {
    const currentWindow = getWindow();

    if (!currentWindow) return;

    const mql = currentWindow.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(currentWindow.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
