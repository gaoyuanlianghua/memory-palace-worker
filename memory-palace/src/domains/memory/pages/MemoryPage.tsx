import { SectionTitle, Spinner } from '../../../shared/ui';
import { useMemories } from '../hooks';
import { MemoryTimeline } from '../components/MemoryTimeline';
import { MemoryForm } from '../components/MemoryForm';

export function MemoryPage() {
  const { total, loading, refresh } = useMemories();
  return (
    <div className="space-y-6">
      <SectionTitle
        title="记忆系统"
        subtitle={`记忆链管理（共 ${total} 条）`}
        action={
          <button onClick={() => void refresh()} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500">
            ⟳ 刷新
          </button>
        }
      />
      {loading ? (
        <Spinner text="加载记忆链..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><MemoryTimeline /></div>
          <MemoryForm onCreated={() => void refresh()} />
        </div>
      )}
    </div>
  );
}
