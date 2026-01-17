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
  addCoins,
  getTotalCoins,
  spendCoins,
  resetWallet,
  setCoins,
  resetWalletCache,
} from '../walletManager';

describe('walletManager', () => {
  beforeEach(() => {
    localStorage.clear();
    resetWalletCache();
  });

  describe('getTotalCoins', () => {
    it('should return 0 for new wallet', () => {
      expect(getTotalCoins()).toBe(0);
    });

    it('should return correct coin total', () => {
      setCoins(750);
      expect(getTotalCoins()).toBe(750);
    });
  });

  describe('addCoins', () => {
    it('should add coins to wallet', async () => {
      await addCoins(100);
      expect(getTotalCoins()).toBe(100);
    });

    it('should accumulate coins correctly', async () => {
      await addCoins(50);
      await addCoins(75);
      await addCoins(25);
      expect(getTotalCoins()).toBe(150);
    });

    it('should handle adding zero coins', async () => {
      await addCoins(100);
      await addCoins(0);
      expect(getTotalCoins()).toBe(100);
    });
  });

  describe('spendCoins', () => {
    it('should spend coins when balance is sufficient', async () => {
      await addCoins(500);
      const result = await spendCoins(200);
      expect(result).toBe(true);
      expect(getTotalCoins()).toBe(300);
    });

    it('should return false when balance is insufficient', async () => {
      await addCoins(100);
      const result = await spendCoins(200);
      expect(result).toBe(false);
      expect(getTotalCoins()).toBe(100);
    });

    it('should spend exact balance', async () => {
      await addCoins(200);
      const result = await spendCoins(200);
      expect(result).toBe(true);
      expect(getTotalCoins()).toBe(0);
    });

    it('should handle spending zero coins', async () => {
      await addCoins(100);
      const result = await spendCoins(0);
      expect(result).toBe(true);
      expect(getTotalCoins()).toBe(100);
    });
  });

  describe('resetWallet', () => {
    it('should reset wallet to default', async () => {
      await addCoins(1000);
      await resetWallet();
      expect(getTotalCoins()).toBe(0);
    });
  });

  describe('setCoins', () => {
    it('should set coins directly', () => {
      setCoins(999);
      expect(getTotalCoins()).toBe(999);
    });
  });
});
