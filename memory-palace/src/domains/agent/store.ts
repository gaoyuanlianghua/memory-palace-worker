import { create } from 'zustand';
import { agentApi } from './api';
import type { AgentInfo } from './types';

interface AgentState {
  agents: AgentInfo[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  bind: (wallet: string, name: string) => Promise<boolean>;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  loading: false,
  error: null,
  load: async () => {
    set({ loading: true, error: null });
    try {
      const res = await agentApi.list();
      set({ agents: res.agents, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },
  bind: async (wallet, name) => {
    try {
      const res = await agentApi.bind(wallet, name);
      if (!res.bound) return false;
      await useAgentStore.getState().load();
      return true;
    } catch {
      return false;
    }
  },
}));
