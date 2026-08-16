import type {
  SystemStatus,
  Clone,
  Task,
  MemoryStats,
  GraphData,
  CacheStats,
  QualityStats,
  Pattern,
  SharedPool,
  LogEntry,
} from '../types';

const API_BASE = 'https://gyuanpalace.xyz/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // GET endpoints
  getStatus: () => fetchAPI<SystemStatus>('/status'),

  getClones: () => fetchAPI<{ clones: Clone[] }>('/clones'),

  getTasks: () => fetchAPI<{ tasks: Task[]; count: number }>('/tasks'),

  getMemoryStats: () => fetchAPI<MemoryStats>('/memory/stats'),

  getLogs: () => fetchAPI<{ logs: LogEntry[]; count: number }>('/logs'),

  getCacheStats: () => fetchAPI<{ cache: { stats: CacheStats } }>('/cache/stats'),

  getPatterns: () => fetchAPI<{ patterns: { patterns: Pattern[] } }>('/patterns'),

  getQualityStats: () => fetchAPI<QualityStats>('/quality/stats'),

  getGraphData: () => fetchAPI<GraphData>('/graph/data'),

  getSharedPool: () => fetchAPI<{ sharedPool: SharedPool }>('/shared/pool'),

  // POST endpoints
  executeTask: (taskId: string) =>
    fetchAPI('/execute', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    }),

  collectExternal: (url: string) =>
    fetchAPI('/collect-external', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  getRecommendations: () =>
    fetchAPI('/recommendations', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  shareContent: (content: unknown) =>
    fetchAPI('/share', {
      method: 'POST',
      body: JSON.stringify(content),
    }),

  fetchShared: () =>
    fetchAPI('/fetch-shared', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  organize: () =>
    fetchAPI('/organize', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  predict: () =>
    fetchAPI('/predict', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  assessClone: (cloneId: string) =>
    fetchAPI('/clone/assess', {
      method: 'POST',
      body: JSON.stringify({ cloneId }),
    }),

  analyzeHistory: (cloneId: string) =>
    fetchAPI('/clone/analyze-history', {
      method: 'POST',
      body: JSON.stringify({ cloneId }),
    }),

  calculateWeights: () =>
    fetchAPI('/graph/calculate-weights', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  detectConflicts: () =>
    fetchAPI('/graph/detect-conflicts', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  sendMessage: (from: string, to: string, message: string) =>
    fetchAPI('/clone/send-message', {
      method: 'POST',
      body: JSON.stringify({ from, to, message }),
    }),

  delegate: (from: string, to: string, taskId: string) =>
    fetchAPI('/clone/delegate', {
      method: 'POST',
      body: JSON.stringify({ from, to, taskId }),
    }),

  selfImprove: (cloneId: string) =>
    fetchAPI('/clone/self-improve', {
      method: 'POST',
      body: JSON.stringify({ cloneId }),
    }),
};
