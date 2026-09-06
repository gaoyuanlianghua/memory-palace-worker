import { useState } from 'react';
import { workflowApi } from '../api';

export function PublishForm({ wallet, onPublished }: { wallet: string; onPublished: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const publish = async () => {
    if (!wallet || !title.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await workflowApi.publish(wallet, { title: title.trim(), description: description.trim(), reward });
      setMsg(`已发布工作 ${r.job_id}，赏金 ${reward} MC`);
      setTitle(''); setDescription('');
      onPublished();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">📤 发布工作</h3>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述（可选）" rows={3}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        <div>
          <label className="block text-sm text-gray-400 mb-1">赏金（MC）</label>
          <input type="number" min={0.1} step={0.1} value={reward}
            onChange={(e) => setReward(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        </div>
        <button onClick={publish} disabled={!wallet || busy || !title.trim()}
          className="w-full px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40">
          {busy ? '发布中...' : '发布'}
        </button>
        {!wallet && <p className="text-xs text-amber-400">需先注册钱包</p>}
        {msg && <p className="text-xs text-green-400">{msg}</p>}
      </div>
    </div>
  );
}
