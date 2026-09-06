export interface AgentInfo {
  agent_id: string;
  wallet: string;
  clone_id?: string;
  status: string;
  balance: number;
  experience: number;
  rooms?: string[];
  main_status?: string;
  clone_status?: string;
  created?: number;
  last_sync?: number;
}

export interface AgentListResponse {
  agents: AgentInfo[];
  count: number;
  network_time: number;
}

export interface AgentBindResponse {
  bound: boolean;
  agent_id: string;
  error?: string;
}
