export const ENDPOINTS = {
  palace: {
    status: { path: '/api/palace/status', method: 'GET', cache: true },
    blocks: { path: '/api/palace/blocks', method: 'GET' },
    trades: { path: '/api/palace/trades', method: 'GET' },
    rooms: { path: '/api/rooms/status', method: 'GET' },
    command: { path: '/api/palace/command', method: 'POST' },
    store: { path: '/api/palace/store', method: 'POST' },
    trade: { path: '/api/palace/trade', method: 'POST' },
  },
  system: {
    stats: { path: '/api/system/stats', method: 'GET' },
    pool: { path: '/api/system/pool', method: 'GET' },
  },
  wallet: {
    register: { path: '/api/wallet/register', method: 'POST' },
    info: { path: '/api/wallet/info', method: 'GET' },
    keys: { path: '/api/wallet/keys', method: 'GET', admin: true },
    profile: { path: '/api/wallet/profile', method: 'GET' },
    rotateKey: { path: '/api/wallet/rotate-key', method: 'POST', admin: true },
  },
  agent: {
    list: { path: '/api/agent/list', method: 'GET' },
    whoami: { path: '/api/agent/whoami', method: 'GET' },
    describe: { path: '/api/agent/describe', method: 'GET' },
    bind: { path: '/api/agent/bind', method: 'POST' },
    nodeList: { path: '/api/node/list', method: 'GET' },
    clones: { path: '/api/clones', method: 'GET' },
    cloneStatus: { path: '/api/clone/status', method: 'GET' },
    cloneRecover: { path: '/api/clone/recover', method: 'GET' },
    cloneIsolate: { path: '/api/clone/isolate', method: 'POST' },
    cloneQuarantine: { path: '/api/clone/quarantine', method: 'POST' },
  },
  task: {
    active: { path: '/api/tasks/active', method: 'GET', cache: true },
    create: { path: '/api/task/create', method: 'POST' },
    claim: { path: '/api/task/claim', method: 'POST' },
    complete: { path: '/api/task/complete', method: 'POST' },
    remove: { path: '/api/task/delete', method: 'POST' },
    clearAll: { path: '/api/task/clear-all', method: 'POST' },
  },
  memory: {
    list: { path: '/api/memory/list', method: 'GET' },
    detail: { path: '/api/memory/detail', method: 'GET' },
    create: { path: '/api/memory/create', method: 'POST' },
    remove: { path: '/api/memory/delete', method: 'POST' },
    search: { path: '/api/memory/search', method: 'GET' },
    export: { path: '/api/memory/export', method: 'GET' },
  },
  graph: {
    status: { path: '/api/graph/status', method: 'GET' },
    nodes: { path: '/api/graph/nodes', method: 'GET' },
    semantic: { path: '/api/semantic/status', method: 'GET' },
  },
  pool: {
    status: { path: '/api/pool/status', method: 'GET' },
    expand: { path: '/api/pool/expand', method: 'POST' },
    airdrop: { path: '/api/pool/airdrop', method: 'POST', admin: true },
    decay: { path: '/api/pool/decay', method: 'POST', admin: true },
  },
  audit: {
    list: { path: '/api/audit/list', method: 'GET' },
    commands: { path: '/api/command/list', method: 'GET' },
  },
} as const;

export const ADMIN_PATHS: ReadonlySet<string> = new Set([
  '/api/wallet/keys',
  '/api/wallet/rotate-key',
  '/api/pool/airdrop',
  '/api/pool/decay',
]);
