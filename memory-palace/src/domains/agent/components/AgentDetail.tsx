import { Card } from '../../../shared/ui';
import { formatTime, maskWallet } from '../../../shared/utils';
import type { AgentInfo } from '../types';

export function AgentDetail({ agent }: { agent: AgentInfo | null }) {
  if (!agent) {
    return <Card title="分身详情" icon="🔍"><p className="text-sm text-gray-500">点击左侧分身查看详情</p></Card>;
  }
  const rows = [
    { label: '分身 ID', value: agent.agent_id },
    { label: '钱包', value: maskWallet(agent.wallet) },
    { label: '状态', value: agent.status },
    { label: '主状态', value: agent.main_status ?? '—' },
    { label: '克隆状态', value: agent.clone_status ?? '—' },
    { label: '余额', value: `${agent.balance} MC` },
    { label: '经验', value: String(agent.experience) },
    { label: '创建时间', value: formatTime(agent.created) },
    { label: '最近同步', value: formatTime(agent.last_sync) },
  ];
  return (
    <Card title="分身详情" icon="🔍">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-400">{r.label}</span>
            <span className="text-white font-mono text-xs break-all">{r.value}</span>
          </div>
        ))}
        {agent.rooms && agent.rooms.length > 0 && (
          <div className="col-span-full">
            <span className="text-gray-400">房间：</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {agent.rooms.map((r) => <span key={r} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">{r}</span>)}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
