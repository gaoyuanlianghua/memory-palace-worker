import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request } from './http';

describe('http', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('GET 请求注入 X-API-Key 头并解析 JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hello: 'world' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    localStorage.setItem('gyuanpalace_api_key', 'k123');

    const data = await request('/api/palace/status', { method: 'GET' });
    expect(data).toEqual({ hello: 'world' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/palace/status');
    expect(init.headers['X-API-Key']).toBe('k123');
  });

  it('401 抛出中文错误', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    await expect(request('/api/x', { method: 'GET' })).rejects.toThrow('API Key 无效或已过期');
  });

  it('405 抛出带状态码错误', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 405 }));
    await expect(request('/api/x', { method: 'GET' })).rejects.toThrow('405');
  });
});
