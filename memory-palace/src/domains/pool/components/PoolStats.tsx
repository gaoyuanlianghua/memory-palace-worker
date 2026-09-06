import { StatCard } from '../../../shared/ui';
import type { PoolStatusResponse } from '../types';

export function PoolStats({ pool }: { pool: PoolStatusResponse['pool'] | null }) {
  const cards = [
    { label: '系统池余额', value: `${(pool?.balance ?? 0).toFixed(2)} MC`, icon: '🏦', change: '实时' },
    { label: '钱包总数', value: pool?.total_wallets ?? 0, icon: '👛' },
    { label: '节点总数', value: pool?.total_nodes ?? 0, icon: '🖥️' },
    { label: '活跃任务', value: pool?.active_tasks ?? 0, icon: '📋' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => <StatCard key={c.label} {...c} />)}
    </div>
  );
}
