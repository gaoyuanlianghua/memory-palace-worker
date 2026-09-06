import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type {
  MiningStatusResponse,
  MiningBackgroundResponse,
  MiningConfigResponse,
  MiningActionResponse,
} from './types';

export const miningApi = {
  status: () => request<MiningStatusResponse>(ENDPOINTS.mining.status.path),
  background: () => request<MiningBackgroundResponse>(ENDPOINTS.mining.background.path),
  config: () => request<MiningConfigResponse>(ENDPOINTS.mining.config.path),
  setConfig: (key: string, value: string, wallet: string) =>
    request<MiningActionResponse>(ENDPOINTS.mining.setConfig.path, { method: 'POST', body: { key, value, wallet } }),
  start: (wallet: string, agent_id?: string) =>
    request<MiningActionResponse>(ENDPOINTS.mining.start.path, { method: 'POST', body: { wallet, agent_id } }),
  trigger: (wallet: string) =>
    request<MiningActionResponse>(ENDPOINTS.mining.trigger.path, { method: 'POST', body: { wallet } }),
  sync: (wallet: string, mining_power: number, blocks_found = 0, hash_rate = 0) =>
    request<MiningActionResponse>(ENDPOINTS.mining.sync.path, {
      method: 'POST',
      body: { wallet, mining_power, blocks_found, hash_rate },
    }),
};
