import { Table, type Column, Badge } from '../../../shared/ui';
import { formatTime } from '../../../shared/utils';
import type { Debt } from '../types';

export function DebtTable({ debts, wallet, onRepay }: {
  debts: Debt[];
  wallet: string;
  onRepay: (debt: Debt) => void;
}) {
  const cols: Column<Debt>[] = [
    { key: 'id', title: 'ID', render: (d) => <span className="text-gray-300">{d.debt_id}</span> },
    { key: 'issuer', title: '发行方', render: (d) => d.issuer },
    { key: 'amount', title: '金额', render: (d) => `${d.amount} MC` },
    { key: 'rate', title: '利率', render: (d) => `${(d.interest_rate * 100).toFixed(1)}%` },
    { key: 'status', title: '状态', render: (d) => (d.status === 'active' ? <Badge tone="yellow">active</Badge> : <Badge tone="green">paid</Badge>) },
    { key: 'issued', title: '发行时间', render: (d) => formatTime(d.issued_at) },
    { key: 'due', title: '到期', render: (d) => formatTime(d.due_at) },
    { key: 'actions', title: '操作', render: (d) => (
        <button onClick={() => onRepay(d)} disabled={!wallet || d.status !== 'active'}
          className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30 disabled:opacity-30">
          偿还
        </button>
      ) },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">💳 债务列表（共 {debts.length}）</h3>
      <Table columns={cols} rows={debts} empty="暂无债务" />
    </div>
  );
}
