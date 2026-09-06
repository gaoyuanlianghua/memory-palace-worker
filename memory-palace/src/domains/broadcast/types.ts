export interface BroadcastSchedule {
  id: string;
  wallet: string;
  agent_id?: string;
  schedule_type: string;
  interval_seconds: number;
  cron_expression?: string;
  task_type: string;
  radius: number;
  message?: string;
  enabled: number;
  last_run?: number;
  next_run: number;
  run_count?: number;
  success_count?: number;
  fail_count?: number;
  created: number;
}

export interface ScheduleListResponse {
  total: number;
  schedules: BroadcastSchedule[];
}

export interface ScheduleActionResponse {
  created?: boolean;
  updated?: boolean;
  deleted?: boolean;
  id?: string;
  wallet?: string;
  next_run?: number;
  message?: string;
}

export interface WakeResponse {
  wake?: boolean;
  id?: string;
  recipients_count?: number;
  message?: string;
}
