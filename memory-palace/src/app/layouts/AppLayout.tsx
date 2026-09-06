import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { ApiKeyModal } from '../../features/api-key';
import { APP_VERSION } from '../../shared/utils/constants';

const navItems = [
  { to: '/dashboard', label: '仪表盘', icon: '📊' },
  { to: '/wallet', label: '钱包管理', icon: '👛' },
  { to: '/agents', label: '分身管理', icon: '🤖' },
  { to: '/tasks', label: '任务管理', icon: '📋' },
  { to: '/memory', label: '记忆系统', icon: '🧠' },
  { to: '/graph', label: '知识图谱', icon: '🔮' },
  { to: '/pool', label: '系统池', icon: '🏦' },
  { to: '/system', label: '系统统计', icon: '📈' },
  { to: '/audit', label: '操作日志', icon: '📜' },
  { to: '/mining', label: '挖矿', icon: '⛏️' },
  { to: '/broadcast', label: '广播', icon: '📢' },
  { to: '/workflow', label: '工作流', icon: '🔀' },
  { to: '/debt', label: '债务', icon: '💳' },
  { to: '/governance', label: '治理', icon: '🏛️' },
  { to: '/heatmap', label: '热度图谱', icon: '🌡️' },
  { to: '/dialog', label: '对话优化', icon: '💬' },
  { to: '/tools', label: '工具中心', icon: '🧰' },
  { to: '/chinese', label: '中华文化', icon: '🀄' },
];

export function AppLayout() {
  const [showKey, setShowKey] = useState(false);
  const keyText = useAppStore((s) => s.keyText);
  const location = useLocation();
  const [bannerVisible, setBannerVisible] = useState(true);
  const adminDenied = location.state?.adminDenied === true;

  // 每次导航后重置横幅可见性
  useEffect(() => {
    setBannerVisible(true);
  }, [location.key]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏛️</div>
              <div>
                <h1 className="text-xl font-bold text-gradient">记忆宫殿</h1>
                <p className="text-xs text-gray-400">Memory Palace - 分身协作系统</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowKey(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
                title="点击配置 API Key"
              >
                <span>🔑</span>
                <span>{keyText}</span>
              </button>
              <span className="badge bg-green-500/20 text-green-300 border border-green-500/30">在线</span>
              <span className="text-sm text-gray-400">{APP_VERSION}</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-gray-800/50 border-b border-gray-700 sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {adminDenied && bannerVisible && (
        <div className="bg-amber-500/10 border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-300">
              ⛔ 当前 API Key 无管理员权限，已返回仪表盘。请在右上角配置具有管理员权限的 API Key。
            </p>
            <button
              onClick={() => setBannerVisible(false)}
              className="text-amber-300/70 hover:text-amber-200 text-sm shrink-0"
              aria-label="关闭提示"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>记忆宫殿分身系统 © 2026 - 多分身协作平台</p>
          <p className="text-xs mt-1">Powered by Cloudflare Worker + D1 Database</p>
        </div>
      </footer>

      <ApiKeyModal open={showKey} onClose={() => setShowKey(false)} />
    </div>
  );
}
