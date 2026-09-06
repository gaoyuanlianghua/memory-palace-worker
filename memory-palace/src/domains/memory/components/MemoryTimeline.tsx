import { Card } from '../../../shared/ui';
import { formatTime } from '../../../shared/utils';
import { useMemories } from '../hooks';

export function MemoryTimeline() {
  const { memories, types, typeFilter, setTypeFilter, remove, message } = useMemories();

  return (
    <Card
      title={`记忆链（${memories.length}）`}
      icon="🗄️"
      action={
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs focus:outline-none">
          <option value="全部">全部</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      }
    >
      {message && <p className="text-sm text-gray-400 mb-3">{message}</p>}
      <div className="space-y-2 max-h-[560px] overflow-y-auto">
        {memories.length === 0 && <p className="text-sm text-gray-500 text-center py-8">暂无记忆</p>}
        {memories.map((m) => (
          <div key={m.id} className="flex gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/60">
            <div className="w-2 shrink-0 rounded-full bg-purple-500/60 self-stretch"></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">{m.memory_type}</span>
                <span className="text-xs text-gray-500">{formatTime(m.created)}</span>
              </div>
              <p className="text-sm text-white/90 mt-1 break-all">{m.content}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 font-mono">{m.id}</span>
                <button onClick={() => void remove(m.id)} className="text-xs text-red-400 hover:text-red-300">删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
