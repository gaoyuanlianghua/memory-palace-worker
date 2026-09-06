import { useState } from 'react';
import { broadcastApi } from '../api';

export function ScheduleForm({ wallet, onCreated }: { wallet: string; onCreated: () => void }) {
  const [interval, setInterval] = useState(300);
  const [taskType, setTaskType] = useState('collect');
  const [radius, setRadius] = useState(10);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!wallet) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await broadcastApi.create(wallet, { interval_seconds: interval, task_type: taskType, radius });
      setMsg(`已创建调度 ${r.id}（下次运行 ${new Date(r.next_run ?? 0).toLocaleString()}）`);
      onCreated();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">📡 新建广播调度</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">间隔（秒）</label>
          <input type="number" min={30} value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">任务类型</label>
          <select value={taskType} onChange={(e) => setTaskType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white">
            <option value="collect">collect</option>
            <option value="sync">sync</option>
            <option value="dialog">dialog</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">广播半径</label>
          <input type="number" min={1} value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        </div>
      </div>
      <button onClick={create} disabled={!wallet || busy}
        className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40">
        {busy ? '创建中...' : '创建调度'}
      </button>
      {!wallet && <p className="text-xs text-amber-400 mt-2">需先注册钱包</p>}
      {msg && <p className="text-xs mt-2 text-green-400">{msg}</p>}
    </div>
  );
}
