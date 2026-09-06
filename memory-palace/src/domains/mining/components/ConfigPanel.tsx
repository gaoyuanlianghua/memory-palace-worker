import { useState } from 'react';
import type { MiningConfigResponse } from '../types';
import { miningApi } from '../api';

const CONFIG_KEYS = [
  'mining_pool_base_reward', 'pow_task_reward', 'monitoring_reward_per_hour',
  'auto_expand_threshold', 'expand_rate', 'decay_rate', 'decay_interval_ms',
  'airdrop_rate', 'airdrop_interval_ms',
];

export function ConfigPanel({ config, wallet, onChanged }: {
  config: MiningConfigResponse;
  wallet: string;
  onChanged: () => void;
}) {
  const [key, setKey] = useState(CONFIG_KEYS[0]);
  const [value, setValue] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const saveConfig = async () => {
    if (!wallet || !value.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      await miningApi.setConfig(key, value.trim(), wallet);
      setMsg(`已更新 ${key} = ${value.trim()}`);
      onChanged();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">⚙️ 挖矿配置</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">配置项</label>
          <select
            value={key}
            onChange={(e) => { setKey(e.target.value); setValue(config.mining_keys[e.target.value] ?? ''); }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
          >
            {CONFIG_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">当前值 / 新值</label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={config.mining_keys[key]}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
          />
        </div>
      </div>
      <button
        onClick={saveConfig}
        disabled={!wallet || busy}
        className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40"
      >
        {busy ? '保存中...' : '保存配置'}
      </button>
      {!wallet && <p className="text-xs text-amber-400 mt-2">需先注册钱包后才能修改配置</p>}
      {msg && <p className="text-xs text-green-400 mt-2">{msg}</p>}
    </div>
  );
}
