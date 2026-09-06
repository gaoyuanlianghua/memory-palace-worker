import { useState } from 'react';
import { SectionTitle, Spinner } from '../../../shared/ui';
import { useSchedules, useWalletAddress } from '../hooks';
import { ScheduleForm } from '../components/ScheduleForm';
import { ScheduleTable } from '../components/ScheduleTable';
import { WakePanel } from '../components/WakePanel';
import { broadcastApi } from '../api';
import type { BroadcastSchedule } from '../types';

export function BroadcastPage() {
  const wallet = useWalletAddress();
  const { schedules, loading, refresh } = useSchedules(wallet);
  const [msg, setMsg] = useState<string | null>(null);

  const toggle = async (s: BroadcastSchedule) => {
    try {
      await broadcastApi.update(s.id, wallet, { enabled: !s.enabled });
      setMsg(`已${s.enabled ? '停用' : '启用'} ${s.id}`);
      refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  const remove = async (id: string) => {
    try {
      await broadcastApi.remove(id, wallet);
      setMsg(`已删除 ${id}`);
      refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="广播调度" subtitle="定时广播与节点唤醒" />
      {msg && <p className="text-xs text-green-400">{msg}</p>}
      {loading && schedules.length === 0 ? <Spinner text="加载调度中..." /> : (
        <ScheduleTable schedules={schedules} wallet={wallet} onToggle={toggle} onDelete={remove} />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScheduleForm wallet={wallet} onCreated={refresh} />
        <WakePanel wallet={wallet} onDone={refresh} />
      </div>
    </div>
  );
}
