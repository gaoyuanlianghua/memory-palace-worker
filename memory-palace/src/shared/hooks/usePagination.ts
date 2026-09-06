import { useCallback, useMemo, useState } from 'react';

interface UsePaginationOptions {
  total: number;
  pageSize?: number;
}

export function usePagination({ total, pageSize = 20 }: UsePaginationOptions) {
  const [page, setPage] = useState(1);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const next = useCallback(() => setPage((p) => Math.min(p + 1, totalPages)), [totalPages]);
  const prev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goto = useCallback((p: number) => setPage(Math.min(Math.max(1, p), totalPages)), [totalPages]);

  return { page, totalPages, pageSize, next, prev, setPage: goto };
}
