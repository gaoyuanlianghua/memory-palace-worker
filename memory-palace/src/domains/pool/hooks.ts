import { usePolling } from '../../shared/hooks';
import { poolApi } from './api';

export function usePoolStatus() {
  return usePolling(() => poolApi.status(), 30000);
}
