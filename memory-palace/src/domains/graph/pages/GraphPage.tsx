import { useState } from 'react';
import { SectionTitle, Spinner, Card } from '../../../shared/ui';
import { useGraph } from '../hooks';
import { GraphCanvas } from '../components/GraphCanvas';

export function GraphPage() {
  const { vm, loading, refresh } = useGraph(500, 400);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="知识图谱"
        subtitle="节点网络语义连接可视化"
        action={
          <button onClick={() => void refresh()} className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-500">
            ⟳ 刷新图谱
          </button>
        }
      />
      {loading || !vm ? (
        <Spinner text="构建知识图谱..." color="border-purple-500" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '节点总数', value: vm.stats.total_nodes, color: 'text-purple-400' },
              { label: '连接数', value: vm.stats.total_connections, color: 'text-blue-400' },
              { label: '记忆数量', value: vm.stats.total_memories, color: 'text-green-400' },
            ].map((s) => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <Card title="网络拓扑" icon="🕸️">
            <GraphCanvas vm={vm} onSelect={setSelected} />
            {selected && (
              <p className="mt-3 text-sm text-gray-400">
                选中节点：<span className="font-mono text-purple-300">{selected}</span>
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
