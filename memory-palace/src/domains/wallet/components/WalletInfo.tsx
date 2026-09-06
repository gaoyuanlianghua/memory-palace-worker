import { Card } from '../../../shared/ui';
import { maskWallet } from '../../../shared/utils';
import type { WalletInfoResponse } from '../types';

export function WalletInfo({ info }: { info: WalletInfoResponse | null }) {
  const rows = [
    { label: '钱包地址', value: info?.wallet ? maskWallet(info.wallet) : '—' },
    { label: '余额', value: info?.balance !== undefined ? `${info.balance} MC` : '—' },
    { label: '关联分身', value: info?.agent_id ? info.agent_id : '—' },
    { label: '注册状态', value: info?.registered ? '已注册' : '未注册' },
  ];
  return (
    <Card title="当前钱包信息" icon="💼">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-400">{r.label}</span>
            <span className="text-white font-mono">{r.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
