import { SectionTitle, Spinner, Empty } from '../../../shared/ui';
import { useWalletStore } from '../../wallet/store';
import { useHeatStatus, useToolHeat, useConversationTrend, useMemoryHeat } from '../hooks';
import { HeatScore } from '../components/HeatScore';
import { HeatmapGrid } from '../components/HeatmapGrid';
import { ToolHeat } from '../components/ToolHeat';
import { ConversationTrend } from '../components/ConversationTrend';
import { MemoryHeat } from '../components/MemoryHeat';

export function HeatmapPage() {
  const wallet = useWalletStore((s) => s.info?.wallet ?? '');
  const status = useHeatStatus(wallet);
  const tool = useToolHeat(wallet);
  const conv = useConversationTrend(wallet);
  const memory = useMemoryHeat(wallet);

  if (!wallet) {
    return (
      <div className="space-y-6">
        <SectionTitle title="热度图谱" subtitle="多维活动热度可视化" />
        <Empty text="请先在钱包管理注册钱包，以查看热度数据" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="热度图谱" subtitle="工具 / 节点 / 对话 / 记忆 多维热度" />

      {status.loading && !status.data ? <Spinner text="加载热度数据..." /> : status.error ? (
        <Empty text={status.error} />
      ) : status.data ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <HeatScore value={status.data.overall_heat} label="综合热度" />
            <div className="lg:col-span-2">
              <HeatmapGrid dimensions={status.data.dimensions} />
            </div>
          </div>
          {tool.data && <ToolHeat tools={tool.data.tools} />}
          {conv.data && <ConversationTrend trends={conv.data.trends} avgQuality={conv.data.avg_quality} />}
          {memory.data && <MemoryHeat data={memory.data} />}
        </>
      ) : null}
    </div>
  );
}
