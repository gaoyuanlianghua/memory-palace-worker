import { useState } from 'react';
import { debtApi } from '../api';

export function IssueForm({ wallet, onIssued }: { wallet: string; onIssued: () => void }) {
  const [amount, setAmount] = useState(10);
  const [reason, setReason] = useState('');
  const [rate, setRate] = useState(5);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const issue = async () => {
    if (!wallet || amount <= 0) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await debtApi.issue(wallet, amount, rate / 100);
      setMsg(`已发行债务 ${r.debt_id}，金额 ${amount} MC（用途：${reason || '未填写'}）`);
      onIssued();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">🏦 发行债务</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">金额（MC）</label>
            <input type="number" min={0.1} step={0.1} value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">年利率（%）</label>
            <input type="number" min={0} max={100} step={0.5} value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
        </div>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="用途（可选）"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        <button onClick={issue} disabled={!wallet || busy}
          className="w-full px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40">
          {busy ? '发行中...' : '发行'}
        </button>
        {!wallet && <p className="text-xs text-amber-400">需先注册钱包</p>}
        {msg && <p className="text-xs text-green-400">{msg}</p>}
      </div>
    </div>
  );
}
