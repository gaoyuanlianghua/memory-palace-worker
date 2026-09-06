import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const isAdmin = useAppStore((s) => s.isAdmin);
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
