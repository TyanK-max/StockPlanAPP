import { API, HEADERS, SH_PREFIX, SZ_PREFIX } from '../utils/constants';

function getSecid(code) {
  if (code.startsWith('6') || code.startsWith('5') || code.startsWith('9')) {
    return SH_PREFIX + '.' + code;
  }
  return SZ_PREFIX + '.' + code;
}

function getMarketCode(code) {
  if (code.startsWith('6')) return '1';
  return '0';
}

async function fetchJson(url) {
  const resp = await fetch(url, { headers: HEADERS });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function fetchBatchQuotes(codes) {
  try {
    const secids = codes.map((c) => getSecid(c)).join(',');
    const url = `${API.BATCH_QUOTE}?pn=1&pz=100&po=0&np=1&fltt=2&invt=2&fid=f3&fs=${codes.map(c => 's:' + c).join(',')}&fields=f2,f3,f4,f5,f6,f12,f14,f15,f16,f17,f18,f20,f21`;
    const data = await fetchJson(url);
    if (!data || !data.data || !data.data.diff) return {};
    const map = {};
    for (const item of data.data.diff) {
      map[item.f12] = {
        code: item.f12,
        name: item.f14,
        price: Number(item.f2),
        change: Number(item.f4),
        changePercent: Number(item.f3),
        high: Number(item.f15),
        low: Number(item.f16),
        open: Number(item.f17),
        prevClose: Number(item.f18),
        volume: Number(item.f5),
        amount: Number(item.f6),
      };
    }
    return map;
  } catch {
    return {};
  }
}

export async function fetchSingleQuote(code) {
  try {
    const secid = getSecid(code);
    const url = `${API.SINGLE_QUOTE}?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f55,f57,f58,f60,f116,f117,f162,f167,f168,f169,f170,f171&fltt=2&invt=2`;
    const data = await fetchJson(url);
    if (!data || !data.data) return null;
    const d = data.data;
    return {
      code,
      name: d.f58,
      price: Number(d.f43),
      change: Number(d.f169),
      changePercent: Number(d.f170),
      high: Number(d.f44),
      low: Number(d.f45),
      open: Number(d.f46),
      prevClose: Number(d.f60),
      volume: Number(d.f47),
      amount: Number(d.f48),
      pe: d.f162 ? Number(d.f162) : null,
      pb: d.f167 ? Number(d.f167) : null,
      marketCap: d.f116 ? Number(d.f116) : null,
    };
  } catch {
    return null;
  }
}

export async function fetchKline(code, days = 30) {
  try {
    const secid = getSecid(code);
    const end = new Date();
    const beg = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
    const url = `${API.KLINE}?secid=${secid}&klt=101&fqt=1&beg=${fmt(beg)}&end=${fmt(end)}&fields=f2,f3,f4,f5,f6`;
    const data = await fetchJson(url);
    if (!data || !data.data || !data.data.klines) return [];
    return data.data.klines.map((line) => {
      const parts = line.split(',');
      return {
        date: parts[0],
        open: Number(parts[1]),
        close: Number(parts[2]),
        high: Number(parts[3]),
        low: Number(parts[4]),
        volume: Number(parts[5]),
      };
    });
  } catch {
    return [];
  }
}
