export interface LogEntry {
  id?: string;
  chain_id?: string;
  wallet?: string;
  agent_id?: string;
  action?: string;
  target?: string;
  result?: string;
  reason?: string;
  level?: number;
  created?: number;
  created_at?: string;
}

export interface AuditResponse {
  network_logs: LogEntry[];
  count: number;
  network_time: number;
}
