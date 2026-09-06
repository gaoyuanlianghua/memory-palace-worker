import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Spinner } from '../../shared/ui';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const isAdmin = useAppStore((s) => s.isAdmin);
  const adminChecked = useAppStore((s) => s.adminChecked);
  const checkingAdmin = useAppStore((s) => s.checkingAdmin);
  const checkAdmin = useAppStore((s) => s.checkAdmin);

  // 未完成探测则先触发一次（checkAdmin 内部幂等，避免重复探测）
  useEffect(() => {
    if (!adminChecked && !checkingAdmin) void checkAdmin();
  }, [adminChecked, checkingAdmin, checkAdmin]);

  if (!adminChecked) return <Spinner text="正在校验管理员权限..." />;
  if (!isAdmin) return <Navigate to="/dashboard" replace state={{ adminDenied: true }} />;
  return <>{children}</>;
}
