import { useState } from 'react';
import { SectionTitle, Spinner } from '../../../shared/ui';
import { useDebts, useWalletAddress } from '../hooks';
import { DebtTable } from '../components/DebtTable';
import { IssueForm } from '../components/IssueForm';
import { debtApi } from '../api';
import type { Debt } from '../types';

export function DebtPage() {
  const wallet = useWalletAddress();
  const { debts, loading, refresh } = useDebts();
  const [msg, setMsg] = useState<string | null>(null);

  const repay = async (debt: Debt) => {
    if (!wallet) return;
    setMsg(null);
    try {
      const r = await debtApi.repay(debt.debt_id, wallet);
      setMsg(`已偿还 ${debt.debt_id}，支付 ${r.total_paid ?? debt.amount} MC`);
      refresh();
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setMsg(err.includes('balance') || err.includes('余额') ? '余额不足，请先充值' : err);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="债务管理" subtitle="债务发行与偿还" />
      {msg && <p className="text-xs text-green-400">{msg}</p>}
      {loading && debts.length === 0 ? <Spinner text="加载债务中..." /> : (
        <DebtTable debts={debts} wallet={wallet} onRepay={repay} />
      )}
      <IssueForm wallet={wallet} onIssued={refresh} />
    </div>
  );
}
