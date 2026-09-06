export function Empty({ text = '暂无数据' }: { text?: string }) {
  return <p className="text-sm text-gray-500 text-center py-8">{text}</p>;
}
