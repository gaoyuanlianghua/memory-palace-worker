import { getApiKey } from './auth';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * 多端点候选列表（逗号分隔，构建时通过 VITE_API_ORIGINS 注入）。
 * 留空 = 同源相对路径请求（跟随部署域名）。
 * 例：VITE_API_ORIGINS=https://agent.gyuanpalace.xyz,https://api.dihuangbox.com,https://api.lingdayun.cn
 */
function getApiOrigins(): string[] {
  const raw: string = String(import.meta.env.VITE_API_ORIGINS ?? '');
  return raw
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

/** 当前选中的端点下标；-1 = 同源 */
let currentIdx = -1;
let probePromise: Promise<void> | null = null;

const PROBE_PATH = '/api/palace/status';
const PROBE_TIMEOUT_MS = 1500;

function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(t) };
}

/** 探测单个端点延迟，不可用返回 null */
async function pingOrigin(origin: string): Promise<number | null> {
  const start = performance.now();
  const { signal, clear } = withTimeout(PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(`${origin}${PROBE_PATH}`, {
      headers: { 'Content-Type': 'application/json' },
      signal,
    });
    if (!res.ok) return null;
    return performance.now() - start;
  } catch {
    return null;
  } finally {
    clear();
  }
}

async function doProbe(): Promise<void> {
  const origins = getApiOrigins();
  if (origins.length === 0) return;
  const results = await Promise.all(
    origins.map(async (origin, i) => ({ i, latency: await pingOrigin(origin) })),
  );
  const alive = results
    .filter((r): r is { i: number; latency: number } => r.latency !== null)
    .sort((a, b) => a.latency - b.latency);
  // 就近选择：延迟最低的可用端点；全部不可用时回退同源
  currentIdx = alive[0]?.i ?? -1;
}

/** 保证至少探测一次（幂等，多端点配置下首个请求前完成就近选择） */
export function ensureProbed(): Promise<void> {
  if (getApiOrigins().length === 0) return Promise.resolve();
  probePromise ??= doProbe();
  return probePromise;
}

/** 将失败请求切换到下一个候选端点；无可切换时返回 false */
function failover(): boolean {
  const origins = getApiOrigins();
  if (origins.length === 0) return false;
  const next = (currentIdx + 1) % origins.length;
  if (next === currentIdx) return false;
  currentIdx = next;
  return true;
}

function resolveUrl(path: string): string {
  const origins = getApiOrigins();
  return currentIdx >= 0 ? `${origins[currentIdx]}${path}` : path;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
  };

  await ensureProbed();

  const origins = getApiOrigins();
  for (let attempt = 0; attempt <= origins.length; attempt++) {
    let response: Response;
    try {
      response = await fetch(resolveUrl(endpoint), {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: options.signal,
      });
    } catch {
      // 网络错误：切换端点重试
      if (failover()) continue;
      throw new ApiError('网络请求失败，请检查后端服务是否可用', 0);
    }

    if (!response.ok) {
      if (response.status === 401) throw new ApiError('API Key 无效或已过期，请检查认证信息', 401);
      if (response.status === 403) throw new ApiError('权限不足，需要更高级别的 API Key', 403);
      if (response.status === 429) throw new ApiError('请求过于频繁，请稍后再试', 429);
      // 5xx：节点故障，切换重试
      if (response.status >= 500 && failover()) continue;
      throw new ApiError(`API Error: ${response.status} ${response.statusText}`, response.status);
    }

    return response.json() as Promise<T>;
  }

  throw new ApiError('所有 API 节点均不可用', 0);
}
