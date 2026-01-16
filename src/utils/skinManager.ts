// Skin Manager - handles saving and loading the selected skin
import { SKINS, getSkinById, type Skin } from '../types/skins';

const SKIN_STORAGE_KEY = 'geometry-dash-selected-skin';
const UNLOCKED_SKINS_KEY = 'geometry-dash-unlocked-skins';

// Skin price in coins
export const SKIN_PRICE = 200;

// Get the price of a specific skin (uses custom price or default)
export const getSkinPrice = (skinId: number): number => {
  const skin = getSkinById(skinId);
  return skin.price ?? SKIN_PRICE;
};

// Default skins (IDs 1-6) are always unlocked
const DEFAULT_UNLOCKED_SKINS = [1, 2, 3, 4, 5, 6];

// Get unlocked skin IDs from localStorage
export const getUnlockedSkinIds = (): number[] => {
  try {
    const stored = localStorage.getItem(UNLOCKED_SKINS_KEY);
    if (stored) {
      const unlocked = JSON.parse(stored) as number[];
      // Always include default skins
      return [...new Set([...DEFAULT_UNLOCKED_SKINS, ...unlocked])];
    }
  } catch (error) {
    console.warn('Failed to load unlocked skins:', error);
  }
  return [...DEFAULT_UNLOCKED_SKINS];
};

// Check if a skin is unlocked
export const isSkinUnlocked = (skinId: number): boolean => {
  return getUnlockedSkinIds().includes(skinId);
};

// Unlock a skin (add to unlocked list)
export const unlockSkin = (skinId: number): void => {
  try {
    const unlocked = getUnlockedSkinIds();
    if (!unlocked.includes(skinId)) {
      unlocked.push(skinId);
      localStorage.setItem(UNLOCKED_SKINS_KEY, JSON.stringify(unlocked));
    }
  } catch (error) {
    console.warn('Failed to unlock skin:', error);
  }
};

// Get the currently selected skin ID from localStorage
export const getSelectedSkinId = (): number => {
  try {
    const stored = localStorage.getItem(SKIN_STORAGE_KEY);
    if (stored) {
      const id = parseInt(stored, 10);
      // Validate that the skin exists
      if (id >= 1 && id <= SKINS.length) {
        return id;
      }
    }
  } catch (error) {
    console.warn('Failed to load skin from storage:', error);
  }
  return 1; // Default to classic green
};

// Get the currently selected skin
export const getSelectedSkin = (): Skin => {
  return getSkinById(getSelectedSkinId());
};

// Set the selected skin
export const setSelectedSkin = (skinId: number): void => {
  try {
    // Validate the skin ID
    if (skinId >= 1 && skinId <= SKINS.length) {
      localStorage.setItem(SKIN_STORAGE_KEY, skinId.toString());
    }
  } catch (error) {
    console.warn('Failed to save skin to storage:', error);
  }
};
