import { useState } from 'react';
import { chineseApi } from '../api';
import type { Idiom } from '../types';

export function IdiomsPanel({ count, idioms }: { count: number; idioms: Idiom[] }) {
  const [category, setCategory] = useState('');
  const [char, setChar] = useState('');
  const [filtered, setFiltered] = useState<Idiom[] | null>(null);

  const filter = async () => {
    try {
      const r = await chineseApi.idioms(category.trim() || undefined, char.trim() || undefined);
      setFiltered(r.idioms);
    } catch {
      setFiltered(idioms);
    }
  };

  const display = filtered ?? idioms;

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 space-y-3">
      <h3 className="text-sm font-medium text-gray-300">📖 成语库（共 {count} 条，显示 {display.length} 条）</h3>
      <div className="flex flex-wrap gap-2">
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="分类"
          className="w-32 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        <input value={char} onChange={(e) => setChar(e.target.value)} placeholder="包含汉字"
          className="w-32 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        <button onClick={() => void filter()}
          className="px-3 py-1.5 rounded text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
          筛选
        </button>
        <button onClick={() => { setCategory(''); setChar(''); setFiltered(null); }}
          className="px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white">
          重置
        </button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
        {display.map((id, i) => (
          <span key={i} title={id.meaning ?? id.category ?? id.pinyin ?? ''}
            className="px-2.5 py-1 rounded bg-gray-900/60 text-sm text-white/90 cursor-default">
            {id.idiom}
          </span>
        ))}
      </div>
    </div>
  );
}
