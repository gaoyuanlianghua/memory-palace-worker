import { create } from 'zustand';
import { getApiKey, keyPreview } from '../../shared/api/auth';
import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';

interface AppState {
  apiKey: string;
  keyText: string;
  isAdmin: boolean;
  /** 是否已完成管理员权限探测（true 之后 isAdmin 才是可信值） */
  adminChecked: boolean;
  /** 是否正在探测中 */
  checkingAdmin: boolean;
  /** 探测当前 API Key 是否具备管理员权限 */
  checkAdmin: () => Promise<void>;
  /** 更新 API Key 并触发重新探测 */
  refreshKey: () => void;
}

export const useAppStore = create<AppState>((set, get) => {
  const checkAdmin = async () => {
    if (get().checkingAdmin) return;
    set({ checkingAdmin: true });
    try {
      // 未配置 Key 直接判定为非管理员
      if (!getApiKey()) {
        set({ isAdmin: false, adminChecked: true, checkingAdmin: false });
        return;
      }
      // 探测管理员专属端点：普通 Key 会被后端 401/403 拒绝
      await request<unknown>(ENDPOINTS.wallet.keys.path, { method: 'GET' });
      set({ isAdmin: true, adminChecked: true, checkingAdmin: false });
    } catch {
      // 401（Key 无效）/403（无权限）/网络错误一律视为非管理员
      set({ isAdmin: false, adminChecked: true, checkingAdmin: false });
    }
  };

  return {
    apiKey: getApiKey(),
    keyText: keyPreview(getApiKey()),
    isAdmin: false,
    adminChecked: false,
    checkingAdmin: false,
    checkAdmin,
    refreshKey: () => {
      const k = getApiKey();
      set({ apiKey: k, keyText: keyPreview(k) });
      void checkAdmin();
    },
  };
});
