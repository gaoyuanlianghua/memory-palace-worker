export interface ChineseStats {
  total_physics_concepts: number;
  total_decomposition: number;
  total_evolution_chains: number;
  five_elements: number;
  categories: number;
  version: string;
  data_source: string;
  timestamp: number;
}

export interface CycleNode {
  element: string;
  generates?: string;
  overcomes?: string;
}

export interface CycleResponse {
  cycle: CycleNode[];
}

export interface FiveElement {
  character: string;
  element: string;
}

export interface FiveElementsResponse {
  elements: FiveElement[];
}

export interface SolarTermsResponse {
  terms: { name: string; date?: string; season: string }[];
}

export interface SeasonsResponse {
  seasons: { name: string; months: number[]; elements: string[] }[];
}

export interface StemsBranchesResponse {
  stems: string[];
  branches: string[];
  cycleLength: number;
}

export interface CycleIndexResponse {
  index: number;
  stem: string;
  branch: string;
  name: string;
}

export interface TonesResponse {
  tones: { tone: string; element: string; characters: string[] }[];
}

export interface Idiom {
  idiom: string;
  pinyin?: string;
  meaning?: string;
  category?: string;
  char?: string;
}

export interface IdiomsResponse {
  count: number;
  idioms: Idiom[];
}
