import { useState } from 'react';
import { dialogApi } from '../api';
import type { DialogPrepareResponse } from '../types';

export function OptimizeForm({ wallet, agentId }: { wallet: string; agentId?: string }) {
  const [prompt, setPrompt] = useState('');
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<DialogPrepareResponse | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const prepare = async () => {
    if (!wallet || !prompt.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await dialogApi.prepare({
        wallet,
        agent_id: agentId || undefined,
        prompt: prompt.trim(),
        user_input: userInput.trim() || undefined,
      });
      setResult(r);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const record = async () => {
    if (!result) return;
    setMsg(null);
    try {
      const r = await dialogApi.record({ wallet, context_id: result.context_id, ai_response: result.optimized_prompt });
      setMsg(`已记录：质量分 ${r.quality_score.toFixed(2)}，记忆更新 ${r.memory_updated ? '✓' : '✗'}，偏好更新 ${r.preference_updated ? '✓' : '✗'}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 space-y-4">
      <h3 className="text-sm font-medium text-gray-300">⚙️ 对话上下文优化</h3>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3}
        placeholder="输入您的 Prompt..."
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
      <input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="用户输入（可选）"
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
      <button onClick={() => void prepare()} disabled={!wallet || busy || !prompt.trim()}
        className="w-full px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40">
        {busy ? '优化中...' : '生成优化上下文'}
      </button>
      {!wallet && <p className="text-xs text-amber-400">需先注册钱包</p>}

      {result && (
        <div className="bg-gray-900/60 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">上下文 ID：{result.context_id}</span>
            <span className="text-xs text-green-400">优化分 {result.optimization_score.toFixed(1)}</span>
          </div>
          <p className="text-sm text-white/90 whitespace-pre-wrap">{result.optimized_prompt}</p>
          {result.wallet_context && (
            <p className="text-xs text-gray-500">
              钱包档案：{result.wallet_context.tier} · {result.wallet_context.total_conversations} 次对话 · 平均质量 {result.wallet_context.avg_quality.toFixed(2)}
            </p>
          )}
          {result.recommended_tools && result.recommended_tools.length > 0 && (
            <p className="text-xs text-gray-400">推荐工具：{result.recommended_tools.join('、')}</p>
          )}
          <button onClick={() => void record()}
            className="px-3 py-1.5 rounded text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30">
            💾 记录本次对话
          </button>
        </div>
      )}
      {msg && <p className={`text-xs ${msg.startsWith('已') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
    </div>
  );
}
