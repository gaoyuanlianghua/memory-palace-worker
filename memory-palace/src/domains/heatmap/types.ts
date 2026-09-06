export interface DimensionHeat {
  heat_level?: number;
  score?: number;
  top_tools?: string[];
  avg_quality?: number;
  density?: number;
  links?: number;
}

export interface HeatmapStatus {
  wallet: string;
  dimension: string;
  overall_heat: number;
  timestamp: number;
  dimensions: {
    tool: DimensionHeat;
    node: DimensionHeat;
    conversation: DimensionHeat;
    memory: DimensionHeat;
  };
}

export interface ToolHeat {
  tool: string;
  calls: number;
  success_rate: number;
  avg_duration_ms: number;
  avg_quality: number;
  active_hours: number;
  heat_level: number;
}

export interface ToolHeatResponse {
  wallet: string;
  period: string;
  tools: ToolHeat[];
}

export interface ConversationTrendItem {
  date: string;
  conversations: number;
  avg_quality: number;
  avg_optimization: number;
  best_topic?: string;
  worst_topic?: string;
}

export interface ConversationTrendResponse {
  wallet: string;
  period: string;
  avg_quality: number;
  heat_level: number;
  trends: ConversationTrendItem[];
}

export interface MemoryHeatData {
  wallet: string;
  total_memories: number;
  avg_score: number;
  high_quality_count: number;
  low_quality_count: number;
  link_count: number;
  heat_level: number;
  type_distribution: { memory_type: string; count: number }[];
  recent_activity: { day: string; count: number }[];
}

export interface NodeStatus {
  wallet: string;
  status: string;
  stability_score?: number;
}

export interface RealtimeHeat {
  wallet?: string;
  heat?: number;
  active?: boolean;
}
