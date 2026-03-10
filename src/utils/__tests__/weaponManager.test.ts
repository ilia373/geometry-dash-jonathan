import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Firebase modules
vi.mock('../../config/firebase', () => ({
  db: {},
}));

// Mock firestoreService
vi.mock('../firestoreService', () => ({
  saveUserData: vi.fn(() => Promise.resolve()),
  loadUserData: vi.fn(() => Promise.resolve(null)),
}));

// Mock authService
vi.mock('../authService', () => ({
  getCurrentUser: vi.fn(() => null),
  isGuest: vi.fn(() => true),
}));

// Import after mocks
import {
  getSelectedWeaponId,
  getSelectedWeapon,
  getOwnedWeaponIds,
  isWeaponUnlocked,
  unlockWeapon,
  setSelectedWeapon,
  getWeaponPrice,
  syncWeaponsFromCloud,
  resetWeaponCache,
  setSelectedWeaponCache,
  WEAPON_PRICE,
} from '../weaponManager';
import { getCurrentUser, isGuest } from '../authService';
import { loadUserData } from '../firestoreService';

describe('weaponManager', () => {
  beforeEach(() => {
    localStorage.clear();
    resetWeaponCache();
    vi.clearAllMocks();
    // Default: guest user
    vi.mocked(getCurrentUser).mockReturnValue(null);
    vi.mocked(isGuest).mockReturnValue(true);
    vi.mocked(loadUserData).mockResolvedValue(null);
  });

  describe('getSelectedWeaponId', () => {
    it('should return null by default (no weapon selected)', () => {
      expect(getSelectedWeaponId()).toBeNull();
    });
  });

  describe('getOwnedWeaponIds', () => {
    it('should return empty array by default (no free weapons)', () => {
      expect(getOwnedWeaponIds()).toEqual([]);
    });
  });

  describe('isWeaponUnlocked', () => {
    it('should return false for weapon 1 by default', () => {
      expect(isWeaponUnlocked(1)).toBe(false);
    });
  });

  describe('unlockWeapon', () => {
    it('should make isWeaponUnlocked return true after unlocking', async () => {
      await unlockWeapon(1);
      expect(isWeaponUnlocked(1)).toBe(true);
    });

    it('should persist owned weapons to localStorage as JSON', async () => {
      await unlockWeapon(1);
      const stored = localStorage.getItem('geometry-dash-owned-weapons');
      expect(stored).toBeNull();
      expect(isWeaponUnlocked(1)).toBe(true);
    });

    it('should not duplicate when unlocking the same weapon twice', async () => {
      await unlockWeapon(1);
      await unlockWeapon(1);
      expect(getOwnedWeaponIds().length).toBe(1);
    });
  });

  describe('setSelectedWeapon', () => {
    it('should set selected weapon id', async () => {
      await setSelectedWeapon(1);
      expect(getSelectedWeaponId()).toBe(1);
    });

    it('should return full Weapon object with id: 1 and name: Pistol', async () => {
      await setSelectedWeapon(1);
      const weapon = getSelectedWeapon();
      expect(weapon).not.toBeNull();
      expect(weapon!.id).toBe(1);
      expect(weapon!.name).toBe('Pistol');
    });
  });

  describe('getSelectedWeapon', () => {
    it('should return null when no weapon selected', () => {
      expect(getSelectedWeapon()).toBeNull();
    });
  });

  describe('getWeaponPrice', () => {
    it('should return 50 for weapon 1 (Pistol)', () => {
      expect(getWeaponPrice(1)).toBe(50);
    });

    it('should fall back to default WEAPON_PRICE for unknown weapon id', () => {
      expect(getWeaponPrice(999)).toBe(WEAPON_PRICE);
      expect(getWeaponPrice(999)).toBe(200);
    });
  });

  describe('syncWeaponsFromCloud', () => {
    it('as guest: loads from localStorage (loadUserData not called)', async () => {
      localStorage.setItem('geometry-dash-owned-weapons', JSON.stringify(['pistol']));
      localStorage.setItem('geometry-dash-selected-weapon', 'pistol');

      await syncWeaponsFromCloud();

      // loadUserData should not be called for guests
      expect(loadUserData).not.toHaveBeenCalled();
      expect(isWeaponUnlocked(1)).toBe(false);
      expect(getSelectedWeaponId()).toBeNull();
    });

    it('as authenticated: calls loadUserData and merges ownedWeapons', async () => {
      vi.mocked(getCurrentUser).mockReturnValue({ uid: 'test' } as ReturnType<typeof getCurrentUser>);
      vi.mocked(isGuest).mockReturnValue(false);
      vi.mocked(loadUserData).mockResolvedValue({
        ownedWeapons: ['pistol'],
        selectedWeapon: 'pistol',
      } as Awaited<ReturnType<typeof loadUserData>>);

      await syncWeaponsFromCloud();

      expect(loadUserData).toHaveBeenCalled();
      expect(isWeaponUnlocked(1)).toBe(true);
      expect(getSelectedWeaponId()).toBe(1);
    });
  });

  describe('resetWeaponCache', () => {
    it('should reset selectedWeaponId to null and ownedWeapons to []', async () => {
      await unlockWeapon(1);
      await setSelectedWeapon(1);

      localStorage.clear();
      resetWeaponCache();

      expect(getSelectedWeaponId()).toBeNull();
      expect(getOwnedWeaponIds()).toEqual([]);
    });
  });

  describe('setSelectedWeaponCache', () => {
    it('should set selected weapon to weapon with name matching pistol', () => {
      setSelectedWeaponCache('pistol');
      expect(getSelectedWeaponId()).toBe(1);
    });
  });
});
