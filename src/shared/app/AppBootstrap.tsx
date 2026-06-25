import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import type { SystemKey } from '@/config/system.config';

import { setupGlobalAxios } from '@/api/axiosInterceptor';
import GlobalMessageProvider from '@/provider/GlobalMessageProvider';
import AppLoading from '@/shared/component/Loading/AppLoading';
import { registerVitePreloadErrorHandler } from '@/error/registerVitePreloadErrorHandler';

import '@/styles/index.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});

type BootstrapOptions = {
  app: ReactNode;
  apiSystemKey?: SystemKey;
};

export function bootstrapApp({ app, apiSystemKey }: BootstrapOptions) {
  registerVitePreloadErrorHandler();
  setupGlobalAxios(apiSystemKey);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {app}
        {import.meta.env.VITE_ENV_PROFILE !== 'prod' && <ReactQueryDevtools initialIsOpen={false} />}
        <AppLoading />
        <GlobalMessageProvider />
      </QueryClientProvider>
    </BrowserRouter>,
  );
}
