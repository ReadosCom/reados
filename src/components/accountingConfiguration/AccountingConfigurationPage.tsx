import { AppShell } from "@components/application/AppShell";

import { AccountingConfiguration } from "./AccountingConfiguration.tsx";

/**
 * Renders the dedicated accounting configuration route page.
 */
export const AccountingConfigurationPage = () => {
  return (
    <AppShell>
      <main className="relative min-h-[100vh] overflow-hidden rounded-xl bg-background md:min-h-min">
        <div className="relative w-full h-full px-2 py-4 sm:px-4 sm:py-6">
          <AccountingConfiguration />
        </div>
      </main>
    </AppShell>
  );
};
