export interface Task {
  task_id?: string;
  id?: string;
  title?: string;
  description?: string;
  status: string;
  reward?: number;
  claimed_by?: string;
  completed_by?: string;
  assignee?: string;
  result?: string;
  created?: number;
  completed?: number;
  room?: string;
  required_level?: number;
  deadline?: number;
}

export interface TaskListResponse {
  tasks: Task[];
  count: number;
  network_time: number;
}

export interface TaskActionResponse {
  claimed?: boolean;
  completed?: boolean;
  created?: boolean;
  task?: Task;
}
