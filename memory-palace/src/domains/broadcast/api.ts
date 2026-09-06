import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { ScheduleListResponse, ScheduleActionResponse, WakeResponse } from './types';

export const broadcastApi = {
  list: (wallet: string) =>
    request<ScheduleListResponse>(`${ENDPOINTS.broadcast.schedule.path}?wallet=${encodeURIComponent(wallet)}`),
  create: (wallet: string, opts: { agent_id?: string; schedule_type?: string; interval_seconds?: number; task_type?: string; radius?: number; message?: unknown }) =>
    request<ScheduleActionResponse>(ENDPOINTS.broadcast.create.path, { method: 'POST', body: { wallet, ...opts } }),
  update: (id: string, wallet: string, opts: { enabled?: boolean; interval_seconds?: number; radius?: number; task_type?: string }) =>
    request<ScheduleActionResponse>(ENDPOINTS.broadcast.update.path, { method: 'POST', body: { id, wallet, ...opts } }),
  remove: (id: string, wallet: string) =>
    request<ScheduleActionResponse>(ENDPOINTS.broadcast.remove.path, { method: 'POST', body: { id, wallet } }),
  wake: (wallet: string, opts: { agent_id?: string; task_type?: string; radius?: number; message?: unknown }) =>
    request<WakeResponse>(ENDPOINTS.broadcast.wake.path, { method: 'POST', body: { wallet, ...opts } }),
};
