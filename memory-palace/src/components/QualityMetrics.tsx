import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function QualityMetrics() {
  const [stats, setStats] = useState({
    total_wallets: 0,
    total_agents: 0,
    active_tasks: 0,
    system_pool: 0,
  });
  const [semantic, setSemantic] = useState({ concepts: 0, edges: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [systemData, semanticData] = await Promise.all([
          api.getQualityStats(),
          api.getPatterns(),
        ]);
        setStats({
          total_wallets: systemData?.stats?.total_wallets || 0,
          total_agents: systemData?.stats?.total_agents || 0,
          active_tasks: systemData?.stats?.active_tasks || 0,
          system_pool: systemData?.stats?.system_pool || 0,
        });
        setSemantic({
          concepts: semanticData?.concepts || 0,
          edges: semanticData?.edges || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>📈</span>
          系统统计
        </h2>
        <p className="text-sm text-gray-400 mt-1">系统运行指标</p>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="h-48 bg-gray-700 rounded-lg animate-pulse"></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.total_wallets}</div>
                <div className="text-xs text-gray-400">总钱包</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.total_agents}</div>
                <div className="text-xs text-gray-400">总代理</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.active_tasks}</div>
                <div className="text-xs text-gray-400">活跃任务</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.system_pool.toFixed(2)}</div>
                <div className="text-xs text-gray-400">系统池 MC</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">语义网络</h3>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">概念节点</span>
                  <span className="badge-info">{semantic.concepts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">关系边</span>
                  <span className="badge-success">{semantic.edges}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
