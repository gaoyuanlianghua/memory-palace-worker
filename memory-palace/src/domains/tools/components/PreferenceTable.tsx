import { Table, type Column, Badge } from '../../../shared/ui';
import type { ToolPreference } from '../types';

export function PreferenceTable({ preferences }: { preferences: ToolPreference[] }) {
  const cols: Column<ToolPreference>[] = [
    { key: 'tool', title: '工具', render: (p) => p.tool },
    { key: 'calls', title: '调用次数', render: (p) => p.total_calls },
    { key: 'rate', title: '成功率', render: (p) => `${(p.success_rate * 100).toFixed(0)}%` },
    { key: 'quality', title: '平均质量', render: (p) => p.avg_quality.toFixed(2) },
    { key: 'dur', title: '平均耗时', render: (p) => `${p.avg_duration_ms.toFixed(0)}ms` },
    { key: 'score', title: '偏好度', render: (p) => {
        const pct = Math.round(Math.max(0, Math.min(1, p.preference_score)) * 100);
        return <Badge tone={pct >= 70 ? 'green' : pct >= 40 ? 'yellow' : 'gray'}>{pct}%</Badge>;
      } },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">📊 工具偏好</h3>
      <Table columns={cols} rows={preferences} empty="暂无偏好数据" />
    </div>
  );
}
