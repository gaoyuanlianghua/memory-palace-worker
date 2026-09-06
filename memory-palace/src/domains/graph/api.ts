import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { GraphResponse } from './types';

export const graphApi = {
  status: () => request<GraphResponse>(ENDPOINTS.graph.status.path),
};
