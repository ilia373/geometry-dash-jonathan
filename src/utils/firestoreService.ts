// Firestore service for persisting user data
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser, isGuest, onAuthChange } from './authService';
import { getUnlockedUniverses } from './universeManager';
import { getTotalCoins, setCoins } from './walletManager';
import { getCompletedLevels, setCompletedLevels } from './progressManager';
import {
  getOwnedSkinNames,
  getSelectedSkinName,
  setOwnedSkins,
  setSelectedSkinCache,
} from './skinManager';
import { getOwnedWeaponNames, getSelectedWeaponName, setOwnedWeapons, setSelectedWeaponCache } from './weaponManager';

// User data structure stored in Firestore
export interface UserData {
  coins: number;
  completedLevels: number[];
  bestProgress: Record<number, number>;
  selectedSkin: string;
  ownedSkins: string[];
  selectedWeapon?: string;
  ownedWeapons?: string[];
  unlockedUniverses: string[];
  lastUpdated: number;
}

// Default user data
const defaultUserData: UserData = {
  coins: 0,
  completedLevels: [],
  bestProgress: {},
  selectedSkin: 'default',
  ownedSkins: ['default'],
  selectedWeapon: '',
  ownedWeapons: [],
  unlockedUniverses: ['milky-way'],
  lastUpdated: Date.now(),
};

// Local storage keys for guests
const LOCAL_KEYS = {
  coins: 'geometry-dash-coins',
  completedLevels: 'geometry-dash-completed-levels',
  bestProgress: 'geometry-dash-best-progress',
  selectedSkin: 'geometry-dash-selected-skin',
  ownedSkins: 'geometry-dash-owned-skins',
  selectedWeapon: 'geometry-dash-selected-weapon',
  ownedWeapons: 'geometry-dash-owned-weapons',
  unlockedUniverses: 'geometry-dash-unlocked-universes',
};

// Active listener unsubscribe function
let activeUnsubscribe: Unsubscribe | null = null;

// Get user document reference
const getUserDocRef = (uid: string) => doc(db, 'users', uid);

// Load user data from Firestore
export const loadUserData = async (): Promise<UserData | null> => {
  const user = getCurrentUser();
  
  if (!user || isGuest()) {
    // Load from localStorage for guests
    return getSessionData();
  }

  try {
    const docRef = getUserDocRef(user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<UserData>;
      return {
        coins: data.coins ?? 0,
        completedLevels: data.completedLevels ?? [],
        bestProgress: data.bestProgress ?? {},
        selectedSkin: data.selectedSkin ?? 'default',
        ownedSkins: data.ownedSkins ?? ['default'],
        selectedWeapon: data.selectedWeapon ?? '',
        ownedWeapons: data.ownedWeapons ?? [],
        unlockedUniverses: data.unlockedUniverses ?? ['milky-way'],
        lastUpdated: data.lastUpdated ?? Date.now(),
      };
    } else {
      // Create new user document with local data (migration)
      const localData = loadLocalData();
      await setDoc(docRef, { ...localData, lastUpdated: Date.now() });
      return localData;
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    return loadLocalData();
  }
};

// Save user data to Firestore
export const saveUserData = async (data: Partial<UserData>): Promise<void> => {
  const user = getCurrentUser();
  
  if (!user || isGuest()) {
    return;
  }

  try {
    const docRef = getUserDocRef(user.uid);
    await updateDoc(docRef, { ...data, lastUpdated: Date.now() });
  } catch {
    // Document might not exist, try to create it
    try {
      const docRef = getUserDocRef(user.uid);
      const existingData = loadLocalData();
      await setDoc(docRef, { ...existingData, ...data, lastUpdated: Date.now() });
    } catch (innerError) {
      console.error('Error saving user data:', innerError);
      // Fallback to localStorage
      saveLocalData(data);
    }
  }
};

// Subscribe to real-time updates
export const subscribeToUserData = (
  callback: (data: UserData) => void
): (() => void) => {
  // Clean up existing listener
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }

  const user = getCurrentUser();
  
  if (!user || isGuest()) {
    // For guests, just call with local data once
    callback(getSessionData());
    return () => {};
  }

  const docRef = getUserDocRef(user.uid);
  activeUnsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as UserData);
      } else {
        callback(defaultUserData);
      }
    },
    (error) => {
      console.error('Error subscribing to user data:', error);
      callback(loadLocalData());
    }
  );

  return () => {
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }
  };
};

export const getSessionData = (): UserData => {
  return {
    coins: getTotalCoins(),
    completedLevels: getCompletedLevels(),
    bestProgress: {},
    selectedSkin: getSelectedSkinName(),
    ownedSkins: getOwnedSkinNames(),
    selectedWeapon: getSelectedWeaponName(),
    ownedWeapons: getOwnedWeaponNames(),
    unlockedUniverses: getUnlockedUniverses(),
    lastUpdated: Date.now(),
  };
};

