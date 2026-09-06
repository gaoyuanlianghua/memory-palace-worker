import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { DebtListResponse, DebtActionResponse } from './types';

export const debtApi = {
  list: () => request<DebtListResponse>(ENDPOINTS.debt.list.path),
  issue: (issuer: string, amount: number, interest_rate?: number, term_seconds?: number) =>
    request<DebtActionResponse>(ENDPOINTS.debt.issue.path, { method: 'POST', body: { issuer, amount, interest_rate, term_seconds } }),
  repay: (debt_id: string, wallet: string) =>
    request<DebtActionResponse>(ENDPOINTS.debt.repay.path, { method: 'POST', body: { debt_id, wallet } }),
};
