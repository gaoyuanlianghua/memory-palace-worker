export interface PoolStatusResponse {
  pool: {
    balance: number;
    total_wallets: number;
    total_nodes: number;
    active_tasks: number;
  };
  network_time: number;
}

export interface PoolActionResponse {
  airdropped?: boolean;
  decayed?: boolean;
  expanded?: boolean;
  wallet?: string;
  amount?: number;
  percentage?: number;
  new_balance?: number;
  reason?: string;
  network_time?: number;
}
