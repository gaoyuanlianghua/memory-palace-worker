import { request } from '../../shared/api/http';
import { ENDPOINTS } from '../../shared/api/endpoints';
import type { BugListResponse, ProposalListResponse, GovernanceActionResponse } from './types';

export const governanceApi = {
  listBugs: () => request<BugListResponse>(ENDPOINTS.governance.bugs.path),
  reportBug: (reporter_agent: string, room: string, bug_type: string, description?: string, severity?: string) =>
    request<GovernanceActionResponse>(ENDPOINTS.governance.bugReport.path, {
      method: 'POST',
      body: { reporter_agent, room, bug_type, description, severity },
    }),
  confirmBug: (bug_id: string, agent_id: string) =>
    request<GovernanceActionResponse>(ENDPOINTS.governance.bugConfirm.path, { method: 'POST', body: { bug_id, agent_id } }),
  fixBug: (bug_id: string, agent_id: string, wallet: string) =>
    request<GovernanceActionResponse>(ENDPOINTS.governance.bugFix.path, { method: 'POST', body: { bug_id, agent_id, wallet } }),
  listProposals: () => request<ProposalListResponse>(ENDPOINTS.governance.proposals.path),
  createProposal: (proposer_agent: string, title: string, target_param: string, new_value: string) =>
    request<GovernanceActionResponse>(ENDPOINTS.governance.proposalCreate.path, {
      method: 'POST',
      body: { proposer_agent, title, target_param, new_value },
    }),
  vote: (proposal_id: string, agent_id: string, vote: 'for' | 'against') =>
    request<GovernanceActionResponse>(ENDPOINTS.governance.proposalVote.path, { method: 'POST', body: { proposal_id, agent_id, vote } }),
  executeProposal: (proposal_id: string) =>
    request<GovernanceActionResponse>(ENDPOINTS.governance.proposalExecute.path, { method: 'POST', body: { proposal_id } }),
};
