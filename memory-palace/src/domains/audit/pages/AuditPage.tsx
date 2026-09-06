import { SectionTitle, Spinner } from '../../../shared/ui';
import { useAuditLogs } from '../hooks';
import { LogTable } from '../components/LogTable';

export function AuditPage() {
  const { logs, total, page, totalPages, setPage, loading } = useAuditLogs();

  return (
    <div className="space-y-6">
      <SectionTitle title="操作日志" subtitle={`审计日志（共 ${total} 条）`} />
      {loading ? <Spinner text="加载日志..." /> : (
        <>
          <LogTable logs={logs} />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 text-gray-300 disabled:opacity-40 hover:bg-gray-600">
                上一页
              </button>
              <span className="text-sm text-gray-400">{page} / {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 text-gray-300 disabled:opacity-40 hover:bg-gray-600">
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
