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

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
  };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch {
    throw new ApiError('网络请求失败，请检查后端服务是否可用', 0);
  }

  if (!response.ok) {
    if (response.status === 401) throw new ApiError('API Key 无效或已过期，请检查认证信息', 401);
    if (response.status === 403) throw new ApiError('权限不足，需要更高级别的 API Key', 403);
    if (response.status === 429) throw new ApiError('请求过于频繁，请稍后再试', 429);
    throw new ApiError(`API Error: ${response.status} ${response.statusText}`, response.status);
  }

  return response.json() as Promise<T>;
}
