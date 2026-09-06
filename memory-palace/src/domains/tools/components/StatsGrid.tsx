import type { ToolStats } from '../types';

export function StatsGrid({ stats }: { stats: ToolStats }) {
  const items = [
    { label: '总调用', value: stats.total_calls ?? 0, icon: '🔢' },
    { label: '成功率', value: `${((stats.success_rate ?? 0) * 100).toFixed(0)}%`, icon: '🎯' },
    { label: '活跃工具', value: stats.active_tools ?? 0, icon: '🛠️' },
    { label: '平均耗时', value: `${(stats.avg_duration_ms ?? 0).toFixed(0)}ms`, icon: '⏱️' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <div key={it.label} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-2xl">{it.icon}</p>
          <p className="text-2xl font-bold text-white mt-3">{it.value}</p>
          <p className="text-sm text-gray-400 mt-1">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
