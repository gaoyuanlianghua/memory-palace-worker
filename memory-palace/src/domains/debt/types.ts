export interface Debt {
  debt_id: string;
  issuer: string;
  amount: number;
  interest_rate: number;
  status: string;
  issued_at: number;
  due_at: number;
}

export interface DebtListResponse {
  total: number;
  debts: Debt[];
}

export interface DebtActionResponse {
  issued?: boolean;
  repaid?: boolean;
  debt_id?: string;
  amount?: number;
  total_paid?: number;
  error?: string;
  required?: number;
  balance?: number;
}
