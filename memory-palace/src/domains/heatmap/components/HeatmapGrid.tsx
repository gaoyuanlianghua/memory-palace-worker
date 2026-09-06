import { heatClass, heatLevel } from '../../../shared/viz/heatmap';
import type { DimensionHeat } from '../types';

const DIM_LABEL: Record<string, { label: string; icon: string }> = {
  tool: { label: '工具使用', icon: '🛠️' },
  node: { label: '节点稳定', icon: '🧩' },
  conversation: { label: '对话质量', icon: '💬' },
  memory: { label: '记忆密度', icon: '🧠' },
};

export function HeatmapGrid({ dimensions }: { dimensions: Record<string, DimensionHeat> | undefined }) {
  if (!dimensions) return null;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(dimensions).map(([key, dim]) => {
        const level = heatLevel(dim.heat_level ?? 0);
        const meta = DIM_LABEL[key] ?? { label: key, icon: '📊' };
        const detail = dim.top_tools?.length ? `热门：${dim.top_tools.slice(0, 3).join('、')}` : `分数：${dim.score ?? '—'}`;
        return (
          <div key={key} className={`rounded-xl p-4 border border-gray-700 ${heatClass(level)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/90">{meta.icon} {meta.label}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-900/60 text-white/80">
                Lv.{level}
              </span>
            </div>
            <p className="text-lg font-bold text-white mt-3">{dim.heat_level ?? 0}</p>
            <p className="text-xs text-white/60 mt-1 truncate">{detail}</p>
          </div>
        );
      })}
    </div>
  );
}
