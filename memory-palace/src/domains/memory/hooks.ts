import { useCallback, useState } from 'react';
import { usePolling } from '../../shared/hooks';
import { memoryApi } from './api';

export function useMemories() {
  const { data, loading, error, refresh } = usePolling(() => memoryApi.detail(), 30000);
  const [typeFilter, setTypeFilter] = useState('全部');
  const [message, setMessage] = useState('');

  const remove = useCallback(async (id: string) => {
    try {
      await memoryApi.remove(id);
      setMessage('删除成功');
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }, [refresh]);

  const types = Array.from(new Set((data?.memories ?? []).map((m) => m.memory_type)));
  const filtered = typeFilter === '全部' ? data?.memories ?? [] : (data?.memories ?? []).filter((m) => m.memory_type === typeFilter);

  return { total: data?.count ?? 0, memories: filtered, types, typeFilter, setTypeFilter, loading, error, refresh, remove, message };
}
