// 热力图格子计算：等级 → 颜色梯度（纯函数，便于单测）

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

/** 按数值在 [min,max] 中的占比映射到 0-4 热力等级 */
export function heatLevel(value: number, min = 0, max = 100): HeatLevel {
  if (max <= min) return 0;
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return Math.round(ratio * 4) as HeatLevel;
}

const LEVEL_COLORS = [
  'rgba(15, 23, 42, 0.4)', // 0 冷
  'rgba(59, 130, 246, 0.45)', // 1 蓝
  'rgba(34, 197, 94, 0.5)', // 2 绿
  'rgba(250, 204, 21, 0.6)', // 3 黄
  'rgba(239, 68, 68, 0.75)', // 4 红
];

/** 等级 → 颜色（canvas 填充用） */
export function heatColor(level: HeatLevel): string {
  return LEVEL_COLORS[level] ?? LEVEL_COLORS[0];
}

/** 等级 → tailwind 类（DOM 格子用） */
export function heatClass(level: HeatLevel): string {
  return [
    'bg-slate-800/60',
    'bg-blue-500/40',
    'bg-green-500/45',
    'bg-yellow-400/50',
    'bg-red-500/60',
  ][level] ?? 'bg-slate-800/60';
}

/** 将最近 N 天数据铺成 7 列网格（日历式），返回 [row][col] 值 */
export function calendarGrid(days: { day: string; count: number }[], columns = 7): (number | null)[][] {
  const map = new Map(days.map((d) => [d.day, d.count]));
  const rows: (number | null)[][] = [];
  const max = Math.max(1, ...days.map((d) => d.count));
  // 从最早一天开始，连续铺到最近一天
  if (days.length === 0) return [[]];
  const start = new Date(days[days.length - 1].day).getTime();
  const end = new Date(days[0].day).getTime();
  let current = start;
  while (current <= end) {
    const row: (number | null)[] = [];
    for (let i = 0; i < columns; i++) {
      const d = new Date(current).toISOString().split('T')[0];
      row.push(map.has(d) ? Math.max(0, Math.min(1, (map.get(d) ?? 0) / max)) : null);
      current += 86400000;
      if (current > end) break;
    }
    rows.push(row);
  }
  return rows;
}
