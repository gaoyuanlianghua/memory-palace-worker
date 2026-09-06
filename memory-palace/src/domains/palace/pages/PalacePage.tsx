import { SectionTitle, Spinner } from '../../../shared/ui';
import { usePalaceStatus, usePalaceBlocks, usePalaceTrades } from '../hooks';
import { StatusGrid } from '../components/StatusGrid';
import { BlockList } from '../components/BlockList';
import { TradeTable } from '../components/TradeTable';

export function PalacePage() {
  const { data: status, loading, refresh } = usePalaceStatus();
  const { data: blocks } = usePalaceBlocks();
  const { data: trades } = usePalaceTrades();

  return (
    <div className="space-y-6">
      <SectionTitle
        title="系统仪表盘"
        subtitle="记忆宫殿分身系统实时监控"
        action={
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all"
          >
            ⟳ 刷新数据
          </button>
        }
      />
      {loading && !status ? (
        <Spinner text="加载系统数据中..." />
      ) : (
        <>
          <StatusGrid status={status} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BlockList blocks={blocks?.blocks ?? []} />
            <TradeTable trades={trades?.trades ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
