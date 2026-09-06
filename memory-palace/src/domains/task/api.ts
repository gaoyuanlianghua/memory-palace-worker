import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { TaskListResponse, TaskActionResponse } from './types';

export const taskApi = {
  active: () => request<TaskListResponse>(ENDPOINTS.task.active.path),
  create: (wallet: string, title: string, description: string, reward: number) =>
    request<TaskActionResponse>(ENDPOINTS.task.create.path, {
      method: 'POST',
      body: { wallet, title, description, reward },
    }),
  claim: (taskId: string, wallet: string) =>
    request<TaskActionResponse>(ENDPOINTS.task.claim.path, { method: 'POST', body: { task_id: taskId, wallet } }),
  complete: (taskId: string, wallet: string, result: string) =>
    request<TaskActionResponse>(ENDPOINTS.task.complete.path, { method: 'POST', body: { task_id: taskId, wallet, result } }),
};
