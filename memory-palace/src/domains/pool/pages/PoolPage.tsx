import { SectionTitle, Spinner } from '../../../shared/ui';
import { usePoolStatus } from '../hooks';
import { PoolStats } from '../components/PoolStats';
import { AdminActions } from '../components/AdminActions';

export function PoolPage() {
  const { data, loading, refresh } = usePoolStatus();
  return (
    <div className="space-y-6">
      <SectionTitle
        title="系统池"
        subtitle="经济池状态与调控（管理员）"
        action={
          <button onClick={() => void refresh()} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500">
            ⟳ 刷新
          </button>
        }
      />
      {loading && !data ? <Spinner text="加载系统池..." /> : <PoolStats pool={data?.pool ?? null} />}
      <AdminActions onDone={() => void refresh()} />
    </div>
  );
}
