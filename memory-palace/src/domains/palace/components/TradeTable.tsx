import { Card, Table } from '../../../shared/ui';
import { formatTime, maskWallet } from '../../../shared/utils';
import type { PalaceTrade } from '../types';

export function TradeTable({ trades }: { trades: PalaceTrade[] }) {
  return (
    <Card title="最近交易" icon="💱">
      <Table
        columns={[
          { key: 'id', title: '交易 ID', render: (t) => <span className="font-mono text-purple-300">{t.id}</span> },
          { key: 'wallet', title: '钱包', render: (t) => (t.wallet ? maskWallet(t.wallet) : '—') },
          { key: 'type', title: '类型', render: (t) => t.type ?? '—' },
          { key: 'amount', title: '金额', render: (t) => (t.amount !== undefined ? `${t.amount}` : '—') },
          { key: 'time', title: '时间', render: (t) => formatTime(t.created) },
        ]}
        rows={trades}
        empty="暂无交易数据"
      />
    </Card>
  );
}
