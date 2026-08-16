import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Clone } from '../types';

export function CloneManager() {
  const [clones, setClones] = useState<Clone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClone, setSelectedClone] = useState<string | null>(null);

  useEffect(() => {
    const fetchClones = async () => {
      try {
        const data = await api.getClones();
        setClones(data.clones);
      } catch (error) {
        console.error('Failed to fetch clones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClones();
  }, []);

  const handleAssess = async (cloneId: string) => {
    setSelectedClone(cloneId);
    try {
      await api.assessClone(cloneId);
    } catch (error) {
      console.error('Failed to assess clone:', error);
    } finally {
      setSelectedClone(null);
    }
  };

  const roleLabels: Record<string, string> = {
    frontend_architect: '前端架构师',
    visualization_specialist: '3D可视化师',
    security_engineer: '安全工程师',
    economic_system: '经济系统',
  };

  const roleIcons: Record<string, string> = {
    frontend_architect: '🏗️',
    visualization_specialist: '🎨',
    security_engineer: '🔒',
    economic_system: '💰',
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>🤖</span>
          分身管理
        </h2>
        <p className="text-sm text-gray-400 mt-1">管理AI分身协作</p>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {clones.map((clone) => (
              <div
                key={clone.id}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{roleIcons[clone.role] || '🤖'}</div>
                  <div>
                    <h3 className="font-semibold text-white">{clone.name}</h3>
                    <p className="text-sm text-gray-400">{roleLabels[clone.role] || clone.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={clone.status === 'active' ? 'badge-success' : 'badge-error'}>
                    {clone.status === 'active' ? '在线' : '离线'}
                  </span>
                  <button
                    onClick={() => handleAssess(clone.id)}
                    disabled={selectedClone === clone.id}
                    className="btn-secondary text-sm"
                  >
                    {selectedClone === clone.id ? '评估中...' : '评估'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
