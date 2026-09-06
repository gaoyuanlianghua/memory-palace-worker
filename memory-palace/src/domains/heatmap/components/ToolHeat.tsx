import { Table, type Column } from '../../../shared/ui';
import { heatClass, heatLevel } from '../../../shared/viz/heatmap';
import type { ToolHeat } from '../types';

export function ToolHeat({ tools }: { tools: ToolHeat[] }) {
  const cols: Column<ToolHeat>[] = [
    { key: 'tool', title: '工具', render: (t) => t.tool },
    { key: 'calls', title: '调用', render: (t) => t.calls },
    { key: 'rate', title: '成功率', render: (t) => `${(t.success_rate * 100).toFixed(0)}%` },
    { key: 'dur', title: '平均耗时', render: (t) => `${t.avg_duration_ms.toFixed(0)}ms` },
    { key: 'quality', title: '质量', render: (t) => t.avg_quality.toFixed(2) },
    { key: 'hours', title: '活跃时长', render: (t) => `${t.active_hours.toFixed(1)}h` },
    { key: 'heat', title: '热度', render: (t) => (
        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded ${heatClass(heatLevel(t.heat_level))}`} />
          <span className="text-xs text-gray-400">{t.heat_level}</span>
        </div>
      ) },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">🛠️ 工具热度</h3>
      <Table columns={cols} rows={tools} empty="暂无工具数据" />
    </div>
  );
}
