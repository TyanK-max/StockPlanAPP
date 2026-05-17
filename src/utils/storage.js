import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

export async function loadWatchlist() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveWatchlist(codes) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(codes));
  } catch {
    // ignore
  }
}

export async function loadPlans() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PLANS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function savePlans(plans) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  } catch {
    // ignore
  }
}
