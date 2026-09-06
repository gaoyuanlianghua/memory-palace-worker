import { describe, it, expect } from 'vitest';
import { simulateLayout, type ForceNode } from './force';

describe('force', () => {
  it('布局收敛后节点坐标有限', () => {
    const nodes: ForceNode[] = [
      { id: 'a', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'b', x: 10, y: 10, vx: 0, vy: 0 },
      { id: 'c', x: -10, y: 10, vx: 0, vy: 0 },
    ];
    const edges = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
      { source: 'a', target: 'c' },
    ];
    const result = simulateLayout(nodes, edges, { iterations: 50, width: 400, height: 300 });
    for (const n of result) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
    }
  });
});
