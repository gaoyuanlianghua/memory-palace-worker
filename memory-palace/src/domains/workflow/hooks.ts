import { useEffect, useState, useCallback } from 'react';
import { workflowApi } from './api';
import { useWalletStore } from '../wallet/store';
import type { WorkflowJob } from './types';

export function useWalletAddress(): string {
  return useWalletStore((s) => s.info?.wallet ?? '');
}

export function useWorkflowJobs() {
  const [jobs, setJobs] = useState<WorkflowJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    workflowApi.list()
      .then((r) => { setJobs(r.jobs); setError(null); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { jobs, loading, error, refresh };
}
