import { heatColor, heatLevel } from '../../../shared/viz/heatmap';

export function HeatScore({ value, label }: { value: number; label: string }) {
  const level = heatLevel(value);
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex items-center gap-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
        style={{ background: `radial-gradient(circle, ${heatColor(level)} 0%, rgba(15,23,42,0.9) 70%)` }}
      >
        {value.toFixed(1)}
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xs text-gray-500 mt-1">热度等级：{['冷', '微热', '活跃', '高热', '沸腾'][level]}</p>
      </div>
    </div>
  );
}
