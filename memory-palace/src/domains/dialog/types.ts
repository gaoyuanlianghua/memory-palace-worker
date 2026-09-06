export interface DialogCache {
  total: number;
  active: number;
  expired: number;
  total_usage: number;
}

export interface DialogPrepareRequest {
  wallet: string;
  agent_id?: string;
  prompt?: string;
  user_input?: string;
  context?: string;
  session_id?: string;
}

export interface DialogPrepareResponse {
  context_id: string;
  optimized_prompt: string;
  wallet_context?: {
    tier: string;
    total_conversations: number;
    avg_quality: number;
    favorite_tools: string[];
  };
  memory_context?: unknown;
  recommended_tools?: string[];
  knowledge_used?: number;
  heatmap?: unknown;
  optimization_score: number;
  network_time: number;
}

export interface DialogRecordResponse {
  recorded: boolean;
  context_id: string;
  quality_score: number;
  memory_updated: boolean;
  preference_updated: boolean;
}

export interface DialogFeedbackResponse {
  updated: boolean;
  quality_score: number;
}

export interface DialogOptimizeResponse {
  optimized: boolean;
  cached?: boolean;
  original?: string;
  optimized_prompt: string;
  score: number;
}
