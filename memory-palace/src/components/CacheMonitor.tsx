import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function CacheMonitor() {
  const [stats, setStats] = useState({
    balance: 0,
    total_wallets: 0,
    total_agents: 0,
    active_tasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getCacheStats();
        setStats({
          balance: data?.pool?.balance || 0,
          total_wallets: data?.pool?.total_wallets || 0,
          total_agents: data?.pool?.total_agents || 0,
          active_tasks: data?.pool?.active_tasks || 0,
        });
      } catch (error) {
        console.error('Failed to fetch pool stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🏦</span>
          系统池状态
        </h2>
        <p className="text-sm text-gray-400 mt-1">经济池监控</p>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="h-48 bg-gray-700 rounded-lg animate-pulse"></div>
        ) : (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">{stats.balance.toFixed(4)}</div>
                <div className="text-sm text-gray-400">MC 系统池</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-blue-400">{stats.total_wallets}</div>
                <div className="text-xs text-gray-400">钱包数</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-purple-400">{stats.total_agents}</div>
                <div className="text-xs text-gray-400">代理数</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-green-400">{stats.active_tasks}</div>
                <div className="text-xs text-gray-400">活跃任务</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
