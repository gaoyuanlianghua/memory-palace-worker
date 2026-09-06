import { usePolling } from '../../shared/hooks';
import { miningApi } from './api';
import { useWalletStore } from '../wallet/store';

export function useMiningStatus() {
  return usePolling(() => miningApi.status(), 30000);
}

export function useMiningBackground() {
  return usePolling(() => miningApi.background(), 30000);
}

export function useMiningConfig() {
  return usePolling(() => miningApi.config(), 30000);
}

/** 当前钱包地址（Phase 2 需 wallet 参数的端点共用） */
export function useWalletAddress(): string {
  return useWalletStore((s) => s.info?.wallet ?? '');
}
