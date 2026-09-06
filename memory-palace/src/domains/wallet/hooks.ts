import { useEffect } from 'react';
import { useWalletStore } from './store';

export function useWalletSession() {
  const { info, loading, error, loadInfo } = useWalletStore();
  useEffect(() => {
    void loadInfo();
  }, [loadInfo]);
  return { info, loading, error, loadInfo };
}
