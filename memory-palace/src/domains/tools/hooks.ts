import { useAsync } from '../../shared/hooks';
import { toolsApi } from './api';

export function useLibrary(wallet: string) {
  return useAsync(() => (wallet ? toolsApi.library(wallet) : Promise.resolve(null)), [wallet]);
}

export function usePreference(wallet: string) {
  return useAsync(() => (wallet ? toolsApi.preference(wallet) : Promise.resolve(null)), [wallet]);
}

export function useToolStats(wallet: string) {
  return useAsync(() => (wallet ? toolsApi.stats(wallet) : Promise.resolve(null)), [wallet]);
}

export function useAgentTools(wallet: string, agentId: string) {
  return useAsync(
    () => (wallet && agentId ? toolsApi.agentTools(wallet, agentId) : Promise.resolve(null)),
    [wallet, agentId],
  );
}
