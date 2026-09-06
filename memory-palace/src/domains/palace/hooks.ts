import { usePolling, useAsync } from '../../shared/hooks';
import { palaceApi } from './api';

export function usePalaceStatus() {
  return usePolling(() => palaceApi.getStatus(), 30000);
}

export function usePalaceBlocks() {
  return useAsync(() => palaceApi.getBlocks(), []);
}

export function usePalaceTrades() {
  return useAsync(() => palaceApi.getTrades(), []);
}
