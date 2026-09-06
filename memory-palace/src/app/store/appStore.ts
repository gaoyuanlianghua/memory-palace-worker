import { create } from 'zustand';
import { getApiKey, keyPreview } from '../../shared/api/auth';

interface AppState {
  apiKey: string;
  keyText: string;
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;
  refreshKey: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  apiKey: getApiKey(),
  keyText: keyPreview(getApiKey()),
  isAdmin: false,
  setAdmin: (v) => set({ isAdmin: v }),
  refreshKey: () => {
    const k = getApiKey();
    set({ apiKey: k, keyText: keyPreview(k) });
  },
}));
