import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { MemoryStats } from '../types';

export function MemorySystem() {
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getMemoryStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch memory stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const typeLabels: Record<string, string> = {
    knowledge: '知识',
    code_pattern: '代码模式',
    security: '安全',
    ui_component: 'UI组件',
    structure: '结构',
    tech_news: '技术新闻',
    visualization: '可视化',
    dashboard: '仪表盘',
    full: '完整内容',
    timeline: '时间线',
    '3d_graph': '3D图谱',
    'api-doc': 'API文档',
    'api-test': 'API测试',
    auth: '认证',
    login: '登录',
    market: '市场',
    nodes: '节点',
    register: '注册',
    rewards: '奖励',
    scheduled: '计划',
    trades: '交易',
    wallet: '钱包',
    workflow: '工作流',
    page: '页面',
  };

  const sortedTypes = stats?.typeDistribution
    .filter((t) => t.type !== null)
    .sort((a, b) => b.count - a.count) || [];

  const maxCount = sortedTypes[0]?.count || 1;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🧠</span>
          记忆系统
        </h2>
        <p className="text-sm text-gray-400 mt-1">记忆统计与类型分布</p>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="h-64 bg-gray-700 rounded-lg animate-pulse"></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="stat-card bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold">{stats?.totalEntries || 0}</div>
                <div className="text-sm text-gray-400">总记忆数</div>
              </div>
              <div className="stat-card bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30">
                <div className="text-3xl mb-2">🏷️</div>
                <div className="text-2xl font-bold">{sortedTypes.length}</div>
                <div className="text-sm text-gray-400">记忆类型</div>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedTypes.slice(0, 10).map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-400 truncate">
                    {typeLabels[item.type || ''] || item.type}
                  </span>
                  <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-gray-300 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
