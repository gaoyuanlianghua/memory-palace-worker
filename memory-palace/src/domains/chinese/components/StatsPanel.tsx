import type { ChineseStats } from '../types';

export function StatsPanel({ stats }: { stats: ChineseStats }) {
  const items = [
    { label: '物理概念', value: stats.total_physics_concepts, icon: '⚛️' },
    { label: '拆解条目', value: stats.total_decomposition, icon: '🔬' },
    { label: '演化链', value: stats.total_evolution_chains, icon: '🌊' },
    { label: '五行元素', value: stats.five_elements, icon: '☯️' },
    { label: '分类数', value: stats.categories, icon: '🗂️' },
  ];
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 space-y-3">
      <h3 className="text-sm font-medium text-gray-300">📊 中华文化知识库</h3>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {items.map((it) => (
          <div key={it.label} className="bg-gray-900/60 rounded-lg p-3 text-center">
            <p className="text-xl">{it.icon}</p>
            <p className="text-lg font-bold text-white mt-1">{it.value}</p>
            <p className="text-xs text-gray-400">{it.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        版本 {stats.version} · 数据源 {stats.data_source} · 更新于{' '}
        {new Date(stats.timestamp * 1000).toLocaleDateString()}
      </p>
    </div>
  );
}
