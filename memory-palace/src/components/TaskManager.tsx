import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Task } from '../types';

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.getTasks();
        setTasks(data.tasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleExecute = async (taskId: string) => {
    setExecuting(taskId);
    try {
      await api.executeTask(taskId);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: 'in_progress' } : t
        )
      );
    } catch (error) {
      console.error('Failed to execute task:', error);
    } finally {
      setExecuting(null);
    }
  };

  const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
    frontend: { label: '前端', icon: '🎨', color: 'blue' },
    visualization: { label: '可视化', icon: '📊', color: 'purple' },
    security: { label: '安全', icon: '🔒', color: 'red' },
    backend: { label: '后端', icon: '⚙️', color: 'green' },
  };

  const statusLabels: Record<string, { label: string; class: string }> = {
    assigned: { label: '已分配', class: 'badge-info' },
    in_progress: { label: '执行中', class: 'badge-warning' },
    completed: { label: '已完成', class: 'badge-success' },
    failed: { label: '失败', class: 'badge-error' },
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>📋</span>
          任务管理
        </h2>
        <p className="text-sm text-gray-400 mt-1">管理和执行任务</p>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tasks.map((task) => {
              const typeInfo = typeLabels[task.type] || { label: task.type, icon: '📌', color: 'gray' };
              const statusInfo = statusLabels[task.status] || { label: task.status, class: 'badge-info' };

              return (
                <div
                  key={task.id}
                  className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white">{task.description}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          ID: {task.id.slice(-12)} | 创建: {formatDate(task.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={statusInfo.class}>{statusInfo.label}</span>
                  </div>

                  {task.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {task.requirements.map((req, idx) => (
                        <span key={idx} className="badge bg-gray-600 text-gray-200">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      分配至: <span className="text-blue-400">{task.assignedClone}</span>
                    </p>
                    <button
                      onClick={() => handleExecute(task.id)}
                      disabled={executing === task.id || task.status !== 'assigned'}
                      className="btn-primary text-sm"
                    >
                      {executing === task.id ? '执行中...' : '执行'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
