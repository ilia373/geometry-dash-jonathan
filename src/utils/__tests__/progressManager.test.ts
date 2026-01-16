import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadProgress,
  saveProgress,
  markLevelComplete,
  isLevelUnlocked,
  isLevelCompleted,
  resetProgress,
} from '../progressManager';

describe('progressManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadProgress', () => {
    it('should return default progress when no data exists', () => {
      const progress = loadProgress();
      expect(progress).toEqual({ completedLevels: [] });
    });

    it('should return saved progress data', () => {
      localStorage.setItem('geometry-dash-progress', JSON.stringify({ completedLevels: [1, 2] }));
      const progress = loadProgress();
      expect(progress).toEqual({ completedLevels: [1, 2] });
    });

    it('should return default progress on invalid JSON', () => {
      localStorage.setItem('geometry-dash-progress', 'invalid-json');
      const progress = loadProgress();
      expect(progress).toEqual({ completedLevels: [] });
    });
  });

  describe('saveProgress', () => {
    it('should save progress data to localStorage', () => {
      saveProgress({ completedLevels: [1, 2, 3] });
      const saved = localStorage.getItem('geometry-dash-progress');
      expect(JSON.parse(saved!)).toEqual({ completedLevels: [1, 2, 3] });
    });
  });

  describe('markLevelComplete', () => {
    it('should mark a level as complete', () => {
      markLevelComplete(1);
      expect(isLevelCompleted(1)).toBe(true);
    });

    it('should not duplicate completed levels', () => {
      markLevelComplete(1);
      markLevelComplete(1);
      const progress = loadProgress();
      expect(progress.completedLevels.filter(l => l === 1).length).toBe(1);
    });

    it('should mark multiple levels as complete', () => {
      markLevelComplete(1);
      markLevelComplete(2);
      markLevelComplete(3);
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

    it('should unlock level 2 after completing level 1', () => {
      markLevelComplete(1);
      expect(isLevelUnlocked(2)).toBe(true);
    });

    it('should unlock level 3 after completing level 2', () => {
      markLevelComplete(1);
      markLevelComplete(2);
      expect(isLevelUnlocked(3)).toBe(true);
    });

    it('should not unlock level 3 without completing level 2', () => {
      markLevelComplete(1);
      expect(isLevelUnlocked(3)).toBe(false);
    });
  });

  describe('isLevelCompleted', () => {
    it('should return false for uncompleted levels', () => {
      expect(isLevelCompleted(1)).toBe(false);
    });

    it('should return true for completed levels', () => {
      markLevelComplete(1);
      expect(isLevelCompleted(1)).toBe(true);
    });
  });

  describe('resetProgress', () => {
    it('should reset all progress', () => {
      markLevelComplete(1);
      markLevelComplete(2);
      resetProgress();
      expect(isLevelCompleted(1)).toBe(false);
      expect(isLevelCompleted(2)).toBe(false);
      expect(isLevelUnlocked(2)).toBe(false);
    });
  });
});
