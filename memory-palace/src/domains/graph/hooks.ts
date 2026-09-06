import { useMemo } from 'react';
import { usePolling } from '../../shared/hooks';
import { graphApi } from './api';
import { simulateLayout } from '../../shared/viz/force';
import { toGraphVM, type GraphVM } from './vm';

export function useGraph(width = 500, height = 400) {
  const { data, loading, error, refresh } = usePolling(() => graphApi.status(), 30000);
  const vm = useMemo((): GraphVM | null => {
    if (!data) return null;
    const raw = toGraphVM(data, width, height);
    return { ...raw, nodes: simulateLayout(raw.nodes, raw.edges, { iterations: 80, width, height }) as GraphVM['nodes'] };
  }, [data, width, height]);
  return { vm, loading, error, refresh };
}
