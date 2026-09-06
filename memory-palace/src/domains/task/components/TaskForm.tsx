import { useState } from 'react';
import { Card } from '../../../shared/ui';
import { taskApi } from '../api';

export function TaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('10');
  const [wallet, setWallet] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = '任务标题不能为空';
    if (!wallet.trim()) e.wallet = '钱包地址不能为空';
    const r = Number(reward);
    if (!Number.isFinite(r) || r < 0) e.reward = '奖励需为非负数字';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await taskApi.create(wallet.trim(), title.trim(), description.trim(), Number(reward));
      setMessage('创建成功');
      setTitle('');
      setDescription('');
      onCreated();
    } catch (err) {
      setMessage(`创建失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const inputCls = (hasErr: boolean) =>
    `w-full px-4 py-2 bg-gray-700 border rounded-lg text-white text-sm focus:outline-none placeholder-gray-500 ${
      hasErr ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
    }`;

  return (
    <Card title="创建任务" icon="📋">
      <form onSubmit={submit} className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="任务标题" className={inputCls(!!errors.title)} />
        {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="任务描述" rows={3} className={inputCls(false)} />
        <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="创建者钱包地址" className={inputCls(!!errors.wallet)} />
        {errors.wallet && <p className="text-xs text-red-400">{errors.wallet}</p>}
        <input value={reward} onChange={(e) => setReward(e.target.value)} placeholder="奖励 (MC)" className={inputCls(!!errors.reward)} />
        {errors.reward && <p className="text-xs text-red-400">{errors.reward}</p>}
        <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm font-medium">创建任务</button>
      </form>
      {message && <p className="mt-3 text-sm text-gray-400">{message}</p>}
    </Card>
  );
}
