import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { MemoryListResponse, MemoryDetailResponse, MemoryCreateResponse } from './types';

export const memoryApi = {
  list: () => request<MemoryListResponse>(ENDPOINTS.memory.list.path),
  detail: () => request<MemoryDetailResponse>(ENDPOINTS.memory.detail.path),
  create: (wallet: string, content: string, memoryType: string) =>
    request<MemoryCreateResponse>(ENDPOINTS.memory.create.path, {
      method: 'POST',
      body: { wallet, content, memory_type: memoryType },
    }),
  remove: (memoryId: string) =>
    request<{ deleted: boolean; memory_id: string; network_time: number }>(ENDPOINTS.memory.remove.path, {
      method: 'POST',
      body: { memory_id: memoryId },
    }),
};
