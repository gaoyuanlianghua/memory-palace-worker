import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { PoolStatusResponse, PoolActionResponse } from './types';

export const poolApi = {
  status: () => request<PoolStatusResponse>(ENDPOINTS.pool.status.path),
  airdrop: (wallet: string, amount: number, reason: string) =>
    request<PoolActionResponse>(ENDPOINTS.pool.airdrop.path, { method: 'POST', body: { wallet, amount, reason } }),
  decay: (wallet: string, percentage: number, reason: string) =>
    request<PoolActionResponse>(ENDPOINTS.pool.decay.path, { method: 'POST', body: { wallet, percentage, reason } }),
  expand: (wallet: string, amount: number) =>
    request<PoolActionResponse>(ENDPOINTS.pool.expand.path, { method: 'POST', body: { wallet, amount } }),
};
