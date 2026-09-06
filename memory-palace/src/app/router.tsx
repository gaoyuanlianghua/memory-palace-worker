import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Spinner } from '../shared/ui';
import {
  PalacePage, SystemPage, WalletPage, AgentPage,
  TaskPage, MemoryPage, GraphPage, PoolPage, AuditPage,
  MiningPage, BroadcastPage, WorkflowPage, DebtPage, GovernancePage,
  HeatmapPage, DialogPage, ToolsPage, ChinesePage,
} from './routes/lazy';
import { RequireAdmin } from './routes/guards';

const withSuspense = (node: React.ReactNode) => <Suspense fallback={<Spinner text="加载页面..." />}>{node}</Suspense>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<PalacePage />) },
      { path: 'wallet', element: withSuspense(<WalletPage />) },
      { path: 'agents', element: withSuspense(<AgentPage />) },
      { path: 'tasks', element: withSuspense(<TaskPage />) },
      { path: 'memory', element: withSuspense(<MemoryPage />) },
      { path: 'graph', element: withSuspense(<GraphPage />) },
      { path: 'pool', element: withSuspense(<RequireAdmin><PoolPage /></RequireAdmin>) },
      { path: 'system', element: withSuspense(<SystemPage />) },
      { path: 'audit', element: withSuspense(<RequireAdmin><AuditPage /></RequireAdmin>) },
      { path: 'mining', element: withSuspense(<MiningPage />) },
      { path: 'broadcast', element: withSuspense(<BroadcastPage />) },
      { path: 'workflow', element: withSuspense(<WorkflowPage />) },
      { path: 'debt', element: withSuspense(<DebtPage />) },
      { path: 'governance', element: withSuspense(<GovernancePage />) },
      { path: 'heatmap', element: withSuspense(<HeatmapPage />) },
      { path: 'dialog', element: withSuspense(<DialogPage />) },
      { path: 'tools', element: withSuspense(<ToolsPage />) },
      { path: 'chinese', element: withSuspense(<ChinesePage />) },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
