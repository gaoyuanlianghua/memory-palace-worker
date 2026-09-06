import { useState } from 'react';
import { Card } from '../../../shared/ui';
import { useAgentStore } from '../store';

export function AgentForm() {
  const [wallet, setWallet] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const bind = useAgentStore((s) => s.bind);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.trim() || !name.trim()) {
      setMessage('钱包地址与分身名称不能为空');
      return;
    }
    const ok = await bind(wallet.trim(), name.trim());
    setMessage(ok ? '绑定成功' : '绑定失败，请检查参数');
    if (ok) {
      setWallet('');
      setName('');
    }
  };

  return (
    <Card title="绑定分身" icon="🔗">
      <form onSubmit={submit} className="space-y-3">
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="钱包地址"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="分身名称"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
        />
        <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm font-medium">
          绑定
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-gray-400">{message}</p>}
    </Card>
  );
}
