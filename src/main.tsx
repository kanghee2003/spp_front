import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import '@/styles/index.css';
import GlobalAxiosProvider from './provider/GlobalAxiosProvider';

import GlobalMessageProvider from './provider/GlobalMessageProvider';
import SppLoading from './pages/spp/component/Loading/SppLoading';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <GlobalAxiosProvider>
        <App />
        {import.meta.env.VITE_ENV_PROFILE !== 'prod' && <ReactQueryDevtools initialIsOpen={false} />}
        <SppLoading />
        <GlobalMessageProvider />
      </GlobalAxiosProvider>
    </QueryClientProvider>
  </BrowserRouter>,
);
