import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAppStore } from './store/appStore';
import { ensureProbed } from '../shared/api/http';

export default function App() {
  // 启动时探测多 API 端点（就近选择 + 故障切换）；无配置时无副作用
  useEffect(() => {
    void ensureProbed();
    void useAppStore.getState().checkAdmin();
  }, []);

  return <RouterProvider router={router} />;
}
