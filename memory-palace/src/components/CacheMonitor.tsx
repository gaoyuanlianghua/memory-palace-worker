import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { CacheStats } from '../types';

export function CacheMonitor() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getCacheStats();
        setStats(data.cache.stats);
      } catch (error) {
        console.error('Failed to fetch cache stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const hitRate = stats?.hitRate || 0;
  const hitColor = hitRate >= 80 ? 'text-green-400' : hitRate >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>⚡</span>
          缓存监控
        </h2>
        <p className="text-sm text-gray-400 mt-1">缓存性能统计</p>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="h-48 bg-gray-700 rounded-lg animate-pulse"></div>
        ) : (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#374151"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={hitRate >= 80 ? '#22c55e' : hitRate >= 60 ? '#eab308' : '#ef4444'}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(hitRate / 100) * 352} 352`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold ${hitColor}`}>{hitRate}%</span>
                  <span className="text-xs text-gray-400">命中率</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-green-400">{stats?.hits || 0}</div>
                <div className="text-xs text-gray-400">命中次数</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-red-400">{stats?.misses || 0}</div>
                <div className="text-xs text-gray-400">未命中</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-blue-400">{stats?.totalCaches || 0}</div>
                <div className="text-xs text-gray-400">缓存数</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-purple-400">{stats?.size || '0'}</div>
                <div className="text-xs text-gray-400">缓存大小</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
