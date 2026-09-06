import { StatCard } from '../../../shared/ui';
import type { MiningStatusResponse } from '../types';

export function MiningStats({ status }: { status: MiningStatusResponse }) {
  const { nodes, mining, top_miners } = status;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="网络节点" value={`${nodes.online}/${nodes.total}`} icon="🖥️" change="在线/总数" />
        <StatCard label="总算力" value={nodes.total_power.toFixed(1)} icon="⚡" />
        <StatCard label="已挖知识" value={mining.total_knowledge} icon="🧠" />
        <StatCard label="待处理对话" value={mining.pending_dialogs} icon="💬" />
      </div>
      {top_miners.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">🏆 算力排行</h3>
          <div className="space-y-2">
            {top_miners.map((m, i) => (
              <div key={m.wallet + i} className="flex items-center justify-between text-sm">
                <span className="text-white/80">{i + 1}. {m.wallet}</span>
                <span className="text-gray-400">算力 {m.power ?? m.mining_power ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
