import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { AuditResponse } from './types';

export const auditApi = {
  list: () => request<AuditResponse>(ENDPOINTS.audit.list.path),
};
