import { SectionTitle, Spinner } from '../../../shared/ui';
import { useWalletSession } from '../hooks';
import { WalletRegister } from '../components/WalletRegister';
import { WalletInfo } from '../components/WalletInfo';
import { WalletKeys } from '../components/WalletKeys';

export function WalletPage() {
  const { info, loading, loadInfo } = useWalletSession();

  return (
    <div className="space-y-6">
      <SectionTitle title="钱包管理" subtitle="钱包注册、资产与密钥管理" />
      <WalletRegister onRegistered={() => void loadInfo()} />
      {loading && !info ? <Spinner text="加载钱包信息..." /> : <WalletInfo info={info} />}
      <WalletKeys />
    </div>
  );
}
