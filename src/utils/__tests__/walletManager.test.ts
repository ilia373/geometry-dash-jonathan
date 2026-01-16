import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadWallet,
  saveWallet,
  addCoins,
  getTotalCoins,
  spendCoins,
  resetWallet,
} from '../walletManager';

describe('walletManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadWallet', () => {
    it('should return default wallet when no data exists', () => {
      const wallet = loadWallet();
      expect(wallet).toEqual({ totalCoins: 0 });
    });

    it('should return saved wallet data', () => {
      localStorage.setItem('geometry-dash-wallet', JSON.stringify({ totalCoins: 500 }));
      const wallet = loadWallet();
      expect(wallet).toEqual({ totalCoins: 500 });
    });

    it('should return default wallet on invalid JSON', () => {
      localStorage.setItem('geometry-dash-wallet', 'invalid-json');
      const wallet = loadWallet();
      expect(wallet).toEqual({ totalCoins: 0 });
    });
  });

  describe('saveWallet', () => {
    it('should save wallet data to localStorage', () => {
      saveWallet({ totalCoins: 1000 });
      const saved = localStorage.getItem('geometry-dash-wallet');
      expect(JSON.parse(saved!)).toEqual({ totalCoins: 1000 });
    });
  });

  describe('addCoins', () => {
    it('should add coins to wallet', () => {
      addCoins(100);
      expect(getTotalCoins()).toBe(100);
    });

    it('should accumulate coins correctly', () => {
      addCoins(50);
      addCoins(75);
      addCoins(25);
      expect(getTotalCoins()).toBe(150);
    });

    it('should handle adding zero coins', () => {
      addCoins(100);
      addCoins(0);
      expect(getTotalCoins()).toBe(100);
    });
  });

  describe('getTotalCoins', () => {
    it('should return 0 for new wallet', () => {
      expect(getTotalCoins()).toBe(0);
    });

    it('should return correct coin total', () => {
      saveWallet({ totalCoins: 750 });
      expect(getTotalCoins()).toBe(750);
    });
  });

  describe('spendCoins', () => {
    it('should spend coins when balance is sufficient', () => {
      addCoins(500);
      const result = spendCoins(200);
      expect(result).toBe(true);
      expect(getTotalCoins()).toBe(300);
    });

    it('should return false when balance is insufficient', () => {
      addCoins(100);
      const result = spendCoins(200);
      expect(result).toBe(false);
      expect(getTotalCoins()).toBe(100);
    });

    it('should spend exact balance', () => {
      addCoins(200);
      const result = spendCoins(200);
      expect(result).toBe(true);
      expect(getTotalCoins()).toBe(0);
    });

    it('should handle spending zero coins', () => {
      addCoins(100);
      const result = spendCoins(0);
      expect(result).toBe(true);
      expect(getTotalCoins()).toBe(100);
    });
  });

  describe('resetWallet', () => {
    it('should reset wallet to default', () => {
      addCoins(1000);
      resetWallet();
      expect(getTotalCoins()).toBe(0);
    });
  });
});
