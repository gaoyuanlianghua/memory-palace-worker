export function Spinner({ text = '加载中...', color = 'border-blue-500' }: { text?: string; color?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${color} mx-auto mb-4`}></div>
        <p className="text-gray-400">{text}</p>
      </div>
    </div>
  );
}
