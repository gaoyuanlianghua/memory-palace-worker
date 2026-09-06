export interface PalaceStatus {
  status: string;
  version: string;
  node_count: number;
  active_tasks: number;
  system_pool: number;
  chain_name: string;
  protocol: string;
  network_mode: string;
  network_time: number;
}

export interface PalaceBlock {
  id: string;
  height?: number;
  created?: number;
  tx_count?: number;
  hash?: string;
}

export interface PalaceTrade {
  id: string;
  wallet?: string;
  type?: string;
  amount?: number;
  created?: number;
}

export interface PalaceStatusResponse extends PalaceStatus {}

export interface BlocksResponse {
  blocks: PalaceBlock[];
  count: number;
  network_time: number;
}

export interface TradesResponse {
  trades: PalaceTrade[];
  count: number;
  network_time: number;
}
