import { useEffect, useState, useCallback } from 'react';
import { governanceApi } from './api';
import type { Bug, Proposal } from './types';

export function useBugs() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    governanceApi.listBugs()
      .then((r) => { setBugs(r.bugs); setError(null); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { bugs, loading, error, refresh };
}

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    governanceApi.listProposals()
      .then((r) => { setProposals(r.proposals); setError(null); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { proposals, loading, error, refresh };
}
