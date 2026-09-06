import { Card, Badge } from '../../../shared/ui';
import { fmtMoney, maskWallet } from '../../../shared/utils';
import type { AgentInfo } from '../types';

const statusTone = (s: string): 'green' | 'red' | 'gray' =>
  s === 'active' || s === 'online' ? 'green' : s === 'inactive' || s === 'offline' ? 'red' : 'gray';

export function AgentList({ agents, onSelect }: { agents: AgentInfo[]; onSelect: (a: AgentInfo) => void }) {
  return (
    <Card title="分身列表" icon="🤖">
      <div className="divide-y divide-gray-700/60">
        {agents.length === 0 && <p className="text-sm text-gray-500 text-center py-8">暂无分身数据</p>}
        {agents.map((a) => (
          <div
            key={a.agent_id}
            onClick={() => onSelect(a)}
            className="flex items-center justify-between p-3 hover:bg-gray-700/50 cursor-pointer"
          >
            <div>
              <p className="text-white text-sm font-mono">{a.agent_id}</p>
              <p className="text-xs text-gray-500 font-mono">{maskWallet(a.wallet)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={statusTone(a.status)}>{a.status}</Badge>
              <span className="text-xs text-gray-400">{fmtMoney(a.balance)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
