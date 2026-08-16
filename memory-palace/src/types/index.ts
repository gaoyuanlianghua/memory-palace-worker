export interface SystemStatus {
  system: string;
  concept?: string;
  version?: string;
  mode?: string;
  timestamp?: string;
  date?: string;
}

export interface Clone {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
}

export interface Task {
  id: string;
  title?: string;
  description?: string;
  type?: string;
  requirements?: string[];
  assignedClone?: string;
  status: 'active' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  createdAt?: number;
  reward?: number;
  room?: string;
  required_level?: number;
  claimed_by?: string;
  completed_by?: string;
  result?: string;
  deadline?: number;
}

export interface MemoryStats {
  totalEntries: number;
  typeDistribution: Array<{
    type: string | null;
    count: number;
  }>;
}

export interface GraphNode {
  id: string;
  title: string;
  type: string;
  tags: string[];
  quality: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  index?: number;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    tagCount: number;
  };
}

export interface CacheStats {
  totalCaches: number;
  hits: number;
  misses: number;
  hitRate: number;
  size: string;
}

export interface QualityStats {
  averageQuality: number;
  highQualityCount: number;
  verifiedCount: number;
  totalAnalyzed: number;
}

export interface Pattern {
  id: string;
  name: string;
  count: number;
  confidence: number;
}

export interface SharedPool {
  totalItems: number;
  sharedToday: number;
  clones: string[];
}

export interface LogEntry {
  chain_id?: string;
  wallet?: string;
  chain_length?: number;
  level?: number;
  created_at?: string;
  agent_id?: string;
  action?: string;
  target?: string;
  result?: string;
  reason?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
