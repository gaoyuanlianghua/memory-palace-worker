import type { ForceNode, ForceEdge } from '../../../shared/viz/force';
import type { GraphResponse } from './types';

export interface GraphVM {
  nodes: ForceNode[];
  edges: ForceEdge[];
  stats: GraphResponse['graph']['stats'];
}

export function toGraphVM(raw: GraphResponse, width: number, height: number): GraphVM {
  const nodes: ForceNode[] = raw.graph.nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(1, raw.graph.nodes.length);
    return { id: n.id, x: width / 2 + 140 * Math.cos(angle), y: height / 2 + 140 * Math.sin(angle), vx: 0, vy: 0 };
  });
  const edges: ForceEdge[] = raw.graph.edges.map((e) => ({ source: e.source, target: e.target }));
  return { nodes, edges, stats: raw.graph.stats };
}
