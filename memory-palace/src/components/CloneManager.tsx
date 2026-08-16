import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface AgentInfo {
  agent_id: string;
  wallet: string;
  status: string;
  balance: number;
  experience: number;
}

export function CloneManager() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await api.getClones();
        setAgents(data.agents || []);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleAssess = async (agentId: string) => {
    setSelectedAgent(agentId);
    try {
      await api.assessClone(agentId);
    } catch (error) {
      console.error('Failed to assess agent:', error);
    } finally {
      setSelectedAgent(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🤖</span>
          代理管理
        </h2>
        <p className="text-sm text-gray-400 mt-1">管理AI代理</p>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {agents.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>暂无代理数据</p>
              </div>
            ) : (
              agents.map((agent) => (
                <div
                  key={agent.agent_id}
                  className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🤖</div>
                    <div>
                      <h3 className="font-semibold text-white">{agent.agent_id}</h3>
                      <p className="text-sm text-gray-400">
                        钱包: {agent.wallet?.substring(0,8)}... | 余额: {agent.balance} MC
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={agent.status === 'active' ? 'badge-success' : 'badge-error'}>
                      {agent.status === 'active' ? '活跃' : agent.status || '未知'}
                    </span>
                    <button
                      onClick={() => handleAssess(agent.agent_id)}
                      disabled={selectedAgent === agent.agent_id}
                      className="btn-secondary text-sm"
                    >
                      {selectedAgent === agent.agent_id ? '评估中...' : '评估'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
