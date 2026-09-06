import { useAsync } from '../../shared/hooks';
import { chineseApi } from './api';

export function useChineseStats() {
  return useAsync(() => chineseApi.stats(), []);
}

export function useElementsCycle() {
  return useAsync(() => chineseApi.elementsCycle(), []);
}

export function useFiveElements() {
  return useAsync(() => chineseApi.fiveElements(), []);
}

export function useSolarTerms() {
  return useAsync(() => chineseApi.solarTerms(), []);
}

export function useSeasons() {
  return useAsync(() => chineseApi.seasons(), []);
}

export function useStemsBranches() {
  return useAsync(() => chineseApi.stemsBranches(), []);
}

export function useTones() {
  return useAsync(() => chineseApi.tones(), []);
}

export function useIdioms(category?: string, char?: string) {
  return useAsync(() => chineseApi.idioms(category, char), [category, char]);
}
