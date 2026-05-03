import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { App } from './App.tsx';
import { loadAppConfig } from '@components/application/application.config.ts';
import { redirectRootFqdnToAppHost, setAuthenticationEntryHost } from '@components/application/application.host.ts';
import './assets/styles/tailwind.css';

const queryClient = new QueryClient();

const bootstrap = async () => {
  const appConfig = await loadAppConfig();
  setAuthenticationEntryHost(appConfig.appFqdn);
  redirectRootFqdnToAppHost(appConfig.rootFqdn, appConfig.appFqdn);

  createRoot(document.getElementById(`root`)!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
};

void bootstrap();
