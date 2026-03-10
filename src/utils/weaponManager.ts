// Weapon Manager - handles saving and loading the selected weapon
// Uses Firestore for authenticated users (with built-in offline support)
// Uses localStorage only for guests
import { WEAPONS, getWeaponById, type Weapon } from '../types/weapons';
import { saveUserData, loadUserData } from './firestoreService';
import { getCurrentUser, isGuest } from './authService';

const WEAPON_STORAGE_KEY = 'geometry-dash-selected-weapon';
const OWNED_WEAPONS_KEY = 'geometry-dash-owned-weapons';

// Weapon price in coins
export const WEAPON_PRICE = 200;

// Get the price of a specific weapon (uses weapon's own price)
export const getWeaponPrice = (weaponId: number): number => {
  const weapon = getWeaponById(weaponId);
  return weapon?.price ?? WEAPON_PRICE;
};

// Default weapons — none are free (empty array)
const DEFAULT_UNLOCKED_WEAPONS: number[] = [];

// Convert weapon IDs to weapon names for Firestore (stored as string names)
const weaponIdToName = (id: number): string => {
  const weapon = getWeaponById(id);
  if (!weapon) return String(id);
  return weapon.name.toLowerCase().replace(/\s+/g, '-');
};

const nameToWeaponId = (name: string): number | null => {
  const weapon = WEAPONS.find(
    (w) => w.name.toLowerCase().replace(/\s+/g, '-') === name || w.name.toLowerCase() === name
  );
  return weapon?.id ?? null;
};

// In-memory cache for current session
let cachedOwnedWeaponIds: number[] = [...DEFAULT_UNLOCKED_WEAPONS];
let cachedSelectedWeaponId: number | null = null;
let cacheInitialized: boolean = false;

// Load from localStorage (for guests only)
const loadFromLocalStorage = (): void => {
  if (isGuest()) return;
  try {
    const storedOwned = localStorage.getItem(OWNED_WEAPONS_KEY);
    if (storedOwned) {
      const parsed = JSON.parse(storedOwned);
      if (Array.isArray(parsed)) {
        if (typeof parsed[0] === 'string') {
          const ids = parsed.map(nameToWeaponId).filter((id): id is number => id !== null);
          cachedOwnedWeaponIds = [...new Set([...DEFAULT_UNLOCKED_WEAPONS, ...ids])];
        } else {
          cachedOwnedWeaponIds = [...new Set([...DEFAULT_UNLOCKED_WEAPONS, ...parsed])];
        }
      }
    }

    const storedSelected = localStorage.getItem(WEAPON_STORAGE_KEY);
    if (storedSelected) {
      const id = parseInt(storedSelected, 10);
      if (!isNaN(id) && WEAPONS.find((w) => w.id === id)) {
        cachedSelectedWeaponId = id;
      } else {
        const resolvedId = nameToWeaponId(storedSelected);
        cachedSelectedWeaponId = resolvedId;
      }
    }
    // If no stored selected weapon, cachedSelectedWeaponId stays null
  } catch {
    cachedOwnedWeaponIds = [...DEFAULT_UNLOCKED_WEAPONS];
    cachedSelectedWeaponId = null;
  }
};

// Load weapons from appropriate storage
export const syncWeaponsFromCloud = async (): Promise<void> => {
  const user = getCurrentUser();

  if (!user || isGuest()) {
    // Guest: load from localStorage
    loadFromLocalStorage();
  } else {
    // Authenticated: load from Firestore (has built-in offline support)
    try {
      const userData = await loadUserData();
      if (userData) {
        if (userData.ownedWeapons && userData.ownedWeapons.length > 0) {
          const ownedIds = userData.ownedWeapons
            .map(nameToWeaponId)
            .filter((id): id is number => id !== null);
          cachedOwnedWeaponIds = [...new Set([...DEFAULT_UNLOCKED_WEAPONS, ...ownedIds])];
        }
        if (userData.selectedWeapon) {
          const resolvedId = nameToWeaponId(userData.selectedWeapon);
          cachedSelectedWeaponId = resolvedId;
        }
      }
    } catch (error) {
      console.error('Failed to load weapons:', error);
      cachedOwnedWeaponIds = [...DEFAULT_UNLOCKED_WEAPONS];
      cachedSelectedWeaponId = null;
    }
  }
  cacheInitialized = true;
};

// Get owned weapon IDs
export const getOwnedWeaponIds = (): number[] => {
  if (!cacheInitialized) loadFromLocalStorage();
  return [...cachedOwnedWeaponIds];
};

// Check if a weapon is unlocked
export const isWeaponUnlocked = (weaponId: number): boolean => {
  if (!cacheInitialized) loadFromLocalStorage();
  return cachedOwnedWeaponIds.includes(weaponId);
};

// Unlock a weapon (add to owned list)
export const unlockWeapon = async (weaponId: number): Promise<void> => {
  if (!cacheInitialized) await syncWeaponsFromCloud();

  if (!cachedOwnedWeaponIds.includes(weaponId)) {
    cachedOwnedWeaponIds.push(weaponId);
    const ownedWeaponNames = cachedOwnedWeaponIds.map(weaponIdToName);

    const user = getCurrentUser();
    if (!user || isGuest()) {
    } else {
      await saveUserData({ ownedWeapons: ownedWeaponNames });
    }
  }
};

// Get the currently selected weapon ID (null = no weapon equipped)
export const getSelectedWeaponId = (): number | null => {
  if (!cacheInitialized) loadFromLocalStorage();
  return cachedSelectedWeaponId;
};

// Get the currently selected weapon (null = no weapon equipped)
export const getSelectedWeapon = (): Weapon | null => {
  const id = getSelectedWeaponId();
  if (id === null) return null;
  return getWeaponById(id) ?? null;
};

// Set the selected weapon
export const setSelectedWeapon = async (weaponId: number): Promise<void> => {
  if (!cacheInitialized) await syncWeaponsFromCloud();

  if (WEAPONS.find((w) => w.id === weaponId)) {
    cachedSelectedWeaponId = weaponId;
    const weaponName = weaponIdToName(weaponId);

    const user = getCurrentUser();
    if (!user || isGuest()) {
    } else {
      await saveUserData({ selectedWeapon: weaponName });
    }
  }
};

// Used by firestoreService during sync/merge
export const setOwnedWeapons = (weaponNames: string[]): void => {
  const ownedIds = weaponNames
    .map(nameToWeaponId)
    .filter((id): id is number => id !== null);
  cachedOwnedWeaponIds = [...new Set([...DEFAULT_UNLOCKED_WEAPONS, ...ownedIds])];
  cacheInitialized = true;
};

export const setSelectedWeaponCache = (weaponName: string): void => {
  cachedSelectedWeaponId = nameToWeaponId(weaponName);
  cacheInitialized = true;
};

// Reset cache (for testing)
export const resetWeaponCache = (): void => {
  cachedOwnedWeaponIds = [...DEFAULT_UNLOCKED_WEAPONS];
  cachedSelectedWeaponId = null;
  cacheInitialized = false;
};

export const getOwnedWeaponNames = (): string[] => {
  if (!cacheInitialized) loadFromLocalStorage();
  return cachedOwnedWeaponIds.map(weaponIdToName);
};

export const getSelectedWeaponName = (): string => {
  if (!cacheInitialized) loadFromLocalStorage();
  return cachedSelectedWeaponId !== null ? weaponIdToName(cachedSelectedWeaponId) : '';
};
