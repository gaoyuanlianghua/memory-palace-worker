export interface ForceNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface ForceEdge {
  source: string;
  target: string;
}

interface LayoutOptions {
  iterations?: number;
  width?: number;
  height?: number;
  charge?: number;
  springLength?: number;
}

export function simulateLayout(
  nodes: ForceNode[],
  edges: ForceEdge[],
  { iterations = 100, width = 500, height = 400, charge = -300, springLength = 80 }: LayoutOptions = {},
): ForceNode[] {
  const pos = nodes.map((n) => ({ x: n.x, y: n.y, vx: 0, vy: 0 }));
  const index = new Map<string, number>(nodes.map((n, i) => [n.id, i]));
  const pairs: Array<[number, number]> = [];
  for (const e of edges) {
    const s = index.get(e.source);
    const t = index.get(e.target);
    if (s !== undefined && t !== undefined) pairs.push([s, t]);
  }

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        let dx = pos[j].x - pos[i].x;
        let dy = pos[j].y - pos[i].y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          d2 = dx * dx + dy * dy;
        }
        const d = Math.sqrt(d2);
        const f = charge / d2;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        pos[i].vx -= fx;
        pos[i].vy -= fy;
        pos[j].vx += fx;
        pos[j].vy += fy;
      }
    }
    for (const [s, t] of pairs) {
      const dx = pos[t].x - pos[s].x;
      const dy = pos[t].y - pos[s].y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = (d - springLength) * 0.05;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      pos[s].vx += fx;
      pos[s].vy += fy;
      pos[t].vx -= fx;
      pos[t].vy -= fy;
    }
    for (const p of pos) {
      p.vx *= 0.85;
      p.vy *= 0.85;
      p.x += p.vx;
      p.y += p.vy;
      p.x = Math.min(Math.max(p.x, 20), width - 20);
      p.y = Math.min(Math.max(p.y, 20), height - 20);
    }
  }

  return nodes.map((n, i) => ({ ...n, x: pos[i].x, y: pos[i].y }));
}
