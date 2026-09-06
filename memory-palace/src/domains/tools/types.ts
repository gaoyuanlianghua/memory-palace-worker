export interface ToolInfo {
  name: string;
  description: string;
  category: string;
}

export interface LibraryResponse {
  tools: ToolInfo[];
  network_time: number;
}

export interface ToolPreference {
  tool: string;
  total_calls: number;
  success_rate: number;
  avg_quality: number;
  avg_duration_ms: number;
  preference_score: number;
}

export interface PreferenceResponse {
  wallet: string;
  preferences: ToolPreference[];
}

export interface ToolStats {
  total_calls?: number;
  success_rate?: number;
  active_tools?: number;
  avg_duration_ms?: number;
}

export interface AgentToolsResponse {
  tools: string[];
  count: number;
  network_time: number;
}
