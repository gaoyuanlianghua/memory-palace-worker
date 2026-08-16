import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface SystemStats {
  total_wallets: number;
  total_agents: number;
  active_tasks: number;
  system_pool: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<SystemStats>({
    total_wallets: 0,
    total_agents: 0,
    active_tasks: 0,
    system_pool: 0,
  });
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statusData, poolData, systemData] = await Promise.all([
          api.getStatus(),
          api.getCacheStats(),
          api.getQualityStats(),
        ]);

        setStatus(statusData);
        setStats({
          total_wallets: poolData?.pool?.total_wallets || systemData?.stats?.total_wallets || 0,
          total_agents: poolData?.pool?.total_agents || systemData?.stats?.total_agents || 0,
          active_tasks: poolData?.pool?.active_tasks || systemData?.stats?.active_tasks || 0,
          system_pool: systemData?.stats?.system_pool || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="card-body">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card glow">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gradient">系统状态</h2>
          <p className="text-sm text-gray-400 mt-1">实时监控面板</p>
        </div>
        {status && (
          <div className="text-right">
            <p className="text-sm text-gray-400">版本 {status.version}</p>
            <p className="text-xs text-gray-500">{status.date}</p>
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="总钱包数" value={stats.total_wallets} icon="💰" color="blue" />
          <StatCard label="总代理数" value={stats.total_agents} icon="🤖" color="purple" />
          <StatCard label="活跃任务" value={stats.active_tasks} icon="📋" color="green" />
          <StatCard label="系统池" value={`${stats.system_pool.toFixed(4)} MC`} icon="🏦" color="yellow" />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'yellow';
}

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  green: 'from-green-500/20 to-green-600/10 border-green-500/30',
  yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
};

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`stat-card bg-gradient-to-br ${colorClasses[color]} border`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
}
