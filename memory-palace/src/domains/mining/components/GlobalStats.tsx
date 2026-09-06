import { StatCard, Table, type Column } from '../../../shared/ui';
import { formatTime, maskWallet } from '../../../shared/utils';
import type { MiningBackgroundResponse, SyncRecord } from '../types';

const syncCols: Column<SyncRecord>[] = [
  { key: 'wallet', title: '钱包', render: (r) => maskWallet(r.wallet) },
  { key: 'power', title: '算力', render: (r) => r.mining_power.toFixed(1) },
  { key: 'blocks', title: '出块', render: (r) => r.blocks_found ?? 0 },
  { key: 'hash', title: '哈希率', render: (r) => r.hash_rate ?? 0 },
  { key: 'time', title: '时间', render: (r) => formatTime(r.created) },
];

export function GlobalStats({ data }: { data: MiningBackgroundResponse }) {
  const g = data.global_stats;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="总节点" value={g.total_nodes} icon="🖥️" />
        <StatCard label="在线节点" value={g.online_nodes} icon="✅" />
        <StatCard label="全网算力" value={g.total_mining_power.toFixed(1)} icon="⚡" />
        <StatCard label="累计出块" value={g.total_blocks_found} icon="⛏️" />
        <StatCard label="平均哈希率" value={g.avg_hash_rate.toFixed(1)} icon="📈" />
      </div>
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">🕐 最近同步记录</h3>
        <Table columns={syncCols} rows={data.recent_syncs} empty="暂无同步记录" />
      </div>
    </div>
  );
}
