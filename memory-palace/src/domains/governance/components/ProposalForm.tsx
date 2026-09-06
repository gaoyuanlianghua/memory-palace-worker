import { useState } from 'react';
import { governanceApi } from '../api';

export function ProposalForm({ agentId, onCreated }: { agentId: string; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [targetParam, setTargetParam] = useState('');
  const [newValue, setNewValue] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!agentId || !title.trim() || !targetParam.trim() || !newValue.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await governanceApi.createProposal(agentId, title.trim(), targetParam.trim(), newValue.trim());
      setMsg(`提案已创建：${r.proposal_id}`);
      setTitle(''); setTargetParam(''); setNewValue('');
      onCreated();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">📝 发起提案</h3>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="提案标题"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        <div className="grid grid-cols-2 gap-3">
          <input value={targetParam} onChange={(e) => setTargetParam(e.target.value)} placeholder="目标参数"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          <input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="新值"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        </div>
        <button onClick={create} disabled={!agentId || busy || !title.trim() || !targetParam.trim() || !newValue.trim()}
          className="w-full px-4 py-2 rounded-lg text-sm bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40">
          {busy ? '创建中...' : '发起提案'}
        </button>
        {!agentId && <p className="text-xs text-amber-400">需先绑定分身</p>}
        {msg && <p className={`text-xs ${msg.includes('已创建') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
      </div>
    </div>
  );
}
