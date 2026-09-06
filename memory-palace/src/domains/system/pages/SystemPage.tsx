import { SectionTitle } from '../../../shared/ui';
import { useSystemStats } from '../hooks';
import { StatsGrid } from '../components/StatsGrid';

export function SystemPage() {
  const { data: stats } = useSystemStats();

  return (
    <div className="space-y-6">
      <SectionTitle title="系统统计" subtitle="记忆宫殿分身系统实时监控" />
      <StatsGrid stats={stats?.network_stats ?? null} poolBalance={stats?.network_stats?.system_pool ?? 0} />
    </div>
  );
}
