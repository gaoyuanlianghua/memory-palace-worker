import { useEffect, useRef } from 'react';

export function Canvas2D({ draw, width = 500, height = 400, className = '' }: {
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  width?: number;
  height?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    draw(ctx, width, height);
  });

  return <canvas ref={ref} width={width} height={height} className={className} />;
}
