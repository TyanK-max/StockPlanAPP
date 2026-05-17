import { API, HEADERS } from '../utils/constants';

function getMarket(code) {
  if (code.startsWith('6') || code.startsWith('5') || code.startsWith('9')) return 'sh';
  return 'sz';
}

function getSecid(code) {
  const prefix = getMarket(code) === 'sh' ? '1' : '0';
  return prefix + '.' + code;
}

async function fetchJson(url) {
  const resp = await fetch(url, { headers: HEADERS });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function fetchBatchQuotes(codes) {
  try {
    const secids = codes.map((c) => getSecid(c)).join(',');
    const url = `${API.BATCH_QUOTE}?fltt=2&invt=2&fields=f2,f3,f4,f5,f6,f12,f14,f15,f16,f17,f18&secids=${secids}`;
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

export async function fetchTrends(code) {
  try {
    const secid = getSecid(code);
    const url = `${API.TRENDS}?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f52`;
    const resp = await fetch(url, { headers: HEADERS });
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!data || !data.data || !data.data.trends) return [];
    return data.data.trends.map((item) => {
      const parts = item.split(',');
      const price = Number(parts[1]);
      if (parts.length < 2 || isNaN(price)) return null;
      return { time: parts[0], price };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchKline(code, days = 60) {
  try {
    const market = getMarket(code);
    const url = `${API.KLINE}?param=${market}${code},day,,,${days},qfq`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!data || data.code !== 0 || !data.data) return [];
    const raw = data.data[`${market}${code}`];
    if (!raw) return [];
    const list = raw.qfqday || raw.day || [];
    return list.map((item) => ({
      date: item[0],
      open: Number(item[1]),
      close: Number(item[2]),
      high: Number(item[3]),
      low: Number(item[4]),
      volume: (Number(item[5]) || 0) * 100, // 腾讯单位是手，转为股
      amount: item[6] ? Number(item[6]) : null, // 成交额（部分数据源有）
    }));
  } catch {
    return [];
  }
}
