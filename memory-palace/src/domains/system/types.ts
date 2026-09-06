export interface NetworkStats {
  total_nodes: number;
  total_wallets: number;
  active_tasks: number;
  system_pool: number;
}

export interface SystemStatsResponse {
  network_stats: NetworkStats;
  network_time: number;
}
