import { useState } from 'react';
import { chineseApi } from '../api';
import type { StemsBranchesResponse, CycleIndexResponse } from '../types';

export function StemsBranches({ data }: { data: StemsBranchesResponse }) {
  const [cycle, setCycle] = useState<CycleIndexResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const lookup = async (index: number) => {
    setErr(null);
    try {
      setCycle(await chineseApi.cycleIndex(index));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">
        🌿 天干地支（{data.stems.length} 天干 × {data.branches.length} 地支 = {data.cycleLength} 甲子）
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">天干</p>
          <div className="flex flex-wrap gap-1.5">
            {data.stems.map((s, i) => (
              <span key={i} className="px-2 py-1 rounded bg-gray-900/60 text-sm text-white/90">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">地支</p>
          <div className="flex flex-wrap gap-1.5">
            {data.branches.map((b, i) => (
              <span key={i} className="px-2 py-1 rounded bg-gray-900/60 text-sm text-white/90">{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">六十甲子查询：</span>
        <input type="number" min={0} max={data.cycleLength - 1} defaultValue={0}
          id="cycle-index"
          className="w-24 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
        <button onClick={() => lookup(Number((document.getElementById('cycle-index') as HTMLInputElement)?.value ?? 0))}
          className="px-3 py-1.5 rounded text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
          查询
        </button>
      </div>
      {cycle && (
        <p className="text-sm text-white/90 mt-2">
          第 {cycle.index} 位：<span className="text-yellow-300 font-medium">{cycle.name ?? `${cycle.stem}${cycle.branch}`}</span>
        </p>
      )}
      {err && <p className="text-xs text-red-400 mt-2">{err}</p>}
    </div>
  );
}
