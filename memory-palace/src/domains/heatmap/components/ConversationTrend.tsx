import { Table, type Column } from '../../../shared/ui';
import { heatClass, heatLevel } from '../../../shared/viz/heatmap';
import type { ConversationTrendItem } from '../types';

export function ConversationTrend({ trends, avgQuality }: { trends: ConversationTrendItem[]; avgQuality: number }) {
  const cols: Column<ConversationTrendItem>[] = [
    { key: 'date', title: '日期', render: (t) => t.date },
    { key: 'count', title: '对话数', render: (t) => t.conversations },
    { key: 'quality', title: '质量', render: (t) => (
        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded ${heatClass(heatLevel(t.avg_quality * 100))}`} />
          <span>{t.avg_quality.toFixed(2)}</span>
        </div>
      ) },
    { key: 'opt', title: '优化度', render: (t) => `${(t.avg_optimization * 100).toFixed(0)}%` },
    { key: 'best', title: '最佳话题', render: (t) => <span className="text-gray-400">{t.best_topic ?? '—'}</span> },
    { key: 'worst', title: '最差话题', render: (t) => <span className="text-gray-400">{t.worst_topic ?? '—'}</span> },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">
        💬 对话趋势（平均质量 <span className="text-white">{avgQuality.toFixed(2)}</span>）
      </h3>
      <Table columns={cols} rows={trends} empty="暂无趋势数据" />
    </div>
  );
}
