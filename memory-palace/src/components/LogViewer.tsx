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
        setLogs(data.logs || []);
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

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>📜</span>
            操作日志
          </h2>
          <p className="text-sm text-gray-400 mt-1">系统操作记录</p>
        </div>
        <span className="badge-info">{logs.length}条</span>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="h-64 bg-gray-700 rounded-lg animate-pulse"></div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无日志数据</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={`${log.chain_id}-${index}`}
                  className="flex items-center gap-3 p-2 bg-gray-700/30 rounded hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-gray-500 text-xs w-20">
                    {log.created_at?.split(' ')[1] || '-'}
                  </span>
                  <span className="badge bg-gray-700 text-gray-300">
                    {log.wallet?.substring(0,8) || 'system'}
                  </span>
                  <span className="text-gray-300 truncate flex-1">
                    {log.chain_id}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
