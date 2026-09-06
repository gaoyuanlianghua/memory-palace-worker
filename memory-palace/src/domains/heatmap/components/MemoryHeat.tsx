import { heatClass, heatLevel, calendarGrid } from '../../../shared/viz/heatmap';
import type { MemoryHeatData } from '../types';

export function MemoryHeat({ data }: { data: MemoryHeatData }) {
  const maxType = Math.max(1, ...data.type_distribution.map((t) => t.count));
  const rows = calendarGrid(data.recent_activity);

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">🧠 记忆热度</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-900/60 rounded-lg p-3">
          <p className="text-lg font-bold text-white">{data.total_memories}</p>
          <p className="text-xs text-gray-400">记忆总数</p>
        </div>
        <div className="bg-gray-900/60 rounded-lg p-3">
          <p className="text-lg font-bold text-white">{data.avg_score.toFixed(2)}</p>
          <p className="text-xs text-gray-400">平均质量分</p>
        </div>
        <div className="bg-gray-900/60 rounded-lg p-3">
          <p className="text-lg font-bold text-green-400">{data.high_quality_count}</p>
          <p className="text-xs text-gray-400">高质量</p>
        </div>
        <div className="bg-gray-900/60 rounded-lg p-3">
          <p className="text-lg font-bold text-red-400">{data.low_quality_count}</p>
          <p className="text-xs text-gray-400">低质量</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2">类型分布（{data.link_count} 条关联）</p>
      <div className="space-y-1.5 mb-4">
        {data.type_distribution.map((t) => (
          <div key={t.memory_type} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-24 shrink-0">{t.memory_type}</span>
            <div className="flex-1 h-3 bg-gray-900/60 rounded overflow-hidden">
              <div className={`h-full rounded ${heatClass(heatLevel(t.count / maxType * 100))}`}
                style={{ width: `${(t.count / maxType) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{t.count}</span>
          </div>
        ))}
      </div>

      {rows.length > 0 && rows[0].length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-2">最近活跃（颜色越深越活跃）</p>
          <div className="flex flex-col gap-1">
            {rows.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map((v, j) => (
                  <span key={j} className={`w-5 h-5 rounded ${v === null ? 'bg-gray-900/40' : heatClass(heatLevel(v * 100))}`} />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
