import { Table, type Column, Badge } from '../../../shared/ui';
import { formatTime, maskWallet } from '../../../shared/utils';
import type { WorkflowJob } from '../types';
import { JOB_STATUS_LABEL } from '../types';

const statusTone: Record<string, 'gray' | 'blue' | 'yellow' | 'green'> = {
  published: 'blue',
  claimed: 'yellow',
  executing: 'yellow',
  completed: 'green',
};

export function JobTable({ jobs, wallet, onAction, busyId }: {
  jobs: WorkflowJob[];
  wallet: string;
  onAction: (job: WorkflowJob, action: 'claim' | 'execute' | 'complete') => void;
  busyId: string | null;
}) {
  const canAct = (job: WorkflowJob, action: 'claim' | 'execute' | 'complete') => {
    if (!wallet) return false;
    if (action === 'claim') return job.status === 'published';
    if (action === 'execute') return job.status === 'claimed';
    return job.status === 'executing';
  };

  const cols: Column<WorkflowJob>[] = [
    { key: 'id', title: 'ID', render: (j) => <span className="text-gray-300">{j.job_id}</span> },
    { key: 'title', title: '标题', render: (j) => <span className="text-white">{j.title}</span> },
    { key: 'publisher', title: '发布者', render: (j) => maskWallet(j.publisher_wallet) },
    { key: 'reward', title: '赏金', render: (j) => `${j.reward} MC` },
    { key: 'status', title: '状态', render: (j) => <Badge tone={statusTone[j.status] ?? 'gray'}>{JOB_STATUS_LABEL[j.status] ?? j.status}</Badge> },
    { key: 'created', title: '发布时间', render: (j) => formatTime(j.created) },
    { key: 'actions', title: '操作', render: (j) => (
        <div className="flex gap-2">
          <button onClick={() => onAction(j, 'claim')} disabled={!canAct(j, 'claim') || busyId === j.job_id}
            className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 disabled:opacity-30">
            认领
          </button>
          <button onClick={() => onAction(j, 'execute')} disabled={!canAct(j, 'execute') || busyId === j.job_id}
            className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 disabled:opacity-30">
            执行
          </button>
          <button onClick={() => onAction(j, 'complete')} disabled={!canAct(j, 'complete') || busyId === j.job_id}
            className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30 disabled:opacity-30">
            完成
          </button>
        </div>
      ) },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">📋 工作列表（共 {jobs.length}）</h3>
      <Table columns={cols} rows={jobs} empty="暂无工作" />
    </div>
  );
}
