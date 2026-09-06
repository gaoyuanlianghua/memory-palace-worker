import { useState } from 'react';
import { Card } from '../../../shared/ui';
import { poolApi } from '../api';

type ActionType = 'airdrop' | 'decay' | 'expand';

export function AdminActions({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<ActionType>('airdrop');
  const [wallet, setWallet] = useState('');
  const [value, setValue] = useState('10');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.trim() || !Number.isFinite(Number(value))) {
      setMessage('钱包与数值不能为空且数值需有效');
      return;
    }
    try {
      if (type === 'airdrop') await poolApi.airdrop(wallet.trim(), Number(value), reason.trim() || '手动空投');
      else if (type === 'decay') await poolApi.decay(wallet.trim(), Number(value), reason.trim() || '手动衰减');
      else await poolApi.expand(wallet.trim(), Number(value));
      setMessage('操作成功');
      setWallet('');
      onDone();
    } catch (err) {
      setMessage(`操作失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <Card title="经济调控（管理员）" icon="⚙️" action={<span className="text-xs text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded-full">管理员</span>}>
      <form onSubmit={submit} className="space-y-3">
        <div className="flex gap-2">
          {(['airdrop', 'decay', 'expand'] as ActionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                type === t ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t === 'airdrop' ? '空投' : t === 'decay' ? '衰减' : '扩容'}
            </button>
          ))}
        </div>
        <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="目标钱包地址"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500" />
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'decay' ? '衰减百分比' : '金额 (MC)'}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500" />
        {type !== 'expand' && (
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="原因（可选）"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500" />
        )}
        <button type="submit" className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 text-sm font-medium">
          执行
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-gray-400">{message}</p>}
    </Card>
  );
}
