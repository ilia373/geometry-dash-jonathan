import { saveUserData, loadUserData } from './firestoreService';
import { getCurrentUser, isGuest } from './authService';

const STORAGE_KEY = 'geometry-dash-coins';

let cachedCoins: number = 0;
let cacheInitialized: boolean = false;
let activeSyncPromise: Promise<void> | null = null;

export const syncWalletFromCloud = async (): Promise<void> => {
  if (activeSyncPromise) return activeSyncPromise;

  activeSyncPromise = (async () => {
    const user = getCurrentUser();

    if (user && !isGuest()) {
      try {
        const userData = await loadUserData();
        cachedCoins = userData?.coins ?? 0;
      } catch (error) {
        console.error('Failed to load coins:', error);
        cachedCoins = 0;
      }
    }
    cacheInitialized = true;
  })();

  try {
    await activeSyncPromise;
  } finally {
    activeSyncPromise = null;
  }
};

export const addCoins = async (amount: number): Promise<void> => {
  if (!cacheInitialized) await syncWalletFromCloud();
  cachedCoins += amount;
  
  const user = getCurrentUser();
  if (user && !isGuest()) {
    await saveUserData({ coins: cachedCoins });
  }
};

export const getTotalCoins = (): number => {
  if (!cacheInitialized) {
    if (!isGuest()) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        cachedCoins = saved ? parseInt(saved, 10) : 0;
      } catch {
        cachedCoins = 0;
      }
    }
    cacheInitialized = true;
  }
  return cachedCoins;
};

export const spendCoins = async (amount: number): Promise<boolean> => {
  if (isGuest()) return false;
  if (!cacheInitialized) await syncWalletFromCloud();
  
  if (cachedCoins >= amount) {
    cachedCoins -= amount;
    
    const user = getCurrentUser();
    if (user && !isGuest()) {
      await saveUserData({ coins: cachedCoins });
    }
    return true;
  }
  return false;
};

export const setCoins = (amount: number): void => {
  cachedCoins = amount;
  cacheInitialized = true;
};

export const resetWallet = async (): Promise<void> => {
  cachedCoins = 0;
  cacheInitialized = true;
  
  const user = getCurrentUser();
  if (user && !isGuest()) {
    await saveUserData({ coins: 0 });
  }
};

export const resetWalletCache = (): void => {
  cachedCoins = 0;
  cacheInitialized = false;
};
