import { API_KEY_STORAGE_KEY } from '../utils/constants';

export const getApiKey = (): string =>
  localStorage.getItem(API_KEY_STORAGE_KEY) || '';

export const setApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const clearApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

export const keyPreview = (key: string): string => {
  if (!key) return '未设置';
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
};
