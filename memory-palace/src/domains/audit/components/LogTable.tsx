import { Card, Table, Badge } from '../../../shared/ui';
import { formatTime, shortId } from '../../../shared/utils';
import type { LogEntry } from '../types';

const levelTone = (l?: number): 'green' | 'red' | 'gray' =>
  l !== undefined && l >= 3 ? 'red' : l === 1 ? 'green' : 'gray';

export function LogTable({ logs }: { logs: LogEntry[] }) {
  return (
    <Card title="操作日志" icon="📜">
      <Table
        columns={[
          { key: 'id', title: 'ID', render: (l) => <span className="font-mono text-gray-400">{shortId(l.id ?? l.chain_id ?? '', 10)}</span> },
          { key: 'action', title: '动作', render: (l) => l.action ?? '—' },
          { key: 'agent', title: '分身', render: (l) => l.agent_id ?? '—' },
          { key: 'wallet', title: '钱包', render: (l) => (l.wallet ? `${l.wallet.slice(0, 8)}...` : '—') },
          { key: 'result', title: '结果', render: (l) => l.result ?? '—' },
          { key: 'level', title: '级别', render: (l) => <Badge tone={levelTone(l.level)}>{l.level ?? 0}</Badge> },
          { key: 'time', title: '时间', render: (l) => formatTime(l.created ?? (l.created_at ? Number(l.created_at) : undefined)) },
        ]}
        rows={logs}
        empty="暂无日志"
      />
    </Card>
  );
}
