import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAppStore } from './store/appStore';

export default function App() {
  // 启动时根据本地 API Key 探测管理员权限
  useEffect(() => {
    void useAppStore.getState().checkAdmin();
  }, []);

  return <RouterProvider router={router} />;
}
