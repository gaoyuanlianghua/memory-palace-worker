import { useState } from 'react';
import { SectionTitle, Spinner, Empty } from '../../../shared/ui';
import {
  useChineseStats, useElementsCycle, useFiveElements, useSolarTerms,
  useStemsBranches, useIdioms,
} from '../hooks';
import { StatsPanel } from '../components/StatsPanel';
import { FiveElements } from '../components/FiveElements';
import { ElementsCycle } from '../components/ElementsCycle';
import { SolarTermsTimeline } from '../components/SolarTermsTimeline';
import { StemsBranches } from '../components/StemsBranches';
import { IdiomsPanel } from '../components/IdiomsPanel';

type Tab = 'overview' | 'solar' | 'stems' | 'idioms' | 'cycle';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'overview', label: '概览', icon: '📊' },
  { key: 'solar', label: '节气', icon: '🌗' },
  { key: 'stems', label: '干支', icon: '🌿' },
  { key: 'idioms', label: '成语', icon: '📖' },
  { key: 'cycle', label: '五行环', icon: '☯️' },
];

export function ChinesePage() {
  const [tab, setTab] = useState<Tab>('overview');
  const stats = useChineseStats();
  const cycle = useElementsCycle();
  const elements = useFiveElements();
  const solar = useSolarTerms();
  const stems = useStemsBranches();
  const idioms = useIdioms();

  return (
    <div className="space-y-6">
      <SectionTitle title="中华文化" subtitle="五行 / 节气 / 干支 / 成语 可视化知识库" />

      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700 w-fit">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-gray-400 hover:text-white'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {stats.loading && !stats.data ? <Spinner text="加载知识库统计..." /> : stats.data && <StatsPanel stats={stats.data} />}
          {elements.data && <FiveElements elements={elements.data.elements} />}
        </div>
      )}
      {tab === 'solar' && (
        solar.loading && !solar.data ? <Spinner text="加载节气..." /> :
        solar.error ? <Empty text={solar.error} /> :
        solar.data && <SolarTermsTimeline data={solar.data} />
      )}
      {tab === 'stems' && (
        stems.loading && !stems.data ? <Spinner text="加载干支..." /> :
        stems.error ? <Empty text={stems.error} /> :
        stems.data && <StemsBranches data={stems.data} />
      )}
      {tab === 'idioms' && (
        idioms.loading && !idioms.data ? <Spinner text="加载成语..." /> :
        idioms.error ? <Empty text={idioms.error} /> :
        idioms.data && (
          <IdiomsPanel count={idioms.data.count} idioms={idioms.data.idioms} />
        )
      )}
      {tab === 'cycle' && (
        cycle.loading && !cycle.data ? <Spinner text="加载五行环..." /> :
        cycle.error ? <Empty text={cycle.error} /> :
        cycle.data && <ElementsCycle cycle={cycle.data.cycle} />
      )}
    </div>
  );
}
