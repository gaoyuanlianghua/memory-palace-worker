import type {
  Task,
  MemoryStats,
  LogEntry,
} from '../types';

const API_BASE = '/api';

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

interface AgentInfo {
  agent_id: string;
  wallet: string;
  status: string;
  balance: number;
  experience: number;
}

interface AgentListResponse {
  agents: AgentInfo[];
}

interface TasksResponse {
  tasks: Task[];
  count: number;
}

interface AuditResponse {
  logs: LogEntry[];
  count: number;
}

interface PoolStatusResponse {
  pool: {
    balance: number;
    total_wallets: number;
    total_agents: number;
    active_tasks: number;
  };
}

interface SemanticStatusResponse {
  concepts: number;
  edges: number;
}

interface SystemStatsResponse {
  stats: {
    total_wallets: number;
    total_agents: number;
    active_tasks: number;
    system_pool: number;
  };
}

export const api = {
  // GET endpoints
  getStatus: () => fetchAPI<any>('/palace/status'),

  getClones: () => fetchAPI<AgentListResponse>('/agent/list'),

  getTasks: () => fetchAPI<TasksResponse>('/tasks/active'),

  getMemoryStats: () => fetchAPI<MemoryStats>('/memory/list'),

  getLogs: () => fetchAPI<AuditResponse>('/audit/list'),

  getCacheStats: () => fetchAPI<PoolStatusResponse>('/pool/status'),

  getPatterns: () => fetchAPI<SemanticStatusResponse>('/semantic/status'),

  getQualityStats: () => fetchAPI<SystemStatsResponse>('/system/stats'),

  getGraphData: () => fetchAPI<SemanticStatusResponse>('/semantic/status'),

  getSharedPool: () => fetchAPI<PoolStatusResponse>('/pool/status'),

  // POST endpoints
  executeTask: (taskId: string) =>
    fetchAPI('/task/claim', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    }),

  collectExternal: (url: string) =>
    fetchAPI('/collect-external', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  getRecommendations: () =>
    fetchAPI('/semantic/search', {
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
    fetchAPI('/clone/identity', {
      method: 'POST',
      body: JSON.stringify({ cloneId }),
    }),

  analyzeHistory: (cloneId: string) =>
    fetchAPI('/clone/recover', {
      method: 'POST',
      body: JSON.stringify({ cloneId }),
    }),

  calculateWeights: () =>
    fetchAPI('/pool/auto_expand_status', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  detectConflicts: () =>
    fetchAPI('/bug/list', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  sendMessage: (from: string, to: string, message: string) =>
    fetchAPI('/clone/recover', {
      method: 'POST',
      body: JSON.stringify({ from, to, message }),
    }),

  delegate: (from: string, to: string, taskId: string) =>
    fetchAPI('/task/claim', {
      method: 'POST',
      body: JSON.stringify({ from, to, taskId }),
    }),

  selfImprove: (cloneId: string) =>
    fetchAPI('/clone/create', {
      method: 'POST',
      body: JSON.stringify({ cloneId }),
    }),
};
