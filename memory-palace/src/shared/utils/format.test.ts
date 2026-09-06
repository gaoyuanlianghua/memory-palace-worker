import { describe, it, expect } from 'vitest';
import { fmtMoney, formatTime, maskWallet } from './format';

describe('format', () => {
  it('fmtMoney 保留两位小数并带 MC 后缀', () => {
    expect(fmtMoney(12.345)).toBe('12.35 MC');
    expect(fmtMoney(0)).toBe('0.00 MC');
  });

  it('formatTime 转换毫秒时间戳为本地时间字符串', () => {
    const t = new Date(2026, 0, 1, 12, 0, 0).getTime();
    expect(formatTime(t)).toContain('2026');
  });

  it('maskWallet 掩码中间部分', () => {
    expect(maskWallet('0xabcdef1234567890')).toBe('0xabcdef...7890');
    expect(maskWallet('abc')).toBe('abc');
  });
});
