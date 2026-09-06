import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type {
  ChineseStats, CycleResponse, FiveElementsResponse, SolarTermsResponse,
  SeasonsResponse, StemsBranchesResponse, CycleIndexResponse, TonesResponse, IdiomsResponse,
} from './types';

const q = (path: string, params: Record<string, string | number | undefined>) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') usp.set(k, String(v));
  const s = usp.toString();
  return s ? `${path}?${s}` : path;
};

export const chineseApi = {
  stats: () => request<ChineseStats>(ENDPOINTS.chinese.stats.path),
  elementsCycle: () => request<CycleResponse>(ENDPOINTS.chinese.elementsCycle.path),
  fiveElements: () => request<FiveElementsResponse>(ENDPOINTS.chinese.fiveElements.path),
  solarTerms: () => request<SolarTermsResponse>(ENDPOINTS.chinese.solarTerms.path),
  seasons: () => request<SeasonsResponse>(ENDPOINTS.chinese.seasons.path),
  stemsBranches: () => request<StemsBranchesResponse>(ENDPOINTS.chinese.stemsBranches.path),
  cycleIndex: (index: number) =>
    request<CycleIndexResponse>(q(ENDPOINTS.chinese.stemsBranches.path, { type: 'cycle', index })),
  tones: () => request<TonesResponse>(ENDPOINTS.chinese.tones.path),
  idioms: (category?: string, char?: string) =>
    request<IdiomsResponse>(q(ENDPOINTS.chinese.idioms.path, { category, char })),
};
