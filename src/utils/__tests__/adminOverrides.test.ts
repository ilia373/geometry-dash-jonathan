import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUnlockAllLevels,
  setUnlockAllLevels,
  resetAdminOverrides,
} from '../adminOverrides';

describe('adminOverrides', () => {
  beforeEach(() => {
    resetAdminOverrides();
  });

  it('should default to false', () => {
    expect(getUnlockAllLevels()).toBe(false);
  });

  it('should return true after setting to true', () => {
    setUnlockAllLevels(true);
    expect(getUnlockAllLevels()).toBe(true);
  });

  it('should return false after setting to false', () => {
    setUnlockAllLevels(true);
    setUnlockAllLevels(false);
    expect(getUnlockAllLevels()).toBe(false);
  });

  it('should reset to false via resetAdminOverrides', () => {
    setUnlockAllLevels(true);
    resetAdminOverrides();
    expect(getUnlockAllLevels()).toBe(false);
  });
});
