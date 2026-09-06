export interface WalletInfoResponse {
  wallet?: string;
  balance?: number;
  agent_id?: string;
  registered?: boolean;
  network_time?: number;
}

export interface WalletRegisterResponse {
  registered: boolean;
  already_registered?: boolean;
  node_id: string;
  balance?: number;
  api_key?: string;
  initial_balance?: number;
  message?: string;
  network_time: number;
}

export interface WalletKeyInfo {
  wallet: string;
  agent_id: string;
  api_key: string;
  balance: number;
  registered_at: number;
}

export interface WalletKeysResponse {
  wallets: WalletKeyInfo[];
  count: number;
  network_time: number;
}
