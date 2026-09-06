import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { SystemStatsResponse } from './types';

export const systemApi = {
  getStats: () => request<SystemStatsResponse>(ENDPOINTS.system.stats.path),
  getPool: () => request<{ pool: { balance: number }; network_time: number }>(ENDPOINTS.system.pool.path),
};
