// Universe Manager for tracking unlocked universes
// Uses Firestore for authenticated users (with built-in offline support)
// Uses localStorage only for guests
import { saveUserData, loadUserData } from './firestoreService';
import { getCurrentUser, isGuest } from './authService';
import { getCompletedLevels } from './progressManager';
import { getUniverseById } from '../constants/universeConfig';

const STORAGE_KEY = 'geometry-dash-unlocked-universes';

// In-memory cache for current session
let cachedUnlockedUniverses: string[] = [];
let cacheInitialized: boolean = false;

// Load universe unlock state from appropriate storage
export const syncUniversesFromCloud = async (): Promise<void> => {
  const user = getCurrentUser();

  // Preserve any in-memory unlocks that haven't been persisted yet
  const currentCache = [...cachedUnlockedUniverses];

  if (!user || isGuest()) {
    // Guest: load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const fromStorage: string[] = saved ? JSON.parse(saved) : [];
      // Merge localStorage with any in-memory unlocks
      const merged = Array.from(new Set([...fromStorage, ...currentCache]));
      cachedUnlockedUniverses = merged.length > 0 ? merged : ['milky-way'];
    } catch {
      cachedUnlockedUniverses = currentCache.length > 0 ? currentCache : ['milky-way'];
    }
  } else {
    // Authenticated: load from Firestore (has built-in offline support)
    try {
      const userData = await loadUserData();
      const fromFirestore: string[] = userData?.unlockedUniverses ?? [];
      // Merge Firestore data with in-memory cache to avoid losing recent unlocks
      const merged = Array.from(new Set([...fromFirestore, ...currentCache]));
      cachedUnlockedUniverses = merged.length > 0 ? merged : ['milky-way'];
    } catch (error) {
      console.error('Failed to load universe data:', error);
      cachedUnlockedUniverses = currentCache.length > 0 ? currentCache : ['milky-way'];
    }
  }

  // Always persist to localStorage as fallback
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedUnlockedUniverses));
  cacheInitialized = true;
};

export const getUnlockedUniverses = (): string[] => {
  if (!cacheInitialized) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      cachedUnlockedUniverses = saved ? JSON.parse(saved) : ['milky-way'];
    } catch {
      cachedUnlockedUniverses = ['milky-way'];
    }
    cacheInitialized = true;
  }
  return [...cachedUnlockedUniverses];
};

export const unlockUniverse = async (id: string): Promise<void> => {
  if (!cacheInitialized) await syncUniversesFromCloud();

  if (!cachedUnlockedUniverses.includes(id)) {
    cachedUnlockedUniverses.push(id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedUnlockedUniverses));

    const user = getCurrentUser();
    if (user && !isGuest()) {
      await saveUserData({ unlockedUniverses: cachedUnlockedUniverses });
    }
  }
};

export const isUniverseUnlocked = (id: string): boolean => {
  if (!cacheInitialized) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      cachedUnlockedUniverses = saved ? JSON.parse(saved) : ['milky-way'];
    } catch {
      cachedUnlockedUniverses = ['milky-way'];
    }
    cacheInitialized = true;
  }
  return cachedUnlockedUniverses.includes(id);
};

// Check if ALL levelIds for that universe are in completedLevels from progressManager
export const isUniverseCompleted = (universeId: string): boolean => {
  const universe = getUniverseById(universeId);
  if (!universe || universe.levelIds.length === 0) return false;

  const completedLevels = getCompletedLevels();
  return universe.levelIds.every((levelId: number) => completedLevels.includes(levelId));
};

// Count completed levels / total levels for that universe
export const getUniverseCompletion = (universeId: string): { completed: number; total: number } => {
  const universe = getUniverseById(universeId);
  if (!universe) return { completed: 0, total: 0 };

  const completedLevels = getCompletedLevels();
  const completed = universe.levelIds.filter((levelId: number) =>
    completedLevels.includes(levelId)
  ).length;

  return { completed, total: universe.levelIds.length };
};

// Direct setter - used by firestoreService during sync
export const setUnlockedUniverses = (ids: string[]): void => {
  cachedUnlockedUniverses = ids;
  cacheInitialized = true;
};

// Clear cache (for testing and sign-out)
export const resetUniverseCache = (): void => {
  cachedUnlockedUniverses = [];
  cacheInitialized = false;
};
