import { isAuthenticationEntryHost } from '@components/application/application.host.ts';
import { AppShell } from '@components/application/AppShell';
import { Dashboard } from '@components/dashboard/Dashboard';
import { Home } from '@components/home/Home';

export const RootIndex = () => {
  if (isAuthenticationEntryHost()) {
    return <Home />;
  }

  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
};
