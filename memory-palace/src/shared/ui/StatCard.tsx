export function StatCard({ label, value, icon, change }: {
  label: string;
  value: string | number;
  icon: string;
  change?: string;
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {change && (
          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">{change}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mt-3">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}
