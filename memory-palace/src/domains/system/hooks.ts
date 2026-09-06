import { usePolling } from '../../shared/hooks';
import { systemApi } from './api';

export function useSystemStats() {
  return usePolling(() => systemApi.getStats(), 30000);
}

export function useSystemPool() {
  return usePolling(() => systemApi.getPool(), 30000);
}
