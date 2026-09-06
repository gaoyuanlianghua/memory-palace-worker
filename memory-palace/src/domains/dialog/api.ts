import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type {
  DialogCache, DialogPrepareRequest, DialogPrepareResponse,
  DialogRecordResponse, DialogFeedbackResponse, DialogOptimizeResponse,
} from './types';

const q = (path: string, params: Record<string, string | number | undefined>) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') usp.set(k, String(v));
  const s = usp.toString();
  return s ? `${path}?${s}` : path;
};

export const dialogApi = {
  cache: (wallet: string) => request<DialogCache>(q(ENDPOINTS.dialog.cache.path, { wallet })),
  prepare: (body: DialogPrepareRequest) =>
    request<DialogPrepareResponse>(ENDPOINTS.dialog.prepare.path, { method: 'POST', body }),
  record: (body: { wallet: string; context_id: string; session_id?: string; user_message?: string; ai_response?: string; tools_used?: string[]; duration_ms?: number }) =>
    request<DialogRecordResponse>(ENDPOINTS.dialog.record.path, { method: 'POST', body }),
  feedback: (body: { context_id: string; feedback?: string; rating?: number }) =>
    request<DialogFeedbackResponse>(ENDPOINTS.dialog.feedback.path, { method: 'POST', body }),
  optimize: (body: { wallet: string; agent_id?: string; current_prompt: string; context?: string }) =>
    request<DialogOptimizeResponse>(ENDPOINTS.dialog.optimize.path, { method: 'POST', body }),
};
