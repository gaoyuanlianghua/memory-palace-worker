import { Table, type Column, Badge } from '../../../shared/ui';
import { formatTime } from '../../../shared/utils';
import { BUG_STATUS_LABEL, type Bug } from '../types';

const SEVERITY_TONE: Record<string, 'red' | 'yellow' | 'blue' | 'gray'> = {
  critical: 'red',
  high: 'red',
  medium: 'yellow',
  low: 'blue',
};

export function BugList({ bugs, agentId, wallet, onConfirm, onFix, disabled }: {
  bugs: Bug[];
  agentId: string;
  wallet: string;
  onConfirm: (bug: Bug) => void;
  onFix: (bug: Bug) => void;
  disabled?: boolean;
}) {
  const cols: Column<Bug>[] = [
    { key: 'id', title: 'ID', render: (b) => <span className="text-gray-300">{b.bug_id}</span> },
    { key: 'room', title: '房间', render: (b) => b.room },
    { key: 'type', title: '类型', render: (b) => b.bug_type },
    { key: 'severity', title: '严重度', render: (b) => <Badge tone={SEVERITY_TONE[b.severity] ?? 'gray'}>{b.severity}</Badge> },
    { key: 'reward', title: '赏金', render: (b) => `${b.reward} MC` },
    { key: 'status', title: '状态', render: (b) => <Badge tone={b.status === 'fixed' ? 'green' : b.status === 'confirmed' ? 'yellow' : 'gray'}>{BUG_STATUS_LABEL[b.status] ?? b.status}</Badge> },
    { key: 'reporter', title: '上报者', render: (b) => <span className="text-gray-400">{b.reporter_agent}</span> },
    { key: 'created', title: '时间', render: (b) => formatTime(b.created) },
    { key: 'actions', title: '操作', render: (b) => (
        <div className="flex gap-2">
          {b.status === 'open' && (
            <button onClick={() => onConfirm(b)} disabled={disabled || !agentId}
              className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 disabled:opacity-30">
              确认
            </button>
          )}
          {b.status === 'confirmed' && (
            <button onClick={() => onFix(b)} disabled={disabled || !agentId || !wallet}
              className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30 disabled:opacity-30">
              修复
            </button>
          )}
        </div>
      ) },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">🐞 Bug 列表（共 {bugs.length}）</h3>
      <Table columns={cols} rows={bugs} empty="暂无 Bug" />
    </div>
  );
}
