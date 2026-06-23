import { createContext, useContext } from 'react';

import type { MenuNode } from '@/store/menu.store';
import { AppRoute } from './route.type';

export type RouteLoader = (systemKey: string, menuTree: MenuNode[]) => AppRoute[];

export const RouteLoaderContext = createContext<RouteLoader | null>(null);

export function useRouteLoader() {
  const loader = useContext(RouteLoaderContext);

  if (!loader) {
    throw new Error('RouteLoaderProvider가 설정되지 않았습니다. App 또는 ModuleApp에서 loader를 주입해야 합니다.');
  }

  return loader;
}
