import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AppLayout from '@/layout/AppLayout';
import { useMenuStore } from '@/store/menu.store';
import { DEFAULT_SYSTEM_KEY, SYSTEM_KEY_LIST } from '@/config/system.config';
import { getSystemKeyFromPath, getSystemRootPath, setSystemCss } from '@/utils/system.util';
import AdminLogin from './layout/login/AdminLogin';
import Login from './layout/login/Login';
import { useAuthStore } from './store/auth.store';
import { useUserInfoStore } from './store/userInfo.store';
import { getMockMenuTree } from './config/mockMenuConfig';
import { loadRoutes } from '@/router/AutoRoutes';
import { RouteLoaderProvider } from '@/provider/RouteLoaderProvider';

// import { UserService } from '@/service/user.service';
// import { MenuService } from '@/service/menu.service';

export default function App() {
  const location = useLocation();

  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clearToken);

  const systemKey = useMenuStore((s) => s.systemKey);
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

  const getMockMenu = async () => {
    return getMockMenuTree(systemKey);
  };

  const getMenuTree = async (nextSystemKey: string) => {
    // const res = await MenuService.getMenuTree(nextSystemKey);
    // return res.data.data;
    return [];
  };

  useEffect(() => {
    const nextSystemKey = getSystemKeyFromPath(location.pathname);
    setSystemKey(nextSystemKey);
  }, [location.pathname, setSystemKey]);

  useEffect(() => {
    setSystemCss(systemKey);
  }, [systemKey]);

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
        // const nextMenuTree = await getMenuTree(systemKey);
        const nextMenuTree = await getMockMenu();
        setMenuTree(nextMenuTree);
      } catch (e) {
        setMenuTree([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuTree();
  }, [token, userInfo, systemKey, setMenuTree]);

  const defaultSystemPath = getSystemRootPath(DEFAULT_SYSTEM_KEY);

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to={defaultSystemPath} replace /> : <Login />} />
      <Route path="/admin" element={token ? <Navigate to={defaultSystemPath} replace /> : <AdminLogin />} />

      {SYSTEM_KEY_LIST.map((key) => (
        <Route
          key={key}
          path={`/${key}/*`}
          element={
            !token ? (
              <Navigate to="/" replace />
            ) : loading ? (
              <div />
            ) : (
              <RouteLoaderProvider loader={loadRoutes}>
                <AppLayout />
              </RouteLoaderProvider>
            )
          }
        />
      ))}

      <Route path="*" element={<Navigate to={token ? defaultSystemPath : '/'} replace />} />
    </Routes>
  );
}
