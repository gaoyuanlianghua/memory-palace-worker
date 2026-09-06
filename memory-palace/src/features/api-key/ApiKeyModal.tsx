import { useState } from 'react';
import { Modal } from '../../shared/ui';
import { setApiKey } from '../../shared/api/auth';
import { useAppStore } from '../../app/store/appStore';

export function ApiKeyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState('');
  const refreshKey = useAppStore((s) => s.refreshKey);

  const save = () => {
    if (!input.trim()) return;
    setApiKey(input.trim());
    refreshKey();
    setInput('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="🔐 API Key 配置">
      <p className="text-sm text-gray-400 mb-4">
        当前身份：<span className="text-blue-400">🔑 节点操作员</span>
      </p>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">或输入自定义 API Key</label>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入 API Key..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
          取消
        </button>
        <button
          onClick={save}
          disabled={!input.trim()}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存并应用
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">API Key 存储在本地，用于向后端证明您的身份</p>
    </Modal>
  );
}
