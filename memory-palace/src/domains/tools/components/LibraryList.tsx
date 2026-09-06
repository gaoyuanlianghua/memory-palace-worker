import { Table, type Column, Badge } from '../../../shared/ui';
import type { ToolInfo } from '../types';

const CAT_TONE: Record<string, 'blue' | 'green' | 'purple' | 'yellow' | 'gray'> = {
  系统: 'gray',
  记忆: 'purple',
  对话: 'blue',
  交易: 'green',
  协作: 'yellow',
};

export function LibraryList({ tools }: { tools: ToolInfo[] }) {
  const cols: Column<ToolInfo>[] = [
    { key: 'name', title: '工具名', render: (t) => <span className="text-white/90 font-medium">{t.name}</span> },
    { key: 'category', title: '分类', render: (t) => <Badge tone={CAT_TONE[t.category] ?? 'gray'}>{t.category}</Badge> },
    { key: 'desc', title: '描述', render: (t) => <span className="text-gray-400">{t.description}</span> },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">🧰 工具库（共 {tools.length} 个）</h3>
      <Table columns={cols} rows={tools} empty="暂无工具" />
    </div>
  );
}
