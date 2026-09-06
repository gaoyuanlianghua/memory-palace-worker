import { lazy } from 'react';

export const PalacePage = lazy(() => import('../../domains/palace/pages/PalacePage').then((m) => ({ default: m.PalacePage })));
export const SystemPage = lazy(() => import('../../domains/system/pages/SystemPage').then((m) => ({ default: m.SystemPage })));
export const WalletPage = lazy(() => import('../../domains/wallet/pages/WalletPage').then((m) => ({ default: m.WalletPage })));
export const AgentPage = lazy(() => import('../../domains/agent/pages/AgentPage').then((m) => ({ default: m.AgentPage })));
export const TaskPage = lazy(() => import('../../domains/task/pages/TaskPage').then((m) => ({ default: m.TaskPage })));
export const MemoryPage = lazy(() => import('../../domains/memory/pages/MemoryPage').then((m) => ({ default: m.MemoryPage })));
export const GraphPage = lazy(() => import('../../domains/graph/pages/GraphPage').then((m) => ({ default: m.GraphPage })));
export const PoolPage = lazy(() => import('../../domains/pool/pages/PoolPage').then((m) => ({ default: m.PoolPage })));
export const AuditPage = lazy(() => import('../../domains/audit/pages/AuditPage').then((m) => ({ default: m.AuditPage })));
