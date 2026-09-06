export type JobStatus = 'published' | 'claimed' | 'executing' | 'completed' | string;

export interface WorkflowJob {
  job_id: string;
  title: string;
  publisher_wallet: string;
  executor_wallet?: string | null;
  reward: number;
  status: JobStatus;
  created: number;
  description?: string;
  deadline?: number;
}

export interface WorkflowListResponse {
  total: number;
  jobs: WorkflowJob[];
}

export interface WorkflowActionResponse {
  published?: boolean;
  claimed?: boolean;
  executing?: boolean;
  completed?: boolean;
  submitted?: boolean;
  job_id?: string;
  publisher_wallet?: string;
  executor_wallet?: string;
  reward?: number;
  balance?: number;
  message?: string;
}

export const JOB_STATUS_LABEL: Record<string, string> = {
  published: '待认领',
  claimed: '已认领',
  executing: '执行中',
  completed: '已完成',
};
