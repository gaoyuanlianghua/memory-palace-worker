import { useAsync } from '../../shared/hooks';
import { heatmapApi } from './api';

export function useHeatStatus(wallet: string) {
  return useAsync(() => (wallet ? heatmapApi.status(wallet) : Promise.resolve(null)), [wallet]);
}

export function useToolHeat(wallet: string) {
  return useAsync(() => (wallet ? heatmapApi.tool(wallet) : Promise.resolve(null)), [wallet]);
}

export function useConversationTrend(wallet: string) {
  return useAsync(() => (wallet ? heatmapApi.conversation(wallet) : Promise.resolve(null)), [wallet]);
}

export function useMemoryHeat(wallet: string) {
  return useAsync(() => (wallet ? heatmapApi.memory(wallet) : Promise.resolve(null)), [wallet]);
}
