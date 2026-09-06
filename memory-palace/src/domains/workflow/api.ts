import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { WorkflowListResponse, WorkflowActionResponse } from './types';

export const workflowApi = {
  list: () => request<WorkflowListResponse>(ENDPOINTS.workflow.list.path),
  publish: (publisher_wallet: string, opts: { title: string; description?: string; requirements?: string[]; reward: number; deadline?: number }) =>
    request<WorkflowActionResponse>(ENDPOINTS.workflow.publish.path, { method: 'POST', body: { publisher_wallet, ...opts } }),
  claim: (job_id: string, executor_wallet: string, executor_agent?: string) =>
    request<WorkflowActionResponse>(ENDPOINTS.workflow.claim.path, { method: 'POST', body: { job_id, executor_wallet, executor_agent } }),
  execute: (job_id: string, executor_wallet: string, step_action?: string) =>
    request<WorkflowActionResponse>(ENDPOINTS.workflow.execute.path, { method: 'POST', body: { job_id, executor_wallet, step_action } }),
  complete: (job_id: string, executor_wallet: string, result?: string, verification?: string) =>
    request<WorkflowActionResponse>(ENDPOINTS.workflow.complete.path, { method: 'POST', body: { job_id, executor_wallet, result, verification } }),
};
