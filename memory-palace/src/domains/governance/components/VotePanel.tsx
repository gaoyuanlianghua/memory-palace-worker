import { useState } from 'react';
import { governanceApi } from '../api';
import type { Proposal } from '../types';

export function VotePanel({ proposal, agentId, disabled, onVoted, onExecuted }: {
  proposal: Proposal;
  agentId: string;
  disabled?: boolean;
  onVoted: () => void;
  onExecuted: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const vote = async (vote: 'for' | 'against') => {
    if (!agentId) return;
    setBusy(vote);
    setMsg(null);
    try {
      const r = await governanceApi.vote(proposal.proposal_id, agentId, vote);
      setMsg(r.status ? `已投票，提案状态：${r.status}` : '投票成功');
      onVoted();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const execute = async () => {
    setBusy('execute');
    setMsg(null);
    try {
      const r = await governanceApi.executeProposal(proposal.proposal_id);
      setMsg(`已执行提案：${r.param} → ${r.value}`);
      onExecuted();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  if (proposal.status === 'active') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <button onClick={() => void vote('for')} disabled={disabled || !agentId || busy !== null}
            className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30 disabled:opacity-30">
            {busy === 'for' ? '...' : '👍 赞成'}
          </button>
          <button onClick={() => void vote('against')} disabled={disabled || !agentId || busy !== null}
            className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-30">
            {busy === 'against' ? '...' : '👎 反对'}
          </button>
        </div>
        {msg && <span className={`text-xs ${msg.includes('已') ? 'text-green-400' : 'text-red-400'}`}>{msg}</span>}
      </div>
    );
  }

  if (proposal.status === 'passed') {
    return (
      <div className="flex flex-col gap-1">
        <button onClick={() => void execute()} disabled={busy !== null}
          className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 disabled:opacity-30">
          {busy === 'execute' ? '执行中...' : '⚡ 执行'}
        </button>
        {msg && <span className={`text-xs ${msg.includes('已执行') ? 'text-green-400' : 'text-red-400'}`}>{msg}</span>}
      </div>
    );
  }

  return null;
}
