// Wallet Manager for tracking coins
// Uses Firestore for authenticated users (with built-in offline support)
// Uses localStorage only for guests
import { saveUserData, loadUserData } from './firestoreService';
import { getCurrentUser, isGuest } from './authService';

const STORAGE_KEY = 'geometry-dash-coins';

// In-memory cache for current session
let cachedCoins: number = 0;
let cacheInitialized: boolean = false;

// Load coins from appropriate storage
export const syncWalletFromCloud = async (): Promise<void> => {
  const user = getCurrentUser();
  
  if (!user || isGuest()) {
    // Guest: load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      cachedCoins = saved ? parseInt(saved, 10) : 0;
    } catch {
      cachedCoins = 0;
    }
  } else {
    // Authenticated: load from Firestore (has built-in offline support)
    try {
      const userData = await loadUserData();
      cachedCoins = userData?.coins ?? 0;
    } catch (error) {
      console.error('Failed to load coins:', error);
      cachedCoins = 0;
    }
  }
  cacheInitialized = true;
};

export const addCoins = async (amount: number): Promise<void> => {
  if (!cacheInitialized) await syncWalletFromCloud();
  cachedCoins += amount;
  
  const user = getCurrentUser();
  if (!user || isGuest()) {
    // Guest: save to localStorage
    localStorage.setItem(STORAGE_KEY, cachedCoins.toString());
  } else {
    // Authenticated: save to Firestore (offline writes are queued automatically)
    await saveUserData({ coins: cachedCoins });
  }
};

export const getTotalCoins = (): number => {
  if (!cacheInitialized) {
    // Sync read for guests from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      cachedCoins = saved ? parseInt(saved, 10) : 0;
    } catch {
      cachedCoins = 0;
    }
    cacheInitialized = true;
  }
  return cachedCoins;
};

export const spendCoins = async (amount: number): Promise<boolean> => {
  if (!cacheInitialized) await syncWalletFromCloud();
  
  if (cachedCoins >= amount) {
    cachedCoins -= amount;
    
    const user = getCurrentUser();
    if (!user || isGuest()) {
      localStorage.setItem(STORAGE_KEY, cachedCoins.toString());
    } else {
      await saveUserData({ coins: cachedCoins });
    }
    return true;
  }
  return false;
};

// Used by firestoreService during sync/merge
export const setCoins = (amount: number): void => {
  cachedCoins = amount;
  cacheInitialized = true;
};

export const resetWallet = async (): Promise<void> => {
  cachedCoins = 0;
  cacheInitialized = true;
  
  const user = getCurrentUser();
  if (!user || isGuest()) {
    localStorage.setItem(STORAGE_KEY, '0');
  } else {
    await saveUserData({ coins: 0 });
  }
};

// Reset cache (for testing)
export const resetWalletCache = (): void => {
  cachedCoins = 0;
  cacheInitialized = false;
};
