import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CloneManager } from './components/CloneManager';
import { TaskManager } from './components/TaskManager';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { MemorySystem } from './components/MemorySystem';
import { CacheMonitor } from './components/CacheMonitor';
import { QualityMetrics } from './components/QualityMetrics';
import { LogViewer } from './components/LogViewer';

type TabId = 'dashboard' | 'clones' | 'tasks' | 'graph' | 'logs';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'dashboard', label: '仪表盘', icon: '📊' },
  { id: 'clones', label: '分身管理', icon: '🤖' },
  { id: 'tasks', label: '任务管理', icon: '📋' },
  { id: 'graph', label: '知识图谱', icon: '🔮' },
  { id: 'logs', label: '执行日志', icon: '📜' },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl glow">
                🏛️
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">记忆宫殿系统</h1>
                <p className="text-xs text-gray-400">去中心化代理协作平台 v2.5</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-success animate-pulse">● 系统运行中</span>
              <span className="text-xs text-gray-500">最我模式</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-link flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id ? 'nav-link-active' : ''
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <Dashboard />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CloneManager />
              <TaskManager />
            </div>
            <KnowledgeGraph />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MemorySystem />
              <CacheMonitor />
              <QualityMetrics />
            </div>
            <LogViewer />
          </div>
        )}

        {activeTab === 'clones' && (
          <div className="space-y-6">
            <CloneManager />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <TaskManager />
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="space-y-6">
            <KnowledgeGraph />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <LogViewer />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/50 border-t border-gray-700 py-4 mt-8">
        <div className="container mx-auto px-6 text-center text-sm text-gray-500">
          <p>记忆宫殿分身系统 v2.5 | 概念: 最我 | 模式: 多分身协作</p>
          <p className="mt-1">© 2026 去中心化代理协作平台</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
