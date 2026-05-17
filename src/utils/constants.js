export const API = {
  BATCH_QUOTE: 'https://82.push2.eastmoney.com/api/qt/clist/get',
  SINGLE_QUOTE: 'https://push2.eastmoney.com/api/qt/stock/get',
  KLINE: 'https://push2his.eastmoney.com/api/qt/stock/kline/get',
};

export const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://quote.eastmoney.com/',
};

export const POLL_INTERVAL = 5000;

export const STORAGE_KEYS = {
  WATCHLIST: '@watchlist',
  PLANS: '@plans',
};

export const SH_PREFIX = '1';
export const SZ_PREFIX = '0';
