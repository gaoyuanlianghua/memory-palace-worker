import { useEffect, useState } from 'react';
import { SectionTitle, Spinner } from '../../../shared/ui';
import { useAgentStore } from '../../agent/store';
import { useBugs, useProposals } from '../hooks';
import { BugList } from '../components/BugList';
import { BugReportForm } from '../components/BugReportForm';
import { ProposalList } from '../components/ProposalList';
import { ProposalForm } from '../components/ProposalForm';
import { governanceApi } from '../api';

type Tab = 'bugs' | 'proposals';

export function GovernancePage() {
  const [tab, setTab] = useState<Tab>('bugs');
  const agents = useAgentStore((s) => s.agents);
  const loadAgents = useAgentStore((s) => s.load);
  const [agentId, setAgentId] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const { bugs, loading: bugsLoading, refresh: refreshBugs } = useBugs();
  const { proposals, loading: propsLoading, refresh: refreshProposals } = useProposals();

  useEffect(() => { void loadAgents(); }, [loadAgents]);
  useEffect(() => {
    if (agents.length > 0 && !agentId) setAgentId(agents[0].agent_id);
  }, [agents, agentId]);

  const wallet = agents.find((a) => a.agent_id === agentId)?.wallet ?? '';

  const confirmBug = async (bug_id: string) => {
    setMsg(null);
    try {
      await governanceApi.confirmBug(bug_id, agentId);
      setMsg(`已确认 Bug ${bug_id}`);
      refreshBugs();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  const fixBug = async (bug_id: string) => {
    setMsg(null);
    try {
      await governanceApi.fixBug(bug_id, agentId, wallet);
      setMsg(`已修复 Bug ${bug_id}`);
      refreshBugs();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="治理中心" subtitle="Bug 上报修复与参数提案投票" />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
          {(['bugs', 'proposals'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-gray-400 hover:text-white'
              }`}>
              {t === 'bugs' ? '🐞 Bug' : '🗳️ 提案'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">当前分身：</label>
          <select value={agentId} onChange={(e) => setAgentId(e.target.value)}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white">
            {agents.length === 0 && <option value="">暂无分身</option>}
            {agents.map((a) => <option key={a.agent_id} value={a.agent_id}>{a.agent_id}</option>)}
          </select>
        </div>
      </div>

      {msg && <p className={`text-xs ${msg.includes('已') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}

      {tab === 'bugs' ? (
        <div className="space-y-6">
          {bugsLoading && bugs.length === 0 ? <Spinner text="加载 Bug 列表..." /> : (
            <BugList bugs={bugs} agentId={agentId} wallet={wallet}
              onConfirm={(b) => void confirmBug(b.bug_id)}
              onFix={(b) => void fixBug(b.bug_id)} />
          )}
          <BugReportForm agentId={agentId} onReported={refreshBugs} />
        </div>
      ) : (
        <div className="space-y-6">
          {propsLoading && proposals.length === 0 ? <Spinner text="加载提案列表..." /> : (
            <ProposalList proposals={proposals} agentId={agentId} onChanged={refreshProposals} />
          )}
          <ProposalForm agentId={agentId} onCreated={refreshProposals} />
        </div>
      )}
    </div>
  );
}
