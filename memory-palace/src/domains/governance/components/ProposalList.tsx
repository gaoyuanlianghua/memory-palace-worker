import { Table, type Column, Badge } from '../../../shared/ui';
import { formatTime } from '../../../shared/utils';
import { PROPOSAL_STATUS_LABEL, type Proposal } from '../types';
import { VotePanel } from './VotePanel';

export function ProposalList({ proposals, agentId, disabled, onChanged }: {
  proposals: Proposal[];
  agentId: string;
  disabled?: boolean;
  onChanged: () => void;
}) {
  const cols: Column<Proposal>[] = [
    { key: 'id', title: 'ID', render: (p) => <span className="text-gray-300">{p.proposal_id}</span> },
    { key: 'title', title: '提案', render: (p) => (
        <div>
          <p className="text-white/90">{p.title}</p>
          <p className="text-xs text-gray-500">{p.target_param} → {p.new_value}</p>
        </div>
      ) },
    { key: 'votes', title: '票数', render: (p) => (
        <span className="text-xs">
          <span className="text-green-400">👍 {p.votes_for ?? 0}</span>
          <span className="text-gray-600 mx-1">/</span>
          <span className="text-red-400">👎 {p.votes_against ?? 0}</span>
        </span>
      ) },
    { key: 'status', title: '状态', render: (p) => <Badge tone={p.status === 'active' ? 'yellow' : p.status === 'passed' ? 'blue' : 'green'}>{PROPOSAL_STATUS_LABEL[p.status] ?? p.status}</Badge> },
    { key: 'proposer', title: '发起人', render: (p) => <span className="text-gray-400">{p.proposer_agent}</span> },
    { key: 'deadline', title: '截止', render: (p) => formatTime(p.deadline) },
    { key: 'actions', title: '操作', render: (p) => (
        <VotePanel proposal={p} agentId={agentId} disabled={disabled} onVoted={onChanged} onExecuted={onChanged} />
      ) },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">🗳️ 提案列表（共 {proposals.length}）</h3>
      <Table columns={cols} rows={proposals} empty="暂无提案" />
    </div>
  );
}
