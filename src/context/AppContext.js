import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { loadWatchlist, saveWatchlist, loadPlans, savePlans } from '../utils/storage';

const AppContext = createContext(null);

const SET_WATCHLIST = 'SET_WATCHLIST';
const ADD_STOCK = 'ADD_STOCK';
const REMOVE_STOCK = 'REMOVE_STOCK';
const SET_QUOTES = 'SET_QUOTES';
const SET_PLANS = 'SET_PLANS';
const ADD_PLAN = 'ADD_PLAN';
const UPDATE_PLAN = 'UPDATE_PLAN';
const DELETE_PLAN = 'DELETE_PLAN';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';

function reducer(state, action) {
  switch (action.type) {
    case SET_WATCHLIST:
      return { ...state, watchlist: action.payload };
    case ADD_STOCK:
      if (state.watchlist.includes(action.payload)) return state;
      return { ...state, watchlist: [...state.watchlist, action.payload] };
    case REMOVE_STOCK:
      return { ...state, watchlist: state.watchlist.filter((c) => c !== action.payload) };
    case SET_QUOTES:
      return { ...state, quotes: action.payload };
    case SET_PLANS:
      return { ...state, plans: action.payload };
    case ADD_PLAN: {
      const { code, plan } = action.payload;
      const existing = state.plans[code] || [];
      return { ...state, plans: { ...state.plans, [code]: [plan, ...existing] } };
    }
    case UPDATE_PLAN: {
      const { code, planId, text } = action.payload;
      const updated = (state.plans[code] || []).map((p) =>
        p.id === planId ? { ...p, text, updatedAt: new Date().toISOString() } : p
      );
      return { ...state, plans: { ...state.plans, [code]: updated } };
    }
    case DELETE_PLAN: {
      const { code: delCode, planId: delId } = action.payload;
      const filtered = (state.plans[delCode] || []).filter((p) => p.id !== delId);
      const newPlans = { ...state.plans };
      if (filtered.length) {
        newPlans[delCode] = filtered;
      } else {
        delete newPlans[delCode];
      }
      return { ...state, plans: newPlans };
    }
    case SET_LOADING:
      return { ...state, ui: { ...state.ui, isLoading: action.payload } };
    case SET_ERROR:
      return { ...state, ui: { ...state.ui, error: action.payload } };
    default:
      return state;
  }
}

const initialState = {
  watchlist: [],
  plans: {},
  quotes: {},
  ui: { isLoading: false, error: null },
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const wl = await loadWatchlist();
      dispatch({ type: SET_WATCHLIST, payload: wl });
      const pl = await loadPlans();
      dispatch({ type: SET_PLANS, payload: pl });
    })();
  }, []);

  const persistWatchlist = useCallback(async (wl) => {
    await saveWatchlist(wl);
  }, []);

  const persistPlans = useCallback(async (pl) => {
    await savePlans(pl);
  }, []);

  const dispatchWithPersist = useCallback(
    (action) => {
      dispatch(action);
      // Persist after dispatch (fire-and-forget, next render will confirm)
    },
    []
  );

  const addStock = useCallback(
    (code) => {
      dispatch({ type: ADD_STOCK, payload: code });
      const newList = state.watchlist.includes(code) ? state.watchlist : [...state.watchlist, code];
      persistWatchlist(newList);
    },
    [state.watchlist, persistWatchlist]
  );

  const removeStock = useCallback(
    (code) => {
      dispatch({ type: REMOVE_STOCK, payload: code });
      const newList = state.watchlist.filter((c) => c !== code);
      persistWatchlist(newList);
    },
    [state.watchlist, persistWatchlist]
  );

  const addPlan = useCallback(
    (code, plan) => {
      dispatch({ type: ADD_PLAN, payload: { code, plan } });
      const existing = state.plans[code] || [];
      const newPlans = { ...state.plans, [code]: [plan, ...existing] };
      persistPlans(newPlans);
    },
    [state.plans, persistPlans]
  );

  const updatePlan = useCallback(
    (code, planId, text) => {
      dispatch({ type: UPDATE_PLAN, payload: { code, planId, text } });
      const updated = (state.plans[code] || []).map((p) =>
        p.id === planId ? { ...p, text, updatedAt: new Date().toISOString() } : p
      );
      persistPlans({ ...state.plans, [code]: updated });
    },
    [state.plans, persistPlans]
  );

  const deletePlan = useCallback(
    (code, planId) => {
      dispatch({ type: DELETE_PLAN, payload: { code, planId } });
      const filtered = (state.plans[code] || []).filter((p) => p.id !== planId);
      const newPlans = { ...state.plans };
      if (filtered.length) {
        newPlans[code] = filtered;
      } else {
        delete newPlans[code];
      }
      persistPlans(newPlans);
    },
    [state.plans, persistPlans]
  );

  const setQuotes = useCallback((quotes) => {
    dispatch({ type: SET_QUOTES, payload: quotes });
  }, []);

  const setLoading = useCallback((v) => {
    dispatch({ type: SET_LOADING, payload: v });
  }, []);

  const setError = useCallback((e) => {
    dispatch({ type: SET_ERROR, payload: e });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addStock,
        removeStock,
        addPlan,
        updatePlan,
        deletePlan,
        setQuotes,
        setLoading,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
