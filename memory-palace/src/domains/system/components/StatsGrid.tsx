import { StatCard } from '../../../shared/ui';
import type { NetworkStats } from '../types';

export function StatsGrid({ stats, poolBalance }: { stats: NetworkStats | null; poolBalance: number }) {
  const cards = [
    { label: '系统池余额', value: `${poolBalance.toFixed(2)} MC`, icon: '🏦', change: '实时' },
    { label: '活跃节点', value: stats?.total_nodes ?? 0, icon: '🖥️' },
    { label: '注册钱包', value: stats?.total_wallets ?? 0, icon: '👛' },
    { label: '活跃任务', value: stats?.active_tasks ?? 0, icon: '📋' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => <StatCard key={c.label} {...c} />)}
    </div>
  );
}
