export function formatPrice(value) {
  if (value == null) return '--';
  const num = Number(value);
  if (isNaN(num)) return '--';
  return num.toFixed(2);
}

export function formatPercent(value) {
  if (value == null) return '--';
  const num = Number(value);
  if (isNaN(num)) return '--';
  return (num > 0 ? '+' : '') + num.toFixed(2) + '%';
}

export function formatVolume(vol) {
  if (vol == null) return '--';
  const num = Number(vol);
  if (isNaN(num)) return '--';
  if (num >= 1e8) return (num / 1e8).toFixed(2) + '亿';
  if (num >= 1e4) return (num / 1e4).toFixed(0) + '万';
  return num.toString();
}

export function formatAmount(amount) {
  if (amount == null) return '--';
  const num = Number(amount);
  if (isNaN(num)) return '--';
  if (num >= 1e8) return (num / 1e8).toFixed(2) + '亿';
  if (num >= 1e4) return (num / 1e4).toFixed(2) + '万';
  return num.toFixed(2);
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isUp(value) {
  const num = Number(value);
  if (isNaN(num)) return false;
  return num > 0;
}

export function isDown(value) {
  const num = Number(value);
  if (isNaN(num)) return false;
  return num < 0;
}
