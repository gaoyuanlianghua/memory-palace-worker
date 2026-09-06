import { Table, type Column, Badge } from '../../../shared/ui';
import { formatTime } from '../../../shared/utils';
import type { BroadcastSchedule } from '../types';

export function ScheduleTable({ schedules, wallet, onToggle, onDelete }: {
  schedules: BroadcastSchedule[];
  wallet: string;
  onToggle: (s: BroadcastSchedule) => void;
  onDelete: (id: string) => void;
}) {
  const cols: Column<BroadcastSchedule>[] = [
    { key: 'id', title: 'ID', render: (s) => <span className="text-gray-300">{s.id}</span> },
    { key: 'type', title: '类型', render: (s) => <Badge>{s.task_type}</Badge> },
    { key: 'interval', title: '间隔', render: (s) => `${s.interval_seconds}s` },
    { key: 'radius', title: '半径', render: (s) => s.radius },
    { key: 'enabled', title: '状态', render: (s) => (s.enabled ? <Badge tone="green">启用</Badge> : <Badge>停用</Badge>) },
    { key: 'next', title: '下次运行', render: (s) => formatTime(s.next_run) },
    { key: 'runs', title: '运行/成功/失败', render: (s) => `${s.run_count ?? 0}/${s.success_count ?? 0}/${s.fail_count ?? 0}` },
    { key: 'actions', title: '操作', render: (s) => (
        <div className="flex gap-2">
          <button onClick={() => onToggle(s)}
            className="px-2 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 text-gray-300">
            {s.enabled ? '停用' : '启用'}
          </button>
          <button onClick={() => onDelete(s.id)}
            className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30">
            删除
          </button>
        </div>
      ) },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">📋 调度列表（共 {schedules.length}）</h3>
      <Table columns={cols} rows={schedules} empty={wallet ? '暂无调度，先创建一个' : '需先注册钱包'} />
    </div>
  );
}
