import { useState } from 'react';
import { SectionTitle, Spinner } from '../../../shared/ui';
import { useAgents } from '../hooks';
import { AgentList } from '../components/AgentList';
import { AgentDetail } from '../components/AgentDetail';
import { AgentForm } from '../components/AgentForm';
import type { AgentInfo } from '../types';

export function AgentPage() {
  const { agents, loading, load } = useAgents();
  const [selected, setSelected] = useState<AgentInfo | null>(null);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="分身管理"
        subtitle="分身绑定、状态监控"
        action={
          <button onClick={() => void load()} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500">
            ⟳ 刷新
          </button>
        }
      />
      {loading && agents.length === 0 ? (
        <Spinner text="加载分身列表..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentList agents={agents} onSelect={setSelected} />
          <div className="space-y-6">
            <AgentDetail agent={selected} />
            <AgentForm />
          </div>
        </div>
      )}
    </div>
  );
}
