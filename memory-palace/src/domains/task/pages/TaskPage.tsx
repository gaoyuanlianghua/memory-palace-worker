import { SectionTitle } from '../../../shared/ui';
import { useTasks } from '../hooks';
import { TaskList } from '../components/TaskList';
import { TaskForm } from '../components/TaskForm';

export function TaskPage() {
  const { refresh, message } = useTasks();
  return (
    <div className="space-y-6">
      <SectionTitle
        title="任务系统"
        subtitle="任务发布、认领与完成"
        action={
          <button onClick={() => void refresh()} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500">
            ⟳ 刷新
          </button>
        }
      />
      {message && <p className="text-sm text-gray-400">{message}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><TaskList /></div>
        <TaskForm onCreated={() => void refresh()} />
      </div>
    </div>
  );
}
