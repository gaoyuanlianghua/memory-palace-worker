import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('http 多端点探测与故障切换', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('就近选择延迟最低的可用端点', async () => {
    vi.stubEnv('VITE_API_ORIGINS', 'https://a.example.com,https://b.example.com');
    vi.resetModules();
    const { request } = await import('./http');

    // ping a 慢（20ms），ping b 快（0ms）
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise((r) => setTimeout(() => r({ ok: true, json: async () => ({ ok: true }) }), 20)))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ ok: true }) }))
      .mockResolvedValue({ ok: true, json: async () => ({ hello: 'b' }) });
    vi.stubGlobal('fetch', fetchMock);

    const data = await request('/api/palace/status');
    expect(data).toEqual({ hello: 'b' });
    // 前两次是探测 ping，第三次业务请求应命中延迟更低的 b
    expect(fetchMock.mock.calls[2][0]).toBe('https://b.example.com/api/palace/status');
  });

  it('所有端点探测失败时回退同源请求', async () => {
    vi.stubEnv('VITE_API_ORIGINS', 'https://a.example.com,https://b.example.com');
    vi.resetModules();
    const { request } = await import('./http');

    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError('down'))
      .mockRejectedValueOnce(new TypeError('down'))
      .mockResolvedValue({ ok: true, json: async () => ({ hello: 'origin' }) });
    vi.stubGlobal('fetch', fetchMock);

    const data = await request('/api/x');
    expect(data).toEqual({ hello: 'origin' });
    expect(fetchMock.mock.calls[2][0]).toBe('/api/x');
  });

  it('首节点网络失败时自动切换下一节点重试', async () => {
    vi.stubEnv('VITE_API_ORIGINS', 'https://a.example.com,https://b.example.com');
    vi.resetModules();
    const { request } = await import('./http');

    const fetchMock = vi.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ ok: true }) })) // ping a 快
      .mockImplementationOnce(() => new Promise((r) => setTimeout(() => r({ ok: true, json: async () => ({ ok: true }) }), 20))) // ping b 慢
      .mockRejectedValueOnce(new TypeError('down')) // 业务请求 a 网络失败
      .mockResolvedValue({ ok: true, json: async () => ({ hello: 'b' }) }); // 切换到 b 成功
    vi.stubGlobal('fetch', fetchMock);

    const data = await request('/api/x');
    expect(data).toEqual({ hello: 'b' });
    expect(fetchMock.mock.calls[3][0]).toBe('https://b.example.com/api/x');
  });

  it('节点返回 5xx 时切换下一节点重试', async () => {
    vi.stubEnv('VITE_API_ORIGINS', 'https://a.example.com,https://b.example.com');
    vi.resetModules();
    const { request } = await import('./http');

    const fetchMock = vi.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ ok: true }) })) // ping a 快
      .mockImplementationOnce(() => new Promise((r) => setTimeout(() => r({ ok: true, json: async () => ({ ok: true }) }), 20))) // ping b 慢
      .mockResolvedValueOnce({ ok: false, status: 503 }) // 请求 a → 503
      .mockResolvedValue({ ok: true, json: async () => ({ hello: 'b' }) }); // b 成功
    vi.stubGlobal('fetch', fetchMock);

    const data = await request('/api/x');
    expect(data).toEqual({ hello: 'b' });
    expect(fetchMock.mock.calls[3][0]).toBe('https://b.example.com/api/x');
  });

  it('所有节点 5xx 时报错', async () => {
    vi.stubEnv('VITE_API_ORIGINS', 'https://a.example.com,https://b.example.com');
    vi.resetModules();
    const { request } = await import('./http');

    const fetchMock = vi.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => ({ ok: true }) })) // ping a
      .mockImplementationOnce(() => new Promise((r) => setTimeout(() => r({ ok: true, json: async () => ({ ok: true }) }), 20))) // ping b 慢
      .mockResolvedValue({ ok: false, status: 503 });
    vi.stubGlobal('fetch', fetchMock);

    await expect(request('/api/x')).rejects.toThrow('所有 API 节点均不可用');
  });
});