export const clearGuestLocalStorage = (): void => {
  try {
    Object.values(LOCAL_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing guest localStorage:', error);
  }
};

export const hasGuestSessionProgress = (): boolean => {
  const data = getSessionData();
  return (
    data.coins > 0 ||
    data.completedLevels.length > 0 ||
    data.ownedSkins.length > 1 ||
    (data.ownedWeapons ?? []).length > 0
  );
};

// Load data from localStorage
const loadLocalData = (): UserData => {
  try {
    return {
      coins: parseInt(localStorage.getItem(LOCAL_KEYS.coins) || '0', 10),
      completedLevels: JSON.parse(
        localStorage.getItem(LOCAL_KEYS.completedLevels) || '[]'
      ),
      bestProgress: JSON.parse(
        localStorage.getItem(LOCAL_KEYS.bestProgress) || '{}'
      ),
      selectedSkin: localStorage.getItem(LOCAL_KEYS.selectedSkin) || 'default',
      ownedSkins: JSON.parse(
        localStorage.getItem(LOCAL_KEYS.ownedSkins) || '["default"]'
      ),
      selectedWeapon: localStorage.getItem(LOCAL_KEYS.selectedWeapon) || '',
      ownedWeapons: JSON.parse(
        localStorage.getItem(LOCAL_KEYS.ownedWeapons) || '[]'
      ),
      unlockedUniverses: JSON.parse(
        localStorage.getItem(LOCAL_KEYS.unlockedUniverses) || '["milky-way"]'
      ),
      lastUpdated: Date.now(),
    };
  } catch {
    return defaultUserData;
  }
};

// Save data to localStorage
const saveLocalData = (data: Partial<UserData>): void => {
  try {
    if (data.coins !== undefined) {
      localStorage.setItem(LOCAL_KEYS.coins, data.coins.toString());
    }
    if (data.completedLevels !== undefined) {
      localStorage.setItem(
        LOCAL_KEYS.completedLevels,
        JSON.stringify(data.completedLevels)
      );
    }
    if (data.bestProgress !== undefined) {
      localStorage.setItem(
        LOCAL_KEYS.bestProgress,
        JSON.stringify(data.bestProgress)
      );
    }
    if (data.selectedSkin !== undefined) {
      localStorage.setItem(LOCAL_KEYS.selectedSkin, data.selectedSkin);
    }
    if (data.ownedSkins !== undefined) {
      localStorage.setItem(LOCAL_KEYS.ownedSkins, JSON.stringify(data.ownedSkins));
    }
    if (data.selectedWeapon !== undefined) {
      localStorage.setItem(LOCAL_KEYS.selectedWeapon, data.selectedWeapon);
    }
    if (data.ownedWeapons !== undefined) {
      localStorage.setItem(LOCAL_KEYS.ownedWeapons, JSON.stringify(data.ownedWeapons));
    }
    if (data.unlockedUniverses !== undefined) {
      localStorage.setItem(LOCAL_KEYS.unlockedUniverses, JSON.stringify(data.unlockedUniverses));
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Sync local data to Firestore when user logs in
export const syncLocalToCloud = async (): Promise<void> => {
  const user = getCurrentUser();
  if (!user || isGuest()) return;

  const localData = getSessionData();
  const cloudData = await loadUserData();

  if (!cloudData) {
    // No cloud data, upload local
    await saveUserData(localData);
    return;
  }

  // Merge: take the better of local or cloud
  const mergedData: UserData = {
    coins: Math.max(localData.coins, cloudData.coins),
    completedLevels: [
      ...new Set([...localData.completedLevels, ...cloudData.completedLevels]),
    ],
    bestProgress: { ...cloudData.bestProgress },
    selectedSkin: cloudData.selectedSkin || localData.selectedSkin,
    ownedSkins: [
      ...new Set([...localData.ownedSkins, ...cloudData.ownedSkins]),
    ],
    selectedWeapon: cloudData.selectedWeapon || localData.selectedWeapon,
    ownedWeapons: [
      ...new Set([...(localData.ownedWeapons ?? []), ...(cloudData.ownedWeapons ?? [])]),
    ],
    unlockedUniverses: [
      ...new Set([...(localData.unlockedUniverses ?? ['milky-way']), ...(cloudData.unlockedUniverses ?? ['milky-way'])]),
    ],
    lastUpdated: Date.now(),
  };

  // Merge best progress
  for (const [level, progress] of Object.entries(localData.bestProgress)) {
    const levelNum = parseInt(level, 10);
    if (!mergedData.bestProgress[levelNum] || progress > mergedData.bestProgress[levelNum]) {
      mergedData.bestProgress[levelNum] = progress as number;
    }
  }

  await saveUserData(mergedData);
  
  // Update wallet cache with merged coins
  setCoins(mergedData.coins);
  
  // Update progress cache with merged completed levels
  setCompletedLevels(mergedData.completedLevels);
  
  // Update skin cache with merged skins
  setOwnedSkins(mergedData.ownedSkins);
  setSelectedSkinCache(mergedData.selectedSkin);
  
  setOwnedWeapons(mergedData.ownedWeapons ?? []);
  setSelectedWeaponCache(mergedData.selectedWeapon ?? '');
};

// Initialize Firestore sync on auth changes
export const initializeFirestoreSync = (): void => {
  onAuthChange(async (user) => {
    if (user && !user.isGuest) {
      // User logged in, sync data
      await syncLocalToCloud();
    }
  });
};
