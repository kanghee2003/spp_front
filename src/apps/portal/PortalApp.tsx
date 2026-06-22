import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import AdminLogin from '@/layout/login/AdminLogin';
import Login from '@/layout/login/Login';
import { useAuthStore } from '@/store/auth.store';
import { getSystemKeyFromRootPath, getSystemRootPath, isSystemPath, normalizePath } from '@/utils/system.util';
import { DEFAULT_SYSTEM_KEY } from '@/config/system.constant';

const DEFAULT_SYSTEM_PATH = getSystemRootPath(DEFAULT_SYSTEM_KEY);

const isPortalPath = (pathname: string) => {
  const normalized = normalizePath(pathname);
  return normalized === '/' || normalized === '/admin';
};

const isAuthPath = (pathname: string) => {
  const normalized = normalizePath(pathname);
  return normalized === '/auth' || normalized.startsWith('/auth/');
};

export default function PortalApp() {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  const pathname = location.pathname;
  const portalPath = isPortalPath(pathname);
  const authPath = isAuthPath(pathname);
  const systemPath = isSystemPath(pathname);
  const systemRootKey = getSystemKeyFromRootPath(pathname);
  const invalidRootPath = !portalPath && !authPath && !systemPath;

  useEffect(() => {
    if (invalidRootPath) {
      window.location.replace('/');
      return;
    }

    if (!token) return;

    if (portalPath) {
      window.location.replace(DEFAULT_SYSTEM_PATH);
      return;
    }

    if (systemRootKey && pathname === `/${systemRootKey}`) {
      window.location.replace(getSystemRootPath(systemRootKey));
    }
  }, [token, portalPath, systemRootKey, pathname, invalidRootPath]);

  if (invalidRootPath || (token && (portalPath || systemRootKey))) {
    return null;
  }

  if (systemPath) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
