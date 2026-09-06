import { useEffect, useState, useCallback } from 'react';
import { broadcastApi } from './api';
import { useWalletStore } from '../wallet/store';
import type { BroadcastSchedule } from './types';

/** 当前钱包地址（跨领域只读身份，Phase 2 通用） */
export function useWalletAddress(): string {
  return useWalletStore((s) => s.info?.wallet ?? '');
}

export function useSchedules(wallet: string) {
  const [schedules, setSchedules] = useState<BroadcastSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!wallet) {
      setSchedules([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    broadcastApi.list(wallet)
      .then((r) => { setSchedules(r.schedules); setError(null); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [wallet]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { schedules, loading, error, refresh };
}
