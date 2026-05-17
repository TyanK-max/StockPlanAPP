import { useApp } from '../context/AppContext';

export function useWatchlist() {
  const { watchlist, addStock, removeStock } = useApp();
  return { watchlist, addStock, removeStock };
}
