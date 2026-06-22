import type { ReactNode } from 'react';

import { RouteLoaderContext, type RouteLoader } from '@/router/routeLoaderContext';

type RouteLoaderProviderProps = {
  loader: RouteLoader;
  children: ReactNode;
};

export function RouteLoaderProvider({ loader, children }: RouteLoaderProviderProps) {
  return <RouteLoaderContext.Provider value={loader}>{children}</RouteLoaderContext.Provider>;
}
