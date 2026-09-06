import type { PalaceStatusResponse } from '../types';

export function StatusGrid({ status }: { status: PalaceStatusResponse | null }) {
  const items = [
    { label: '系统状态', value: status?.status ?? '未知', icon: '🟢' },
    { label: '协议版本', value: status?.protocol ?? '—', icon: '📦' },
    { label: '网络模式', value: status?.network_mode ?? '—', icon: '🌐' },
    { label: '链名称', value: status?.chain_name ?? '—', icon: '⛓️' },
    { label: '节点数', value: status?.node_count ?? 0, icon: '🖥️' },
    { label: '活跃任务', value: status?.active_tasks ?? 0, icon: '📋' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((it) => (
        <div key={it.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
          <p className="text-2xl">{it.icon}</p>
          <p className="text-lg font-bold text-white mt-2">{it.value}</p>
          <p className="text-xs text-gray-400 mt-1">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
