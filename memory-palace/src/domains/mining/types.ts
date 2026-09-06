export interface MiningNode {
  wallet: string;
  node_id?: string;
  status: string;
  power?: number;
  mining_power?: number;
  last_heartbeat?: number;
}

export interface MiningStatusResponse {
  status: string;
  nodes: { total: number; online: number; total_power: number };
  mining: { total_knowledge: number; pending_dialogs: number; recent_syncs: number };
  top_miners: MiningNode[];
  network_time: number;
}

export interface GlobalStats {
  total_nodes: number;
  online_nodes: number;
  total_mining_power: number;
  total_blocks_found: number;
  avg_hash_rate: number;
}

export interface SyncRecord {
  wallet: string;
  mining_power: number;
  blocks_found: number;
  hash_rate: number;
  created: number;
}

export interface MiningBackgroundResponse {
  global_stats: GlobalStats;
  top_miners: MiningNode[];
  recent_syncs: SyncRecord[];
  network_time: number;
}

export interface MiningConfigValue {
  value: string;
  updated_by?: string;
  updated_at?: number;
}

export interface MiningConfigResponse {
  config: Record<string, MiningConfigValue>;
  mining_keys: Record<string, string>;
  network_time: number;
}

export interface MiningActionResponse {
  started?: boolean;
  synced?: boolean;
  updated?: boolean;
  node_id?: string;
  status?: string;
  new_node?: boolean;
  sync_id?: string;
  key?: string;
  value?: string;
  mining_power?: number;
  network_time?: number;
}
