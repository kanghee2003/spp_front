import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { getMockMenuTree } from '@/config/mockMenuConfig';
import AppLayout from '@/layout/AppLayout';
import { RouteLoaderProvider } from '@/provider/RouteLoaderProvider';
import type { RouteLoader } from '@/router/routeLoaderContext';
import { useAuthStore } from '@/store/auth.store';
import { useMenuStore } from '@/store/menu.store';
import { useUserInfoStore } from '@/store/userInfo.store';
import { type SystemKey } from '@/config/system.config';
import { getSystemBasePath, getSystemRootPath, normalizePath, setSystemCss } from '@/utils/system.util';

type ModuleExtraRoute = {
  path: string;
  element: ReactNode;
};

type ModuleAppProps = {
  moduleKey: SystemKey;
  loadRoutes: RouteLoader;
  extraRoutes?: ModuleExtraRoute[];
};

export default function ModuleApp({ moduleKey, loadRoutes, extraRoutes = [] }: ModuleAppProps) {
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clearToken);

  const setSystemKey = useMenuStore((s) => s.setSystemKey);
  const setMenuTree = useMenuStore((s) => s.setMenuTree);

  const userInfo = useUserInfoStore((s) => s.userInfo);
  const setUserInfo = useUserInfoStore((s) => s.setUserInfo);

  const [loading, setLoading] = useState(true);

  const getUserInfo = async () => {
    // const res = await UserService.getUserInfo();
    // return res.data.data;
    return { userId: '1', userName: '1', admFlag: false };
  };

  const modulePath = getSystemBasePath(moduleKey);
  const moduleRootPath = getSystemRootPath(moduleKey);
  const currentPath = normalizePath(window.location.pathname);
  const isCurrentModulePath = currentPath === modulePath || currentPath.startsWith(`${modulePath}/`);


  useEffect(() => {
    if (isCurrentModulePath) return;

    window.location.replace('/');
  }, [isCurrentModulePath]);

  useEffect(() => {
    if (!isCurrentModulePath) return;

    setSystemKey(moduleKey);
    setSystemCss(moduleKey);
  }, [moduleKey, setSystemKey, isCurrentModulePath]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isCurrentModulePath) {
        setLoading(false);
        return;
      }

      if (!token) {
        setUserInfo(undefined);
        setMenuTree([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const nextUserInfo = await getUserInfo();
        setUserInfo(nextUserInfo);
      } catch (e) {
        clearToken();
        setUserInfo(undefined);
        setMenuTree([]);
      }
    };

    fetchUserInfo();
  }, [token, clearToken, setUserInfo, setMenuTree, isCurrentModulePath]);

  useEffect(() => {
    const fetchMenuTree = async () => {
      if (!isCurrentModulePath) {
        setLoading(false);
        return;
      }

      if (!token || !userInfo) {
        setMenuTree([]);
        setLoading(false);
        return;
      }

      try {
        setMenuTree([]);
        // const res = await MenuService.getMenuTree(moduleKey);
        // setMenuTree(res.data.data);
        setMenuTree(getMockMenuTree(moduleKey));
      } catch (e) {
        setMenuTree([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuTree();
  }, [token, userInfo, moduleKey, setMenuTree, isCurrentModulePath]);

  if (!isCurrentModulePath) {
    return null;
  }

  return (
    <RouteLoaderProvider loader={loadRoutes}>
      <Routes>
        <Route path="/" element={<Navigate to={token ? moduleRootPath : '/'} replace />} />

        {extraRoutes.map((route) => (
          <Route
            key={route.path}
            path={`${modulePath}${route.path.startsWith('/') ? route.path : `/${route.path}`}`}
            element={token ? route.element : <Navigate to="/" replace />}
          />
        ))}

        <Route path={`${modulePath}/*`} element={!token ? <Navigate to="/" replace /> : loading ? <div /> : <AppLayout />} />

        <Route path="*" element={<Navigate to={token ? moduleRootPath : '/'} replace />} />
      </Routes>
    </RouteLoaderProvider>
  );
}
