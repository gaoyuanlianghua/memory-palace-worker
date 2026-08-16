import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { LogEntry } from '../types';

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.getLogs();
        setLogs(data.logs);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const walletLabels: Record<string, { label: string; color: string }> = {
    system: { label: '系统', color: 'text-blue-400' },
    users: { label: '用户', color: 'text-green-400' },
    palace_tasks: { label: '任务', color: 'text-purple-400' },
    transactions: { label: '交易', color: 'text-yellow-400' },
  };

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>📜</span>
            执行日志
          </h2>
          <p className="text-sm text-gray-400 mt-1">实时操作记录</p>
        </div>
        <span className="badge-info">{logs.length}条</span>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="h-64 bg-gray-700 rounded-lg animate-pulse"></div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => {
              const walletInfo = walletLabels[log.wallet] || { label: log.wallet, color: 'text-gray-400' };

              return (
                <div
                  key={`${log.chain_id}-${index}`}
                  className="flex items-center gap-3 p-2 bg-gray-700/30 rounded hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-gray-500 text-xs w-20">{log.created_at.split(' ')[1]}</span>
                  <span className={`badge ${walletInfo.color} bg-gray-700`}>
                    {walletInfo.label}
                  </span>
                  <span className="text-gray-300 truncate flex-1">
                    {log.chain_id}
                  </span>
                  <span className="text-gray-500 text-xs">Lv.{log.level}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
