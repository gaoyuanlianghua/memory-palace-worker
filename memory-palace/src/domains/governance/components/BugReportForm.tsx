import { useState } from 'react';
import { governanceApi } from '../api';

const ROOMS = ['协作大厅', '交易市场', '记忆殿堂', '学术工坊', '系统区'];
const TYPES = ['功能异常', '数据不一致', '性能问题', '安全漏洞', '交互问题'];

export function BugReportForm({ agentId, onReported }: { agentId: string; onReported: () => void }) {
  const [room, setRoom] = useState(ROOMS[0]);
  const [bugType, setBugType] = useState(TYPES[0]);
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const report = async () => {
    if (!agentId || !room || !bugType) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await governanceApi.reportBug(agentId, room, bugType, description || undefined, severity);
      setMsg(`Bug 已上报：${r.bug_id}，赏金 ${r.reward ?? 0} MC`);
      setDescription('');
      onReported();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">📮 上报 Bug</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">房间</label>
            <select value={room} onChange={(e) => setRoom(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white">
              {ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">类型</label>
            <select value={bugType} onChange={(e) => setBugType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">严重度</label>
          <div className="flex gap-2">
            {['low', 'medium', 'high', 'critical'].map((s) => (
              <button key={s} onClick={() => setSeverity(s)}
                className={`px-3 py-1.5 rounded-lg text-xs border ${
                  severity === s ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'text-gray-400 border-gray-600 hover:border-gray-500'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
          placeholder="问题描述（可选）"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        <button onClick={report} disabled={!agentId || busy}
          className="w-full px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40">
          {busy ? '上报中...' : '上报 Bug'}
        </button>
        {!agentId && <p className="text-xs text-amber-400">需先绑定分身</p>}
        {msg && <p className={`text-xs ${msg.includes('已上报') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
      </div>
    </div>
  );
}
