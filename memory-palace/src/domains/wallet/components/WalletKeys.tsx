import { useEffect, useState } from 'react';
import { Card, Table, Badge } from '../../../shared/ui';
import { formatTime, maskWallet } from '../../../shared/utils';
import { walletApi } from '../api';
import type { WalletKeyInfo } from '../types';

export function WalletKeys() {
  const [keys, setKeys] = useState<WalletKeyInfo[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    walletApi.getKeys().then((r) => setKeys(r.wallets)).catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <Card title="钱包密钥列表" icon="🔑" action={<Badge tone="yellow">管理员</Badge>}>
      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <Table
          columns={[
            { key: 'wallet', title: '钱包', render: (k) => <span className="font-mono">{maskWallet(k.wallet)}</span> },
            { key: 'agent', title: '分身', render: (k) => k.agent_id },
            { key: 'balance', title: '余额', render: (k) => `${k.balance} MC` },
            { key: 'time', title: '注册时间', render: (k) => formatTime(k.registered_at) },
          ]}
          rows={keys}
          empty="暂无密钥数据"
        />
      )}
    </Card>
  );
}
