import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { AgentListResponse, AgentBindResponse } from './types';

export const agentApi = {
  list: () => request<AgentListResponse>(ENDPOINTS.agent.list.path),
  bind: (wallet: string, agentName: string) =>
    request<AgentBindResponse>(ENDPOINTS.agent.bind.path, {
      method: 'POST',
      body: { wallet, agent_name: agentName },
    }),
};
