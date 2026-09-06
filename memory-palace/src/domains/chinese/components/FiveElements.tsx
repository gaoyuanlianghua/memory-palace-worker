import type { FiveElement } from '../types';

const ELEM_ICON: Record<string, string> = {
  金: '🪙',
  木: '🌳',
  水: '💧',
  火: '🔥',
  土: '⛰️',
};

export function FiveElements({ elements }: { elements: FiveElement[] }) {
  const grouped = new Map<string, string[]>();
  for (const e of elements) {
    const list = grouped.get(e.element) ?? [];
    list.push(e.character);
    grouped.set(e.element, list);
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">🀄 汉字五行映射（共 {elements.length} 字）</h3>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[...grouped.entries()].map(([element, chars]) => (
          <div key={element} className="bg-gray-900/60 rounded-lg p-3">
            <p className="text-sm text-white/90">{ELEM_ICON[element] ?? '◻️'} {element}</p>
            <p className="text-lg text-white mt-2 leading-relaxed break-all">{chars.join('')}</p>
            <p className="text-xs text-gray-500 mt-1">{chars.length} 字</p>
          </div>
        ))}
      </div>
    </div>
  );
}
