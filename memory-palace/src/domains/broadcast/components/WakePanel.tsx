import { useState } from 'react';
import { broadcastApi } from '../api';

export function WakePanel({ wallet, onDone }: { wallet: string; onDone: () => void }) {
  const [taskType, setTaskType] = useState('collect');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const wake = async () => {
    if (!wallet) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await broadcastApi.wake(wallet, { task_type: taskType });
      setMsg(`唤醒完成，通知 ${r.recipients_count ?? 0} 个活跃节点`);
      onDone();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">📣 立即唤醒广播</h3>
      <div className="flex gap-3 items-end">
        <div>
          <label className="block text-sm text-gray-400 mb-1">任务类型</label>
          <select value={taskType} onChange={(e) => setTaskType(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white">
            <option value="collect">collect</option>
            <option value="sync">sync</option>
            <option value="dialog">dialog</option>
          </select>
        </div>
        <button onClick={wake} disabled={!wallet || busy}
          className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-500 disabled:opacity-40">
          {busy ? '唤醒中...' : '唤醒'}
        </button>
      </div>
      {msg && <p className="text-xs mt-2 text-green-400">{msg}</p>}
    </div>
  );
}
