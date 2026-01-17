// Skin Manager - handles saving and loading the selected skin
// Uses Firestore for authenticated users (with built-in offline support)
// Uses localStorage only for guests
import { SKINS, getSkinById, type Skin } from '../types/skins';
import { saveUserData, loadUserData } from './firestoreService';
import { getCurrentUser, isGuest } from './authService';

const SKIN_STORAGE_KEY = 'geometry-dash-selected-skin';
const UNLOCKED_SKINS_KEY = 'geometry-dash-owned-skins';

// Skin price in coins
export const SKIN_PRICE = 200;

// Get the price of a specific skin (uses custom price or default)
export const getSkinPrice = (skinId: number): number => {
  const skin = getSkinById(skinId);
  return skin.price ?? SKIN_PRICE;
};

// Default skins (IDs 1-6) are always unlocked
const DEFAULT_UNLOCKED_SKINS = [1, 2, 3, 4, 5, 6];

// Convert skin IDs to skin names for Firestore (stored as string names)
const skinIdToName = (id: number): string => {
  const skin = getSkinById(id);
  return skin.name.toLowerCase().replace(/\s+/g, '-');
};

const skinNameToId = (name: string): number => {
  const skin = SKINS.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === name || s.name.toLowerCase() === name);
  return skin?.id ?? 1;
};

// In-memory cache for current session
let cachedUnlockedSkinIds: number[] = [...DEFAULT_UNLOCKED_SKINS];
let cachedSelectedSkinId: number = 1;
let cacheInitialized: boolean = false;

// Load from localStorage (for guests only)
const loadFromLocalStorage = (): void => {
  try {
    const storedUnlocked = localStorage.getItem(UNLOCKED_SKINS_KEY);
    if (storedUnlocked) {
      const parsed = JSON.parse(storedUnlocked);
      if (Array.isArray(parsed)) {
        if (typeof parsed[0] === 'string') {
          cachedUnlockedSkinIds = [...new Set([...DEFAULT_UNLOCKED_SKINS, ...parsed.map(skinNameToId)])];
        } else {
          cachedUnlockedSkinIds = [...new Set([...DEFAULT_UNLOCKED_SKINS, ...parsed])];
        }
      }
    }
    
    const storedSelected = localStorage.getItem(SKIN_STORAGE_KEY);
    if (storedSelected) {
      const id = parseInt(storedSelected, 10);
      if (!isNaN(id) && id >= 1 && id <= SKINS.length) {
        cachedSelectedSkinId = id;
      } else {
        cachedSelectedSkinId = skinNameToId(storedSelected);
      }
    }
  } catch {
    cachedUnlockedSkinIds = [...DEFAULT_UNLOCKED_SKINS];
    cachedSelectedSkinId = 1;
  }
};

// Load skins from appropriate storage
export const syncSkinsFromCloud = async (): Promise<void> => {
  const user = getCurrentUser();
  
  if (!user || isGuest()) {
    // Guest: load from localStorage
    loadFromLocalStorage();
  } else {
    // Authenticated: load from Firestore (has built-in offline support)
    try {
      const userData = await loadUserData();
      if (userData) {
        if (userData.ownedSkins && userData.ownedSkins.length > 0) {
          const ownedIds = userData.ownedSkins.map(skinNameToId);
          cachedUnlockedSkinIds = [...new Set([...DEFAULT_UNLOCKED_SKINS, ...ownedIds])];
        }
        if (userData.selectedSkin) {
          cachedSelectedSkinId = skinNameToId(userData.selectedSkin);
        }
      }
    } catch (error) {
      console.error('Failed to load skins:', error);
      cachedUnlockedSkinIds = [...DEFAULT_UNLOCKED_SKINS];
      cachedSelectedSkinId = 1;
    }
  }
  cacheInitialized = true;
};

// Get unlocked skin IDs
export const getUnlockedSkinIds = (): number[] => {
  if (!cacheInitialized) loadFromLocalStorage();
  return [...cachedUnlockedSkinIds];
};

// Check if a skin is unlocked
export const isSkinUnlocked = (skinId: number): boolean => {
  if (!cacheInitialized) loadFromLocalStorage();
  return cachedUnlockedSkinIds.includes(skinId);
};

// Unlock a skin (add to unlocked list)
export const unlockSkin = async (skinId: number): Promise<void> => {
  if (!cacheInitialized) await syncSkinsFromCloud();
  
  if (!cachedUnlockedSkinIds.includes(skinId)) {
    cachedUnlockedSkinIds.push(skinId);
    const ownedSkinNames = cachedUnlockedSkinIds.map(skinIdToName);
    
    const user = getCurrentUser();
    if (!user || isGuest()) {
      localStorage.setItem(UNLOCKED_SKINS_KEY, JSON.stringify(ownedSkinNames));
    } else {
      await saveUserData({ ownedSkins: ownedSkinNames });
    }
  }
};

// Get the currently selected skin ID
export const getSelectedSkinId = (): number => {
  if (!cacheInitialized) loadFromLocalStorage();
  return cachedSelectedSkinId;
};

// Get the currently selected skin
export const getSelectedSkin = (): Skin => {
  return getSkinById(getSelectedSkinId());
};

// Set the selected skin
export const setSelectedSkin = async (skinId: number): Promise<void> => {
  if (!cacheInitialized) await syncSkinsFromCloud();
  
  if (skinId >= 1 && skinId <= SKINS.length) {
    cachedSelectedSkinId = skinId;
    const skinName = skinIdToName(skinId);
    
    const user = getCurrentUser();
    if (!user || isGuest()) {
      localStorage.setItem(SKIN_STORAGE_KEY, skinName);
    } else {
      await saveUserData({ selectedSkin: skinName });
    }
  }
};

// Used by firestoreService during sync/merge
export const setOwnedSkins = (skinNames: string[]): void => {
  const ownedIds = skinNames.map(skinNameToId);
  cachedUnlockedSkinIds = [...new Set([...DEFAULT_UNLOCKED_SKINS, ...ownedIds])];
  cacheInitialized = true;
};

export const setSelectedSkinCache = (skinName: string): void => {
  cachedSelectedSkinId = skinNameToId(skinName);
  cacheInitialized = true;
};

// Reset cache (for testing)
export const resetSkinCache = (): void => {
  cachedUnlockedSkinIds = [...DEFAULT_UNLOCKED_SKINS];
  cachedSelectedSkinId = 1;
  cacheInitialized = false;
};
