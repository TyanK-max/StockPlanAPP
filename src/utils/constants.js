export const API = {
  BATCH_QUOTE: 'https://push2.eastmoney.com/api/qt/ulist.np/get',
  SINGLE_QUOTE: 'https://push2.eastmoney.com/api/qt/stock/get',
  KLINE: 'https://web.ifzq.gtimg.cn/appstock/app/fqkline/get',
  TRENDS: 'https://push2.eastmoney.com/api/qt/stock/trends2/get',
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

