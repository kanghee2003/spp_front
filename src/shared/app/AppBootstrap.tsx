import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

import GlobalAxiosProvider from '@/provider/GlobalAxiosProvider';
import GlobalMessageProvider from '@/provider/GlobalMessageProvider';
import AppLoading from '@/shared/component/Loading/AppLoading';
import { registerVitePreloadErrorHandler } from '@/shared/app/registerVitePreloadErrorHandler';

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
};

export function bootstrapApp({ app }: BootstrapOptions) {
  registerVitePreloadErrorHandler();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <GlobalAxiosProvider>
          {app}
          {import.meta.env.VITE_ENV_PROFILE !== 'prod' && <ReactQueryDevtools initialIsOpen={false} />}
          <AppLoading />
          <GlobalMessageProvider />
        </GlobalAxiosProvider>
      </QueryClientProvider>
    </BrowserRouter>,
  );
}
