import { isAuthenticationEntryHost } from '@components/application/application.host.ts';
import { ApplicationLayout } from '@components/application/ApplicationLayout';
import { Dashboard } from '@components/dashboard/Dashboard';
import { Home } from '@components/home/Home';

export const RootIndex = () => {
  if (isAuthenticationEntryHost()) {
    return <Home />;
  }

  return (
    <ApplicationLayout>
      <Dashboard />
    </ApplicationLayout>
  );
};
