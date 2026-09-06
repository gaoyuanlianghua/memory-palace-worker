import { useState } from 'react';
import { dialogApi } from '../api';

export function FeedbackForm() {
  const [contextId, setContextId] = useState('');
  const [rating, setRating] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!contextId.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await dialogApi.feedback({ context_id: contextId.trim(), rating, feedback: feedback.trim() || undefined });
      setMsg(`反馈已更新，新的质量分：${r.quality_score.toFixed(2)}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 space-y-3">
      <h3 className="text-sm font-medium text-gray-300">⭐ 对话质量反馈</h3>
      <input value={contextId} onChange={(e) => setContextId(e.target.value)} placeholder="context_id"
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">评分：</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)}
              className={`w-8 h-8 rounded-lg text-sm border ${
                rating >= n ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' : 'text-gray-500 border-gray-600'
              }`}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2}
        placeholder="文字反馈（可选）"
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
      <button onClick={() => void submit()} disabled={busy || !contextId.trim()}
        className="w-full px-4 py-2 rounded-lg text-sm bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40">
        {busy ? '提交中...' : '提交反馈'}
      </button>
      {msg && <p className={`text-xs ${msg.startsWith('已') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
    </div>
  );
}
