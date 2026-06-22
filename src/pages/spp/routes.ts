import type { ComponentType } from 'react';

import { createAutoRoutes } from '@/router/createAutoRoutes';
import type { MenuNode } from '@/store/menu.store';

const pageModules = import.meta.glob('./view/**/*.tsx') as Record<string, () => Promise<{ default: ComponentType<any> }>>;

export function loadSppRoutes(_systemKey: string, menuTree: MenuNode[]) {
  return createAutoRoutes(pageModules, menuTree);
}
