import { useState } from 'react';
import { Card } from '../../../shared/ui';
import { memoryApi } from '../api';

const TYPE_OPTIONS = ['回忆', '知识', '对话', '经验', '其他'];

export function MemoryForm({ onCreated }: { onCreated: () => void }) {
  const [wallet, setWallet] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState(TYPE_OPTIONS[0]);
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.trim() || !content.trim()) {
      setMessage('钱包与内容不能为空');
      return;
    }
    try {
      await memoryApi.create(wallet.trim(), content.trim(), type);
      setMessage('记忆创建成功');
      setContent('');
      onCreated();
    } catch (err) {
      setMessage(`创建失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <Card title="创建记忆" icon="🧠">
      <form onSubmit={submit} className="space-y-3">
        <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="钱包地址"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="记忆内容" rows={4}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500" />
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none">
          {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm font-medium">创建记忆</button>
      </form>
      {message && <p className="mt-3 text-sm text-gray-400">{message}</p>}
    </Card>
  );
}
