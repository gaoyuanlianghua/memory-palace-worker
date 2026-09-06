export interface GraphNodeDTO {
  id: string;
  label: string;
  type: string;
  size: number;
}

export interface GraphEdgeDTO {
  source: string;
  target: string;
  weight: number;
}

export interface GraphResponse {
  graph: {
    nodes: GraphNodeDTO[];
    edges: GraphEdgeDTO[];
    stats: { total_nodes: number; total_connections: number; total_memories: number };
  };
  network_time: number;
}
