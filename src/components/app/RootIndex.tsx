import { isAuthenticationEntryHost } from '@components/app/app.host.ts';
import { Dashboard } from '@components/dashboard/Dashboard';
import { Identify } from '@components/identify/Identify';

export const RootIndex = () => {
  if (isAuthenticationEntryHost()) {
    return <Identify />;
  }

  return <Dashboard />;
};
