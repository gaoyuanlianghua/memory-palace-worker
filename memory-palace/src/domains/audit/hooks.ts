import { useEffect, useMemo, useState } from 'react';
import { usePagination } from '../../shared/hooks';
import { auditApi } from './api';
import type { LogEntry } from './types';

export function useAuditLogs(pageSize = 20) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { page, totalPages, setPage } = usePagination({ total: logs.length, pageSize });

  useEffect(() => {
    auditApi.list()
      .then((r) => { setLogs(r.network_logs); setLoading(false); })
      .catch((e: unknown) => { setError(e instanceof Error ? e.message : String(e)); setLoading(false); });
  }, []);

  const pageRows = useMemo(() => logs.slice((page - 1) * pageSize, page * pageSize), [logs, page, pageSize]);

  return { logs: pageRows, total: logs.length, page, totalPages, setPage, loading, error };
}
