import { SectionTitle } from '../../../shared/ui';
import { useSystemStats, useSystemPool } from '../hooks';
import { StatsGrid } from '../components/StatsGrid';

export function SystemPage() {
  const { data: stats } = useSystemStats();
  const { data: pool } = useSystemPool();

  return (
    <div className="space-y-6">
      <SectionTitle title="系统统计" subtitle="记忆宫殿分身系统实时监控" />
      <StatsGrid stats={stats?.network_stats ?? null} poolBalance={pool?.pool.balance ?? 0} />
    </div>
  );
}
