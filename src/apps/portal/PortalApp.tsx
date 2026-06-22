import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { DEFAULT_SYSTEM_KEY } from '@/config/system.config';
import AdminLogin from '@/layout/login/AdminLogin';
import Login from '@/layout/login/Login';
import { useAuthStore } from '@/store/auth.store';
import { getSystemKeyFromRootPath, getSystemRootPath, isSystemPath, normalizePath } from '@/utils/system.util';

const DEFAULT_SYSTEM_PATH = getSystemRootPath(DEFAULT_SYSTEM_KEY);

const isPortalPath = (pathname: string) => {
  const normalized = normalizePath(pathname);
  return normalized === '/' || normalized === '/admin';
};

export default function PortalApp() {
  const token = useAuthStore((s) => s.token);

  const pathname = window.location.pathname;
  const portalPath = isPortalPath(pathname);
  const systemPath = isSystemPath(pathname);
  const systemRootKey = getSystemKeyFromRootPath(pathname);

  useEffect(() => {
    if (!token) return;

    if (portalPath) {
      window.location.replace(DEFAULT_SYSTEM_PATH);
      return;
    }

    if (systemRootKey && pathname === `/${systemRootKey}`) {
      window.location.replace(getSystemRootPath(systemRootKey));
    }
  }, [token, portalPath, systemRootKey, pathname]);

  if (token && (portalPath || systemRootKey)) {
    return null;
  }

  if (systemPath) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
