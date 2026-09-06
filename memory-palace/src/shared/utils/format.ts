export const fmtMoney = (n: number): string => `${n.toFixed(2)} MC`;

export const formatTime = (ts: number | string | undefined): string => {
  if (!ts) return '—';
  const d = new Date(typeof ts === 'string' ? Number(ts) : ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const maskWallet = (w: string): string => {
  if (w.length <= 8) return w;
  return `${w.slice(0, 8)}...${w.slice(-4)}`;
};

export const shortId = (id: string, len = 10): string =>
  id.length <= len ? id : `${id.slice(0, Math.floor(len / 2))}...${id.slice(-Math.floor(len / 2))}`;
