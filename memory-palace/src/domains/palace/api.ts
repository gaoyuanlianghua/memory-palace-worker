import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { PalaceStatusResponse, BlocksResponse, TradesResponse } from './types';

export const palaceApi = {
  getStatus: () => request<PalaceStatusResponse>(ENDPOINTS.palace.status.path),
  getBlocks: () => request<BlocksResponse>(ENDPOINTS.palace.blocks.path),
  getTrades: () => request<TradesResponse>(ENDPOINTS.palace.trades.path),
};
