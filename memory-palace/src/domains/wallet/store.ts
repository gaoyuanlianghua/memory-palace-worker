import { create } from 'zustand';
import { walletApi } from './api';
import type { WalletInfoResponse } from './types';

interface WalletState {
  info: WalletInfoResponse | null;
  loading: boolean;
  error: string | null;
  loadInfo: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  info: null,
  loading: false,
  error: null,
  loadInfo: async () => {
    set({ loading: true, error: null });
    try {
      const info = await walletApi.getInfo();
      set({ info, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },
}));
