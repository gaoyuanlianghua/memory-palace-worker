import { SectionTitle, Spinner } from '../../../shared/ui';
import { useMiningStatus, useMiningBackground, useMiningConfig, useWalletAddress } from '../hooks';
import { MiningStats } from '../components/MiningStats';
import { GlobalStats } from '../components/GlobalStats';
import { ConfigPanel } from '../components/ConfigPanel';

export function MiningPage() {
  const { data: status, loading } = useMiningStatus();
  const { data: background, refresh: refreshBg } = useMiningBackground();
  const { data: config, refresh: refreshConfig } = useMiningConfig();
  const wallet = useWalletAddress();

  return (
    <div className="space-y-6">
      <SectionTitle
        title="挖矿系统"
        subtitle="节点算力与记忆挖矿监控"
        action={
          <button onClick={refreshBg} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all">
            ⟳ 刷新数据
          </button>
        }
      />
      {loading && !status ? <Spinner text="加载挖矿数据中..." /> : (
        <>
          {status && <MiningStats status={status} />}
          {background && <GlobalStats data={background} />}
          {config && (
            <ConfigPanel
              config={config}
              wallet={wallet}
              onChanged={() => { void refreshConfig(); void refreshBg(); }}
            />
          )}
        </>
      )}
    </div>
  );
}
