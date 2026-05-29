import { RouterProvider } from "@tanstack/react-router";
import { useLanguagePreferenceSync } from "@components/i18n/useLanguagePreferenceSync.ts";

import { router } from "./router.tsx";

export const App = () => {
  const languageReady = useLanguagePreferenceSync();

  return <>{languageReady ? <RouterProvider router={router} /> : null}</>;
};
