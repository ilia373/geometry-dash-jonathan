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
  markLevelComplete,
  isLevelUnlocked,
  isLevelCompleted,
  resetProgress,
  setCompletedLevels,
  getCompletedLevels,
  resetProgressCache,
} from '../progressManager';

describe('progressManager', () => {
  beforeEach(() => {
    localStorage.clear();
    resetProgressCache();
  });

  describe('markLevelComplete', () => {
    it('should mark a level as complete', async () => {
      await markLevelComplete(1);
      expect(isLevelCompleted(1)).toBe(true);
    });

    it('should not duplicate completed levels', async () => {
      await markLevelComplete(1);
      await markLevelComplete(1);
      const completedLevels = getCompletedLevels();
      expect(completedLevels.filter(l => l === 1).length).toBe(1);
    });

    it('should mark multiple levels as complete', async () => {
      await markLevelComplete(1);
      await markLevelComplete(2);
      await markLevelComplete(3);
      expect(isLevelCompleted(1)).toBe(true);
      expect(isLevelCompleted(2)).toBe(true);
      expect(isLevelCompleted(3)).toBe(true);
    });
  });

  describe('isLevelUnlocked', () => {
    it('should always have level 1 unlocked', () => {
      expect(isLevelUnlocked(1)).toBe(true);
    });

    it('should not unlock level 2 without completing level 1', () => {
      expect(isLevelUnlocked(2)).toBe(false);
    });

    it('should unlock level 2 after completing level 1', async () => {
      await markLevelComplete(1);
      expect(isLevelUnlocked(2)).toBe(true);
    });

    it('should unlock level 3 after completing level 2', async () => {
      await markLevelComplete(1);
      await markLevelComplete(2);
      expect(isLevelUnlocked(3)).toBe(true);
    });

    it('should not unlock level 3 without completing level 2', async () => {
      await markLevelComplete(1);
      expect(isLevelUnlocked(3)).toBe(false);
    });
  });

  describe('isLevelCompleted', () => {
    it('should return false for uncompleted levels', () => {
      expect(isLevelCompleted(1)).toBe(false);
    });

    it('should return true for completed levels', async () => {
      await markLevelComplete(1);
      expect(isLevelCompleted(1)).toBe(true);
    });
  });

  describe('resetProgress', () => {
    it('should reset all progress', async () => {
      await markLevelComplete(1);
      await markLevelComplete(2);
      await resetProgress();
      expect(isLevelCompleted(1)).toBe(false);
      expect(isLevelCompleted(2)).toBe(false);
      expect(isLevelUnlocked(2)).toBe(false);
    });
  });

  describe('setCompletedLevels', () => {
    it('should set completed levels directly', () => {
      setCompletedLevels([1, 2, 3]);
      expect(getCompletedLevels()).toEqual([1, 2, 3]);
    });
  });
});
