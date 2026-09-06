import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type {
  LibraryResponse, PreferenceResponse, ToolStats, AgentToolsResponse,
} from './types';

const q = (path: string, params: Record<string, string | number | undefined>) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') usp.set(k, String(v));
  const s = usp.toString();
  return s ? `${path}?${s}` : path;
};

export const toolsApi = {
  library: (wallet: string) => request<LibraryResponse>(q(ENDPOINTS.tools.library.path, { wallet })),
  agentTools: (wallet: string, agent_id: string) =>
    request<AgentToolsResponse>(q(ENDPOINTS.tools.agentTools.path, { wallet, agent_id })),
  stats: (wallet: string) => request<ToolStats>(q(ENDPOINTS.tools.stats.path, { wallet })),
  preference: (wallet: string) => request<PreferenceResponse>(q(ENDPOINTS.tools.preference.path, { wallet })),
  callLog: (wallet: string, tool_name: string, params?: unknown, result?: unknown) =>
    request<{ logged: boolean }>(ENDPOINTS.tools.callLog.path, { method: 'POST', body: { wallet, tool_name, params, result } }),
  initSecurity: (wallet: string) =>
    request<{ initialized: boolean }>(ENDPOINTS.tools.initSecurity.path, { method: 'POST', body: { wallet } }),
};
