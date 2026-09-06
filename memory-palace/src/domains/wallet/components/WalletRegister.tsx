import { useState } from 'react';
import { Card } from '../../../shared/ui';
import { walletApi } from '../api';

export function WalletRegister({ onRegistered }: { onRegistered?: () => void }) {
  const [wallet, setWallet] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.trim()) {
      setMessage('请输入钱包地址');
      setError(true);
      return;
    }
    try {
      const result = await walletApi.register(wallet.trim());
      if (result.already_registered) {
        setMessage(`钱包已注册，节点 ID: ${result.node_id}，余额: ${result.balance} MC`);
      } else {
        setMessage(`注册成功！节点 ID: ${result.node_id}，API Key: ${result.api_key}`);
      }
      setError(false);
      setWallet('');
      onRegistered?.();
    } catch (e: unknown) {
      setMessage(`注册失败: ${e instanceof Error ? e.message : String(e)}`);
      setError(true);
    }
  };

  return (
    <Card title="钱包注册" icon="👛">
      <form onSubmit={submit} className="flex gap-3">
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="输入钱包地址 (8-64字符)..."
          className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
        />
        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm font-medium transition-all">
          注册节点
        </button>
      </form>
      {message && (
        <p className={`mt-3 text-sm ${error ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
      )}
      <p className="text-xs text-gray-500 mt-3">💡 注册成功后可获得节点 ID 和 API Key，用于访问系统 API</p>
    </Card>
  );
}
