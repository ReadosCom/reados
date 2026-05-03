import * as React from "react"

const MOBILE_BREAKPOINT = 768
type WindowLike = {
  innerWidth: number
  matchMedia: (query: string) => {
    addEventListener: (event: "change", listener: () => void) => void
    removeEventListener: (event: "change", listener: () => void) => void
  }
}

const getWindow = (): WindowLike | null => {
  const candidate = globalThis as unknown as { window?: WindowLike }
  return candidate.window ?? null
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const currentWindow = getWindow()

    if (!currentWindow) {
      setIsMobile(false)
      return
    }

    const mql = currentWindow.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(currentWindow.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(currentWindow.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
