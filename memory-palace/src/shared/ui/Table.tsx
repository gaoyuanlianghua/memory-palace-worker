import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  title: string;
  render: (row: T) => ReactNode;
}

export function Table<T>({ columns, rows, empty = '暂无数据' }: {
  columns: Column<T>[];
  rows: T[];
  empty?: ReactNode;
}) {
  if (rows.length === 0) {
    return <div className="text-sm text-gray-500 text-center py-8">{empty}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-medium">{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/60">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-700/30 transition-colors">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-white/90">{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
