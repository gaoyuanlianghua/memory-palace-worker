import { useEffect, useState } from 'react';
import { SectionTitle, Spinner, Empty } from '../../../shared/ui';
import { useWalletStore } from '../../wallet/store';
import { useAgentStore } from '../../agent/store';
import { useLibrary, usePreference, useToolStats, useAgentTools } from '../hooks';
import { LibraryList } from '../components/LibraryList';
import { PreferenceTable } from '../components/PreferenceTable';
import { StatsGrid } from '../components/StatsGrid';

export function ToolsPage() {
  const wallet = useWalletStore((s) => s.info?.wallet ?? '');
  const agents = useAgentStore((s) => s.agents);
  const loadAgents = useAgentStore((s) => s.load);
  const [agentId, setAgentId] = useState('');
  const library = useLibrary(wallet);
  const preference = usePreference(wallet);
  const stats = useToolStats(wallet);
  const agentTools = useAgentTools(wallet, agentId);

  useEffect(() => { void loadAgents(); }, [loadAgents]);
  useEffect(() => {
    if (agents.length > 0 && !agentId) setAgentId(agents[0].agent_id);
  }, [agents, agentId]);

  if (!wallet) {
    return (
      <div className="space-y-6">
        <SectionTitle title="工具中心" subtitle="工具库 / 偏好 / 统计" />
        <Empty text="请先在钱包管理注册钱包" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="工具中心" subtitle="工具库、偏好度与调用统计" />

      {stats.loading && !stats.data ? <Spinner text="加载统计..." /> : stats.data && <StatsGrid stats={stats.data} />}

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">当前分身：</label>
        <select value={agentId} onChange={(e) => setAgentId(e.target.value)}
          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white">
          {agents.length === 0 && <option value="">暂无分身</option>}
          {agents.map((a) => <option key={a.agent_id} value={a.agent_id}>{a.agent_id}</option>)}
        </select>
        {agentTools.data && (
          <span className="text-xs text-gray-500">已授权 {agentTools.data.count} 个工具：{agentTools.data.tools.join('、')}</span>
        )}
      </div>

      {library.data && <LibraryList tools={library.data.tools} />}
      {preference.data && <PreferenceTable preferences={preference.data.preferences} />}
    </div>
  );
}
