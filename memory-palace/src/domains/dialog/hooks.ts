import { useAsync } from '../../shared/hooks';
import { dialogApi } from './api';

export function useDialogCache(wallet: string) {
  return useAsync(() => (wallet ? dialogApi.cache(wallet) : Promise.resolve(null)), [wallet]);
}
