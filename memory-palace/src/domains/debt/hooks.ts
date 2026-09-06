import { useEffect, useState, useCallback } from 'react';
import { debtApi } from './api';
import { useWalletStore } from '../wallet/store';
import type { Debt } from './types';

export function useWalletAddress(): string {
  return useWalletStore((s) => s.info?.wallet ?? '');
}

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    debtApi.list()
      .then((r) => { setDebts(r.debts); setError(null); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { debts, loading, error, refresh };
}
