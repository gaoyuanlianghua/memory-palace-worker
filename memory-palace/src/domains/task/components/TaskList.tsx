import { Card, Table, Badge } from '../../../shared/ui';
import { formatTime } from '../../../shared/utils';
import { useTasks } from '../hooks';

export function TaskList() {
  const { tasks } = useTasks();
  return (
    <Card title="活跃任务" icon="📋">
      <Table
        columns={[
          { key: 'id', title: '任务 ID', render: (t) => <span className="font-mono text-blue-300">{t.task_id ?? t.id ?? '—'}</span> },
          { key: 'title', title: '标题', render: (t) => t.title ?? '—' },
          { key: 'reward', title: '奖励', render: (t) => `${t.reward ?? 0} MC` },
          { key: 'status', title: '状态', render: (t) => <Badge tone={t.status === 'completed' ? 'green' : 'blue'}>{t.status}</Badge> },
          { key: 'claim', title: '认领者', render: (t) => t.claimed_by ?? '—' },
          { key: 'created', title: '创建时间', render: (t) => formatTime(t.created) },
        ]}
        rows={tasks}
        empty="暂无活跃任务"
      />
    </Card>
  );
}
