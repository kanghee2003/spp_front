import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { getMockMenuTree } from '@/config/mockMenuConfig';
import AppLayout from '@/layout/AppLayout';
import { useMenuStore } from '@/store/menu.store';
import { getSystemKeyFromPath, setSystemCss, SYSTEM_KEY_LIST } from '@/utils/system.util';
import AdminLogin from './layout/AdminLogin';
import Login from './layout/Login';
import { useAuthStore } from './store/auth.store';
import { useUserInfoStore } from './store/userInfo.store';

export default function App() {
  const location = useLocation();

  const token = useAuthStore((s) => s.token);
  const systemKey = useMenuStore((s) => s.systemKey);
  const userInfo = useUserInfoStore((s) => s.userInfo);
  const setUserInfo = useUserInfoStore((s) => s.setUserInfo);
  const setSystemKey = useMenuStore((s) => s.setSystemKey);
  const setMenuTree = useMenuStore((s) => s.setMenuTree);

  const getUserInfo = () => {
    setUserInfo({ userId: '1', userName: '1', admFlag: false });
  };

  useEffect(() => {
    const nextSystemKey = getSystemKeyFromPath(location.pathname);
    setSystemKey(nextSystemKey);
  }, [location.pathname]);

  useEffect(() => {
    setSystemCss(systemKey);
  }, [systemKey]);

  useEffect(() => {
    if (userInfo) {
      setMenuTree(getMockMenuTree(systemKey));
    }
  }, [userInfo, systemKey]);

  useEffect(() => {
    if (token) {
      getUserInfo();
    }
  }, [token]);

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/spp" replace /> : <Login />} />
      <Route path="/admin" element={token ? <Navigate to="/spp" replace /> : <AdminLogin />} />

      {SYSTEM_KEY_LIST.map((key) => (
        <Route key={key} path={`/${key}/*`} element={token ? <AppLayout /> : <Navigate to="/" replace />} />
      ))}

      <Route path="*" element={<Navigate to={token ? '/spp' : '/'} replace />} />
    </Routes>
  );
}
