export interface MemoryEntry {
  id: string;
  wallet: string;
  content: string;
  memory_type: string;
  created: number;
}

export interface MemoryListResponse {
  memory_network: { total_memories: number };
  network_time: number;
}

export interface MemoryDetailResponse {
  memories: MemoryEntry[];
  count: number;
  network_time: number;
}

export interface MemoryCreateResponse {
  created: boolean;
  memory_id: string;
  wallet: string;
  memory_type: string;
  network_time: number;
}
