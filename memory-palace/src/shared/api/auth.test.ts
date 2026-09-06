import { describe, it, expect, beforeEach } from 'vitest';
import { getApiKey, setApiKey } from './auth';
import { API_KEY_STORAGE_KEY } from '../utils/constants';

describe('auth', () => {
  beforeEach(() => localStorage.clear());

  it('未设置时返回空字符串', () => {
    expect(getApiKey()).toBe('');
  });

  it('setApiKey 后 getApiKey 返回相同值', () => {
    setApiKey('test-key');
    expect(localStorage.getItem(API_KEY_STORAGE_KEY)).toBe('test-key');
    expect(getApiKey()).toBe('test-key');
  });
});
