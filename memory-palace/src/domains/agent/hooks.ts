import { useEffect } from 'react';
import { useAgentStore } from './store';

export function useAgents() {
  const { agents, loading, error, load } = useAgentStore();
  useEffect(() => {
    void load();
  }, [load]);
  return { agents, loading, error, load };
}
