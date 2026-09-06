import type { SolarTermsResponse } from '../types';

const SEASON_TONE: Record<string, string> = {
  春: 'text-green-400 border-green-500/30 bg-green-500/10',
  夏: 'text-red-400 border-red-500/30 bg-red-500/10',
  秋: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  冬: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
};

export function SolarTermsTimeline({ data }: { data: SolarTermsResponse }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">🌗 二十四节气（共 {data.terms.length} 个）</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {data.terms.map((t, i) => (
          <div key={i} className={`rounded-lg border px-3 py-2 text-sm ${SEASON_TONE[t.season] ?? 'text-gray-300 border-gray-600 bg-gray-900/40'}`}>
            <span className="font-medium">{t.name}</span>
            {t.date && <span className="ml-2 text-xs opacity-70">{t.date}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
