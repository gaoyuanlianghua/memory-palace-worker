import { Card, Table } from '../../../shared/ui';
import { formatTime, shortId } from '../../../shared/utils';
import type { PalaceBlock } from '../types';

export function BlockList({ blocks }: { blocks: PalaceBlock[] }) {
  return (
    <Card title="最近区块" icon="⛓️">
      <Table
        columns={[
          { key: 'id', title: '区块 ID', render: (b) => <span className="font-mono text-blue-300">{shortId(b.id)}</span> },
          { key: 'height', title: '高度', render: (b) => b.height ?? '—' },
          { key: 'tx', title: '交易数', render: (b) => b.tx_count ?? '—' },
          { key: 'time', title: '时间', render: (b) => formatTime(b.created) },
        ]}
        rows={blocks}
        empty="暂无区块数据"
      />
    </Card>
  );
}
