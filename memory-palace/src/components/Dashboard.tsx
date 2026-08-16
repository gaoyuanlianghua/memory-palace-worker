import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface SystemStats {
  clones: number;
  tasks: number;
  memories: number;
  nodes: number;
  edges: number;
  hitRate: number;
  patterns: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<SystemStats>({
    clones: 0,
    tasks: 0,
    memories: 0,
    nodes: 0,
    edges: 0,
    hitRate: 0,
    patterns: 0,
  });
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statusData, clonesData, tasksData, memoryData, graphData, cacheData, patternsData] = await Promise.all([
          api.getStatus(),
          api.getClones(),
          api.getTasks(),
          api.getMemoryStats(),
          api.getGraphData(),
          api.getCacheStats(),
          api.getPatterns(),
        ]);

        setStatus(statusData);
        setStats({
          clones: clonesData.clones.length,
          tasks: tasksData.count,
          memories: memoryData.totalEntries,
          nodes: graphData.stats.totalNodes,
          edges: graphData.stats.totalEdges,
          hitRate: cacheData.cache.stats.hitRate,
          patterns: patternsData.patterns.patterns.length,
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard label="活跃分身" value={stats.clones} icon="🤖" color="blue" />
          <StatCard label="待执行任务" value={stats.tasks} icon="📋" color="purple" />
          <StatCard label="记忆总数" value={stats.memories} icon="🧠" color="green" />
          <StatCard label="图谱节点" value={stats.nodes} icon="🔵" color="cyan" />
          <StatCard label="图谱连接" value={stats.edges} icon="🔗" color="pink" />
          <StatCard label="缓存命中" value={`${stats.hitRate}%`} icon="⚡" color="yellow" />
          <StatCard label="识别模式" value={stats.patterns} icon="🔍" color="orange" />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'cyan' | 'pink' | 'yellow' | 'orange';
}

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  green: 'from-green-500/20 to-green-600/10 border-green-500/30',
  cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
  yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
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
