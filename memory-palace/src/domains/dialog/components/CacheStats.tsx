import type { DialogCache } from '../types';

export function CacheStats({ cache }: { cache: DialogCache }) {
  const items = [
    { label: '总上下文', value: cache.total, icon: '🗂️' },
    { label: '活跃', value: cache.active, icon: '✅', tone: 'text-green-400' },
    { label: '已过期', value: cache.expired, icon: '⏳', tone: 'text-yellow-400' },
    { label: '占用空间', value: cache.total_usage, icon: '💾' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <div key={it.label} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-2xl">{it.icon}</p>
          <p className={`text-2xl font-bold mt-3 ${it.tone ?? 'text-white'}`}>{it.value}</p>
          <p className="text-sm text-gray-400 mt-1">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
