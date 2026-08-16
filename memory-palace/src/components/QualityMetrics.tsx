import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { QualityStats, Pattern } from '../types';

export function QualityMetrics() {
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qualityData, patternsData] = await Promise.all([
          api.getQualityStats(),
          api.getPatterns(),
        ]);
        setStats(qualityData);
        setPatterns(patternsData.patterns.patterns);
      } catch (error) {
        console.error('Failed to fetch quality data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const avgQuality = stats?.averageQuality || 0;
  const qualityColor = avgQuality >= 70 ? 'text-green-400' : avgQuality >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>📈</span>
          质量指标
        </h2>
        <p className="text-sm text-gray-400 mt-1">内容质量与模式识别</p>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="h-48 bg-gray-700 rounded-lg animate-pulse"></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className={`text-2xl font-bold ${qualityColor}`}>{avgQuality}</div>
                <div className="text-xs text-gray-400">平均质量</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{stats?.highQualityCount || 0}</div>
                <div className="text-xs text-gray-400">高质量</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{stats?.verifiedCount || 0}</div>
                <div className="text-xs text-gray-400">已验证</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{stats?.totalAnalyzed || 0}</div>
                <div className="text-xs text-gray-400">总分析数</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">识别模式</h3>
              {patterns.map((pattern) => (
                <div key={pattern.id} className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{pattern.name}</span>
                    <span className="badge-info">{pattern.count}个</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        style={{ width: `${pattern.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{(pattern.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
