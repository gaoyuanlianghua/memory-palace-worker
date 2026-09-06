import { useEffect, useState } from 'react';
import { SectionTitle, Spinner, Empty } from '../../../shared/ui';
import { useWalletStore } from '../../wallet/store';
import { useAgentStore } from '../../agent/store';
import { useDialogCache } from '../hooks';
import { CacheStats } from '../components/CacheStats';
import { OptimizeForm } from '../components/OptimizeForm';
import { FeedbackForm } from '../components/FeedbackForm';

export function DialogPage() {
  const wallet = useWalletStore((s) => s.info?.wallet ?? '');
  const agents = useAgentStore((s) => s.agents);
  const loadAgents = useAgentStore((s) => s.load);
  const [agentId, setAgentId] = useState('');
  const cache = useDialogCache(wallet);

  useEffect(() => { void loadAgents(); }, [loadAgents]);
  useEffect(() => {
    if (agents.length > 0 && !agentId) setAgentId(agents[0].agent_id);
  }, [agents, agentId]);

  if (!wallet) {
    return (
      <div className="space-y-6">
        <SectionTitle title="对话优化" subtitle="上下文准备 / 记录 / 反馈" />
        <Empty text="请先在钱包管理注册钱包" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="对话优化" subtitle="基于记忆与偏好的上下文准备" />
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">当前分身：</label>
        <select value={agentId} onChange={(e) => setAgentId(e.target.value)}
          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white">
          {agents.length === 0 && <option value="">暂无分身</option>}
          {agents.map((a) => <option key={a.agent_id} value={a.agent_id}>{a.agent_id}</option>)}
        </select>
      </div>

      {cache.loading && !cache.data ? <Spinner text="加载缓存统计..." /> : cache.data && <CacheStats cache={cache.data} />}
      <OptimizeForm wallet={wallet} agentId={agentId || undefined} />
      <FeedbackForm />
    </div>
  );
}
