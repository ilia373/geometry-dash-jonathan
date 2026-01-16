// Wallet Manager for tracking coins
import { saveUserData, loadUserData } from './firestoreService';
import { getCurrentUser, isGuest } from './authService';

const STORAGE_KEY = 'geometry-dash-coins';

// In-memory cache for coins to avoid async calls in sync functions
let cachedCoins: number = 0;
let cacheInitialized: boolean = false;

// Initialize cache from storage
const initCache = (): void => {
  if (cacheInitialized) return;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    cachedCoins = saved ? parseInt(saved, 10) : 0;
  } catch {
    cachedCoins = 0;
  }
  cacheInitialized = true;
};

// Sync cache with Firestore for authenticated users
export const syncWalletFromCloud = async (): Promise<void> => {
  const user = getCurrentUser();
  if (!user || isGuest()) {
    initCache();
    return;
  }

  try {
    const userData = await loadUserData();
    if (userData) {
      cachedCoins = userData.coins;
      // Also update localStorage as backup
      localStorage.setItem(STORAGE_KEY, cachedCoins.toString());
    }
  } catch (error) {
    console.error('Failed to sync wallet from cloud:', error);
    initCache();
  }
  cacheInitialized = true;
};

export const addCoins = async (amount: number): Promise<void> => {
  initCache();
  cachedCoins += amount;
  
  // Save to localStorage immediately
  localStorage.setItem(STORAGE_KEY, cachedCoins.toString());
  
  // Save to Firestore for authenticated users
  const user = getCurrentUser();
  if (user && !isGuest()) {
    try {
      await saveUserData({ coins: cachedCoins });
    } catch (error) {
      console.error('Failed to save coins to cloud:', error);
    }
  }
};

export const getTotalCoins = (): number => {
  initCache();
  return cachedCoins;
};

export const spendCoins = async (amount: number): Promise<boolean> => {
  initCache();
  if (cachedCoins >= amount) {
    cachedCoins -= amount;
    
    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEY, cachedCoins.toString());
    
    // Save to Firestore for authenticated users
    const user = getCurrentUser();
    if (user && !isGuest()) {
      try {
        await saveUserData({ coins: cachedCoins });
      } catch (error) {
        console.error('Failed to save coins to cloud:', error);
      }
    }
    return true;
  }
  return false;
};

export const setCoins = (amount: number): void => {
  cachedCoins = amount;
  localStorage.setItem(STORAGE_KEY, cachedCoins.toString());
  cacheInitialized = true;
};

export const resetWallet = async (): Promise<void> => {
  cachedCoins = 0;
  localStorage.setItem(STORAGE_KEY, '0');
  
  const user = getCurrentUser();
  if (user && !isGuest()) {
    try {
      await saveUserData({ coins: 0 });
    } catch (error) {
      console.error('Failed to reset wallet in cloud:', error);
    }
  }
};
