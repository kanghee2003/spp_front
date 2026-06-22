import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { getMockMenuTree } from '@/config/mockMenuConfig';
import AdminLogin from '@/layout/login/AdminLogin';
import AppLayout from '@/layout/AppLayout';
import Login from '@/layout/login/Login';
import { RouteLoaderProvider } from '@/provider/RouteLoaderProvider';
import type { RouteLoader } from '@/router/routeLoaderContext';
import { useAuthStore } from '@/store/auth.store';
import { useMenuStore } from '@/store/menu.store';
import { useUserInfoStore } from '@/store/userInfo.store';
import { type SystemKey } from '@/config/system.config';
import { getSystemRootPath, setSystemCss } from '@/utils/system.util';

type ModuleAppProps = {
  moduleKey: SystemKey;
  loadRoutes: RouteLoader;
};

export default function ModuleApp({ moduleKey, loadRoutes }: ModuleAppProps) {
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

  useEffect(() => {
    setSystemKey(moduleKey);
    setSystemCss(moduleKey);
  }, [moduleKey, setSystemKey]);

  useEffect(() => {
    const fetchUserInfo = async () => {
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
  }, [token, clearToken, setUserInfo, setMenuTree]);

  useEffect(() => {
    const fetchMenuTree = async () => {
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
  }, [token, userInfo, moduleKey, setMenuTree]);

  const modulePath = `/${moduleKey}`;
  const moduleRootPath = getSystemRootPath(moduleKey);

  return (
    <RouteLoaderProvider loader={loadRoutes}>
      <Routes>
        <Route path="/" element={token ? <Navigate to={moduleRootPath} replace /> : <Login />} />

        <Route path={`${modulePath}/admin`} element={token ? <Navigate to={moduleRootPath} replace /> : <AdminLogin />} />

        <Route path={`${modulePath}/*`} element={!token ? <Login /> : loading ? <div /> : <AppLayout />} />

        <Route path="*" element={<Navigate to={token ? moduleRootPath : '/'} replace />} />
      </Routes>
    </RouteLoaderProvider>
  );
}
