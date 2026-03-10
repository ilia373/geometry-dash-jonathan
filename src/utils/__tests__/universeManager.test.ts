import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../config/firebase', () => ({
  db: {},
}));

vi.mock('../firestoreService', () => ({
  saveUserData: vi.fn(() => Promise.resolve()),
  loadUserData: vi.fn(() => Promise.resolve(null)),
}));

const mockGetCurrentUser = vi.fn(() => null);
const mockIsGuest = vi.fn(() => true);
const mockGetCompletedLevels = vi.fn<() => number[]>(() => []);

vi.mock('../authService', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  isGuest: () => mockIsGuest(),
}));

vi.mock('../progressManager', () => ({
  getCompletedLevels: () => mockGetCompletedLevels(),
}));

import {
  getUnlockedUniverses,
  isUniverseUnlocked,
  unlockUniverse,
  isUniverseCompleted,
  getUniverseCompletion,
  setUnlockedUniverses,
  resetUniverseCache,
  syncUniversesFromCloud,
} from '../universeManager';

describe('universeManager', () => {
  beforeEach(() => {
    localStorage.clear();
    resetUniverseCache();
    vi.clearAllMocks();
    mockGetCurrentUser.mockReturnValue(null);
    mockIsGuest.mockReturnValue(true);
    mockGetCompletedLevels.mockReturnValue([]);
  });

  describe('getUnlockedUniverses', () => {
    it('should return milky-way by default when localStorage is empty', () => {
      const universes = getUnlockedUniverses();
      expect(universes).toContain('milky-way');
    });

    it('should return values from localStorage if present', () => {
      setUnlockedUniverses(['milky-way', 'andromeda']);
      const universes = getUnlockedUniverses();
      expect(universes).toContain('milky-way');
      expect(universes).toContain('andromeda');
    });

    it('should return a copy (not the internal reference)', () => {
      const first = getUnlockedUniverses();
      const second = getUnlockedUniverses();
      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });
  });

  describe('isUniverseUnlocked', () => {
    it('should return true for milky-way by default', () => {
      expect(isUniverseUnlocked('milky-way')).toBe(true);
    });

    it('should return false for andromeda by default', () => {
      expect(isUniverseUnlocked('andromeda')).toBe(false);
    });

    it('should return true after unlocking a universe', async () => {
      await unlockUniverse('andromeda');
      expect(isUniverseUnlocked('andromeda')).toBe(true);
    });
  });

  describe('unlockUniverse', () => {
    it('should not duplicate an already-unlocked universe', async () => {
      await unlockUniverse('milky-way');
      await unlockUniverse('milky-way');
      const universes = getUnlockedUniverses();
      expect(universes.filter(id => id === 'milky-way')).toHaveLength(1);
    });

    it('should persist to localStorage for guest users', async () => {
      await unlockUniverse('andromeda');
      expect(isUniverseUnlocked('andromeda')).toBe(true);
      expect(localStorage.getItem('geometry-dash-unlocked-universes')).toBeNull();
    });
  });

  describe('setUnlockedUniverses', () => {
    it('should replace the cache with the provided array', () => {
      setUnlockedUniverses(['milky-way', 'andromeda', 'quantum-realm']);
      const universes = getUnlockedUniverses();
      expect(universes).toEqual(['milky-way', 'andromeda', 'quantum-realm']);
    });
  });

  describe('isUniverseCompleted', () => {
    it('should return false when no levels are completed', () => {
      expect(isUniverseCompleted('milky-way')).toBe(false);
    });

    it('should return false when only some levels are completed', () => {
      mockGetCompletedLevels.mockReturnValue([1, 2, 3]);
      expect(isUniverseCompleted('milky-way')).toBe(false);
    });

    it('should return true when all 6 milky-way levels are completed', () => {
      mockGetCompletedLevels.mockReturnValue([1, 2, 3, 4, 5, 6]);
      expect(isUniverseCompleted('milky-way')).toBe(true);
    });

    it('should return false for an invalid universe id', () => {
      expect(isUniverseCompleted('does-not-exist')).toBe(false);
    });

    it('should return false for a coming-soon universe with no levelIds', () => {
      expect(isUniverseCompleted('andromeda')).toBe(false);
    });
  });

  describe('getUniverseCompletion', () => {
    it('should return total=6 for milky-way', () => {
      const result = getUniverseCompletion('milky-way');
      expect(result.total).toBe(6);
    });

    it('should return completed=0 when nothing done', () => {
      const result = getUniverseCompletion('milky-way');
      expect(result.completed).toBe(0);
    });

    it('should count only levels in this universe', () => {
      mockGetCompletedLevels.mockReturnValue([1, 2, 3]);
      const result = getUniverseCompletion('milky-way');
      expect(result.completed).toBe(3);
      expect(result.total).toBe(6);
    });

    it('should return 0/0 for an invalid universe id', () => {
      const result = getUniverseCompletion('does-not-exist');
      expect(result).toEqual({ completed: 0, total: 0 });
    });
  });

  describe('syncUniversesFromCloud', () => {
    it('should load milky-way as default when localStorage is empty (guest)', async () => {
      await syncUniversesFromCloud();
      expect(isUniverseUnlocked('milky-way')).toBe(true);
    });

    it('should load data from localStorage for guest users', async () => {
      await syncUniversesFromCloud();
      expect(isUniverseUnlocked('andromeda')).toBe(false);
      expect(isUniverseUnlocked('milky-way')).toBe(true);
    });
  });

  describe('resetUniverseCache', () => {
    it('should clear the in-memory cache so defaults are re-read', () => {
      setUnlockedUniverses(['milky-way', 'andromeda']);
      resetUniverseCache();
      const universes = getUnlockedUniverses();
      expect(universes).toContain('milky-way');
      expect(universes).not.toContain('andromeda');
    });
  });
});
