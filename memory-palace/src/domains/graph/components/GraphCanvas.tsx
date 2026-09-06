import { useEffect, useRef } from 'react';
import type { GraphVM } from '../vm';

const COLORS: Record<string, string> = {
  agent: '#3b82f6',
  memory: '#8b5cf6',
  task: '#10b981',
  default: '#64748b',
};

export function GraphCanvas({ vm, onSelect }: { vm: GraphVM; onSelect: (id: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const e of vm.edges) {
      const s = vm.nodes.find((n) => n.id === e.source);
      const t = vm.nodes.find((n) => n.id === e.target);
      if (!s || !t) continue;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
    }

    for (const n of vm.nodes) {
      const r = Math.max(6, Math.min(14, 400 / vm.nodes.length + 4));
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[n.type] ?? COLORS.default;
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.id.length > 12 ? `${n.id.slice(0, 12)}…` : n.id, n.x, n.y + r + 12);
    }
  }, [vm]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (const n of vm.nodes) {
      const r = Math.max(6, Math.min(14, 400 / vm.nodes.length + 4));
      if (Math.hypot(n.x - x, n.y - y) <= r + 4) {
        onSelectRef.current(n.id);
        return;
      }
    }
  };

  return (
    <canvas
      ref={ref}
      width={500}
      height={400}
      onClick={handleClick}
      className="w-full bg-gray-900/50 rounded-lg cursor-pointer"
    />
  );
}
