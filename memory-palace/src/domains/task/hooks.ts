import { useCallback, useState } from 'react';
import { usePolling } from '../../shared/hooks';
import { taskApi } from './api';

export function useTasks() {
  const { data, loading, error, refresh } = usePolling(() => taskApi.active(), 30000);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const act = useCallback(async (fn: () => Promise<unknown>, taskId: string) => {
    setBusyId(taskId);
    try {
      await fn();
      setMessage('操作成功');
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }, [refresh]);

  const claim = useCallback((taskId: string, wallet: string) => act(() => taskApi.claim(taskId, wallet), taskId), [act]);
  const complete = useCallback((taskId: string, wallet: string, result: string) => act(() => taskApi.complete(taskId, wallet, result), taskId), [act]);

  return { tasks: data?.tasks ?? [], loading, error, refresh, busyId, message, claim, complete };
}
