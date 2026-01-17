// Progress Manager for tracking level completion
// Uses Firestore for authenticated users (with built-in offline support)
// Uses localStorage only for guests
import { saveUserData, loadUserData } from './firestoreService';
import { getCurrentUser, isGuest } from './authService';

const STORAGE_KEY = 'geometry-dash-completed-levels';

// In-memory cache for current session
let cachedCompletedLevels: number[] = [];
let cacheInitialized: boolean = false;

// Load progress from appropriate storage
export const syncProgressFromCloud = async (): Promise<void> => {
  const user = getCurrentUser();
  
  if (!user || isGuest()) {
    // Guest: load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      cachedCompletedLevels = saved ? JSON.parse(saved) : [];
    } catch {
      cachedCompletedLevels = [];
    }
  } else {
    // Authenticated: load from Firestore (has built-in offline support)
    try {
      const userData = await loadUserData();
      cachedCompletedLevels = userData?.completedLevels ?? [];
    } catch (error) {
      console.error('Failed to load progress:', error);
      cachedCompletedLevels = [];
    }
  }
  cacheInitialized = true;
};

export const markLevelComplete = async (levelId: number): Promise<void> => {
  if (!cacheInitialized) await syncProgressFromCloud();
  
  if (!cachedCompletedLevels.includes(levelId)) {
    cachedCompletedLevels.push(levelId);
    
    const user = getCurrentUser();
    if (!user || isGuest()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedCompletedLevels));
    } else {
      await saveUserData({ completedLevels: cachedCompletedLevels });
    }
  }
};

export const isLevelUnlocked = (levelId: number): boolean => {
  // Level 1 is always unlocked
  if (levelId === 1) return true;
  
  if (!cacheInitialized) {
    // Sync read for guests from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      cachedCompletedLevels = saved ? JSON.parse(saved) : [];
    } catch {
      cachedCompletedLevels = [];
    }
    cacheInitialized = true;
  }
  // Other levels require the previous level to be completed
  return cachedCompletedLevels.includes(levelId - 1);
};

export const isLevelCompleted = (levelId: number): boolean => {
  if (!cacheInitialized) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      cachedCompletedLevels = saved ? JSON.parse(saved) : [];
    } catch {
      cachedCompletedLevels = [];
    }
    cacheInitialized = true;
  }
  return cachedCompletedLevels.includes(levelId);
};

export const getCompletedLevels = (): number[] => {
  if (!cacheInitialized) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      cachedCompletedLevels = saved ? JSON.parse(saved) : [];
    } catch {
      cachedCompletedLevels = [];
    }
    cacheInitialized = true;
  }
  return [...cachedCompletedLevels];
};

// Used by firestoreService during sync/merge
export const setCompletedLevels = (levels: number[]): void => {
  cachedCompletedLevels = levels;
  cacheInitialized = true;
};

export const resetProgress = async (): Promise<void> => {
  cachedCompletedLevels = [];
  cacheInitialized = true;
  
  const user = getCurrentUser();
  if (!user || isGuest()) {
    localStorage.setItem(STORAGE_KEY, '[]');
  } else {
    await saveUserData({ completedLevels: [] });
  }
};

// Reset cache (for testing)
export const resetProgressCache = (): void => {
  cachedCompletedLevels = [];
  cacheInitialized = false;
};
