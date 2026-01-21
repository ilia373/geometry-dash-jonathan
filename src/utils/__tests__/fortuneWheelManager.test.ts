import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WHEEL_PORTIONS,
  WHEEL_COOLDOWN_MS,
  DEFAULT_SPINS,
  getWeightedRandomPortion,
  getLastWheelTime,
  setLastWheelTime,
  resetSpins,
  getSpinsLeft,
  saveSpins,
  shouldShowWheel,
  initializeWheelForNewUser,
} from '../fortuneWheelManager';

describe('fortuneWheelManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('WHEEL_PORTIONS', () => {
    it('should have 8 portions', () => {
      expect(WHEEL_PORTIONS).toHaveLength(8);
    });

    it('should have unique ids for each portion', () => {
      const ids = WHEEL_PORTIONS.map(p => p.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(8);
    });

    it('should have probabilities that sum to 100', () => {
      const totalProbability = WHEEL_PORTIONS.reduce((sum, p) => sum + p.probability, 0);
      expect(totalProbability).toBe(100);
    });

    it('should have valid reward types', () => {
      WHEEL_PORTIONS.forEach(portion => {
        expect(['coins', 'skin']).toContain(portion.reward.type);
        if (portion.reward.type === 'coins') {
          expect(portion.reward.amount).toBeDefined();
          expect(portion.reward.amount).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('WHEEL_COOLDOWN_MS', () => {
    it('should be 10 hours in milliseconds', () => {
      expect(WHEEL_COOLDOWN_MS).toBe(10 * 60 * 60 * 1000);
    });
  });

  describe('DEFAULT_SPINS', () => {
    it('should be 2', () => {
      expect(DEFAULT_SPINS).toBe(2);
    });
  });

  describe('getWeightedRandomPortion', () => {
    it('should return a valid wheel portion', () => {
      const result = getWeightedRandomPortion();
      expect(WHEEL_PORTIONS).toContain(result);
    });

    it('should return different portions over multiple calls (statistical test)', () => {
      const results = new Set<string>();
      // Run 100 times to get statistical variety
      for (let i = 0; i < 100; i++) {
        const portion = getWeightedRandomPortion();
        results.add(portion.id);
      }
      // Should get at least 3 different portions (highly likely with 100 calls)
      expect(results.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getLastWheelTime', () => {
    it('should return 0 when no time is stored', () => {
      expect(getLastWheelTime()).toBe(0);
    });

    it('should return stored time', () => {
      localStorage.setItem('geometry-dash-last-wheel-time', '1234567890');
      expect(getLastWheelTime()).toBe(1234567890);
    });
  });

  describe('setLastWheelTime', () => {
    it('should store time in localStorage', () => {
      setLastWheelTime(9876543210);
      expect(localStorage.getItem('geometry-dash-last-wheel-time')).toBe('9876543210');
    });
  });

  describe('resetSpins', () => {
    it('should set spins to DEFAULT_SPINS', () => {
      resetSpins();
      expect(localStorage.getItem('geometry-dash-spins-left')).toBe(DEFAULT_SPINS.toString());
    });
  });

  describe('getSpinsLeft', () => {
    it('should return 0 when no spins are stored', () => {
      expect(getSpinsLeft()).toBe(0);
    });

    it('should return stored spins', () => {
      localStorage.setItem('geometry-dash-spins-left', '5');
      expect(getSpinsLeft()).toBe(5);
    });
  });

  describe('saveSpins', () => {
    it('should store spins in localStorage', () => {
      saveSpins(3);
      expect(localStorage.getItem('geometry-dash-spins-left')).toBe('3');
    });
  });

  describe('shouldShowWheel', () => {
    it('should return true and reset spins when cooldown has passed', () => {
      const oldTime = Date.now() - WHEEL_COOLDOWN_MS - 1000; // 10 hours + 1 second ago
      setLastWheelTime(oldTime);
      localStorage.setItem('geometry-dash-spins-left', '0');

      const result = shouldShowWheel();
      
      expect(result).toBe(true);
      expect(getSpinsLeft()).toBe(DEFAULT_SPINS);
    });

    it('should return true when user has spins left', () => {
      const recentTime = Date.now() - 1000; // 1 second ago
      setLastWheelTime(recentTime);
      saveSpins(1);

      expect(shouldShowWheel()).toBe(true);
    });

    it('should return false when no spins and cooldown not passed', () => {
      const recentTime = Date.now() - 1000; // 1 second ago
      setLastWheelTime(recentTime);
      saveSpins(0);

      expect(shouldShowWheel()).toBe(false);
    });
  });

  describe('initializeWheelForNewUser', () => {
    it('should set initial spins and time for new user', () => {
      initializeWheelForNewUser();
      
      expect(getSpinsLeft()).toBe(DEFAULT_SPINS);
      expect(getLastWheelTime()).toBeGreaterThan(0);
    });

    it('should not reset for existing user', () => {
      const existingTime = Date.now() - 5000;
      setLastWheelTime(existingTime);
      saveSpins(1);

      initializeWheelForNewUser();

      // Should keep existing values
      expect(getLastWheelTime()).toBe(existingTime);
      expect(getSpinsLeft()).toBe(1);
    });
  });
});
