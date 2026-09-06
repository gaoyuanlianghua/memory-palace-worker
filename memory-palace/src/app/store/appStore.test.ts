import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from './appStore';
import { setApiKey, clearApiKey } from '../../shared/api/auth';

describe('appStore 管理员权限探测', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    useAppStore.setState({ isAdmin: false, adminChecked: false, checkingAdmin: false });
  });

  it('未配置 API Key 时判定为非管理员', async () => {
    clearApiKey();
    await useAppStore.getState().checkAdmin();
    const s = useAppStore.getState();
    expect(s.adminChecked).toBe(true);
    expect(s.isAdmin).toBe(false);
  });

  it('管理员 Key 探测 /api/wallet/keys 成功 → isAdmin=true', async () => {
    setApiKey('admin-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ keys: [] }) }));
    await useAppStore.getState().checkAdmin();
    expect(useAppStore.getState().isAdmin).toBe(true);
  });

  it('普通 Key 被 403 拒绝 → isAdmin=false', async () => {
    setApiKey('user-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await useAppStore.getState().checkAdmin();
    expect(useAppStore.getState().isAdmin).toBe(false);
  });

  it('网络错误 → 判定为非管理员且完成探测', async () => {
    setApiKey('any-key');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')));
    await useAppStore.getState().checkAdmin();
    const s = useAppStore.getState();
    expect(s.adminChecked).toBe(true);
    expect(s.isAdmin).toBe(false);
  });
});
