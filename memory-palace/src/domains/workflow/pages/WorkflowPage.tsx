import { useState } from 'react';
import { SectionTitle, Spinner } from '../../../shared/ui';
import { useWorkflowJobs, useWalletAddress } from '../hooks';
import { JobTable } from '../components/JobTable';
import { PublishForm } from '../components/PublishForm';
import { workflowApi } from '../api';
import type { WorkflowJob } from '../types';

export function WorkflowPage() {
  const wallet = useWalletAddress();
  const { jobs, loading, refresh } = useWorkflowJobs();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const act = async (job: WorkflowJob, action: 'claim' | 'execute' | 'complete') => {
    if (!wallet) return;
    setBusyId(job.job_id);
    setMsg(null);
    try {
      if (action === 'claim') await workflowApi.claim(job.job_id, wallet);
      if (action === 'execute') await workflowApi.execute(job.job_id, wallet);
      if (action === 'complete') {
        const r = await workflowApi.complete(job.job_id, wallet, 'completed', 'verified');
        setMsg(r.completed ? `已完成，获得赏金 ${r.reward} MC` : '已提交结果，等待验证');
      }
      refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="工作流" subtitle="发布-认领-执行-完成 协作工作" />
      {msg && <p className="text-xs text-green-400">{msg}</p>}
      {loading && jobs.length === 0 ? <Spinner text="加载工作中..." /> : (
        <JobTable jobs={jobs} wallet={wallet} onAction={act} busyId={busyId} />
      )}
      <PublishForm wallet={wallet} onPublished={refresh} />
    </div>
  );
}
