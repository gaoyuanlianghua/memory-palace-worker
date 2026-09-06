import type { ReactNode } from 'react';

export function Card({ title, icon, children, className = '', action }: {
  title?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {title && (
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            {icon && <span>{icon}</span>}
            {title}
          </h2>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
