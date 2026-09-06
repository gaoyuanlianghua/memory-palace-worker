import type { CycleNode } from '../types';

const R = 110; // 节点半径
const CX = 160;
const CY = 150;

const ELEM_COLOR: Record<string, string> = {
  金: '#fbbf24',
  木: '#34d399',
  水: '#60a5fa',
  火: '#f87171',
  土: '#c084fc',
};

function pos(i: number, total: number): [number, number] {
  const angle = -Math.PI / 2 + (2 * Math.PI * i) / total;
  return [CX + R * Math.cos(angle), CY + R * Math.sin(angle)];
}

export function ElementsCycle({ cycle }: { cycle: CycleNode[] }) {
  if (cycle.length === 0) return null;
  const points = cycle.map((n, i) => ({ node: n, x: pos(i, cycle.length)[0], y: pos(i, cycle.length)[1] }));
  const byName = new Map(points.map((p) => [p.node.element, p]));

  const genLines = points.flatMap((p) => {
    const target = p.node.generates ? byName.get(p.node.generates) : undefined;
    return target ? [{ x1: p.x, y1: p.y, x2: target.x, y2: target.y, kind: 'gen' as const }] : [];
  });
  const ovLines = points.flatMap((p) => {
    const target = p.node.overcomes ? byName.get(p.node.overcomes) : undefined;
    return target ? [{ x1: p.x, y1: p.y, x2: target.x, y2: target.y, kind: 'over' as const }] : [];
  });

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col items-center">
      <h3 className="text-sm font-medium text-gray-300 mb-3 self-start">☯️ 五行相生相克环</h3>
      <svg width={320} height={300} viewBox="0 0 320 300">
        {genLines.map((l, i) => (
          <line key={`g${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#34d399" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
        ))}
        {ovLines.map((l, i) => (
          <line key={`o${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#f87171" strokeWidth={1.5} opacity={0.7} />
        ))}
        {points.map((p) => (
          <g key={p.node.element}>
            <circle cx={p.x} cy={p.y} r={28} fill={ELEM_COLOR[p.node.element] ?? '#64748b'} opacity={0.25} />
            <circle cx={p.x} cy={p.y} r={22} fill="none" stroke={ELEM_COLOR[p.node.element] ?? '#64748b'} strokeWidth={2} />
            <text x={p.x} y={p.y + 6} textAnchor="middle" fontSize={20} fill="#fff" fontWeight="bold">
              {p.node.element}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex gap-4 text-xs text-gray-400 mt-2">
        <span><span className="text-green-400">——</span> 相生</span>
        <span><span className="text-red-400">——</span> 相克</span>
      </div>
    </div>
  );
}
