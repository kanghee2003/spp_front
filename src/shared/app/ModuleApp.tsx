import { useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';
import { Navigate, Route, Routes } from 'react-router-dom';

import { getMockMenuTree } from '@/config/mockMenuConfig';
import AppLayout from '@/layout/AppLayout';
import Login from '@/layout/login/Login';
import { RouteLoaderProvider } from '@/provider/RouteLoaderProvider';
import type { RouteLoader } from '@/router/routeLoaderContext';
import { useAuthStore } from '@/store/auth.store';
import { type MenuNode, useMenuStore } from '@/store/menu.store';
import { useUserInfoStore } from '@/store/userInfo.store';
import { isMockMenuSystem, type SystemKey } from '@/config/system.config';
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

  const getMenuTreeFromApi = async (systemKey: SystemKey) => {
    const res = await axios.get<{ data: MenuNode[] }>('/cm/menu/tree', {
      params: { systemKey },
    });

    return res.data.data;
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

        if (isMockMenuSystem(moduleKey)) {
          setMenuTree(getMockMenuTree(moduleKey));
          return;
        }

        const nextMenuTree = await getMenuTreeFromApi(moduleKey);
        setMenuTree(nextMenuTree);
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
            element={token ? route.element : <Login />}
          />
        ))}

        <Route path={`${modulePath}/*`} element={!token ? <Login /> : loading ? <div /> : <AppLayout />} />

        <Route path="*" element={<Navigate to={token ? moduleRootPath : '/'} replace />} />
      </Routes>
    </RouteLoaderProvider>
  );
}
