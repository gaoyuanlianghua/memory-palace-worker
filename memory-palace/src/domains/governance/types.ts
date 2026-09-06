export interface Bug {
  bug_id: string;
  reporter_agent: string;
  room: string;
  bug_type: string;
  description?: string;
  severity: string;
  status: string;
  reward: number;
  created: number;
  confirmed_by?: string;
  fixed_by?: string;
}

export interface BugListResponse {
  bugs: Bug[];
}

export interface Proposal {
  proposal_id: string;
  proposer_agent: string;
  title: string;
  target_param: string;
  new_value: string;
  status: string;
  created: number;
  deadline: number;
  votes_for?: number;
  votes_against?: number;
}

export interface ProposalListResponse {
  proposals: Proposal[];
}

export interface GovernanceActionResponse {
  reported?: boolean;
  confirmed?: boolean;
  fixed?: boolean;
  created?: boolean;
  voted?: boolean;
  executed?: boolean;
  bug_id?: string;
  proposal_id?: string;
  reward?: number;
  status?: string;
  param?: string;
  value?: string;
  message?: string;
}

export const BUG_STATUS_LABEL: Record<string, string> = {
  open: '待确认',
  confirmed: '已确认',
  fixed: '已修复',
};

export const PROPOSAL_STATUS_LABEL: Record<string, string> = {
  active: '投票中',
  passed: '已通过',
  executed: '已执行',
};
