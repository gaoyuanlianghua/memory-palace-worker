import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type {
  HeatmapStatus, ToolHeatResponse, ConversationTrendResponse,
  MemoryHeatData, NodeStatus, RealtimeHeat,
} from './types';

const q = (path: string, params: Record<string, string | number | undefined>) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') usp.set(k, String(v));
  const s = usp.toString();
  return s ? `${path}?${s}` : path;
};

export const heatmapApi = {
  status: (wallet: string) => request<HeatmapStatus>(q(ENDPOINTS.heatmap.status.path, { wallet })),
  tool: (wallet: string) => request<ToolHeatResponse>(q(ENDPOINTS.heatmap.tool.path, { wallet })),
  conversation: (wallet: string) => request<ConversationTrendResponse>(q(ENDPOINTS.heatmap.conversation.path, { wallet })),
  memory: (wallet: string) => request<MemoryHeatData>(q(ENDPOINTS.heatmap.memory.path, { wallet })),
  node: (wallet: string) => request<NodeStatus>(q(ENDPOINTS.heatmap.node.path, { wallet })),
  realtime: (wallet: string) => request<RealtimeHeat>(q(ENDPOINTS.heatmap.realtime.path, { wallet })),
  collect: (wallet: string, tool_name: string) =>
    request<{ collected: boolean }>(ENDPOINTS.heatmap.collect.path, { method: 'POST', body: { wallet, tool_name } }),
};
