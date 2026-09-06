export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Paginated<T> {
  items: T[];
  count: number;
  network_time: number;
}

export type ApiErrorPayload = { error: string; type?: string };
