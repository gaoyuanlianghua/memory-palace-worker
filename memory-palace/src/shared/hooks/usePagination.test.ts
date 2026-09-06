import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usePagination';

describe('usePagination', () => {
  it('分页状态与翻页正确', () => {
    const { result } = renderHook(() => usePagination({ total: 100, pageSize: 20 }));
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(5);
    act(() => result.current.next());
    expect(result.current.page).toBe(2);
    act(() => result.current.prev());
    expect(result.current.page).toBe(1);
    act(() => result.current.setPage(5));
    expect(result.current.page).toBe(5);
    act(() => result.current.next());
    expect(result.current.page).toBe(5); // 不越界
  });
});
