import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchBatchQuotes } from '../api/eastmoney';
import { POLL_INTERVAL } from '../utils/constants';

export function useQuotes() {
  const { watchlist, quotes, setQuotes, setLoading, setError } = useApp();
  const intervalRef = useRef(null);

  const refresh = async () => {
    if (!watchlist.length) {
      setQuotes({});
      return;
    }
    setLoading(true);
    try {
      const data = await fetchBatchQuotes(watchlist);
      setQuotes(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [watchlist.join(',')]);

  return { quotes, refresh };
}
