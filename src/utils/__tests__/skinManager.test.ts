import { describe, it, expect, beforeEach } from 'vitest';
import {
  SKIN_PRICE,
  getSkinPrice,
  getUnlockedSkinIds,
  isSkinUnlocked,
  unlockSkin,
  getSelectedSkinId,
  getSelectedSkin,
  setSelectedSkin,
} from '../skinManager';
import { SKINS } from '../../types/skins';

describe('skinManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('SKIN_PRICE', () => {
    it('should have default price of 200', () => {
      expect(SKIN_PRICE).toBe(200);
    });
  });

  describe('getSkinPrice', () => {
    it('should return default price for skins without custom price', () => {
      // Skin ID 1 (Original) has no custom price
      expect(getSkinPrice(1)).toBe(200);
    });

    it('should return custom price for skins with price defined', () => {
      // Rainbow skin (ID 98) has price of 500
      const rainbowSkin = SKINS.find(s => s.name === 'Rainbow');
      if (rainbowSkin?.price) {
        expect(getSkinPrice(rainbowSkin.id)).toBe(500);
      }
    });
  });

  describe('getUnlockedSkinIds', () => {
    it('should return default skins (1-6) when no data exists', () => {
      const unlocked = getUnlockedSkinIds();
      expect(unlocked).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should include default skins even when localStorage has other skins', () => {
      localStorage.setItem('geometry-dash-unlocked-skins', JSON.stringify([7, 8]));
      const unlocked = getUnlockedSkinIds();
      expect(unlocked).toContain(1);
      expect(unlocked).toContain(6);
      expect(unlocked).toContain(7);
      expect(unlocked).toContain(8);
    });

    it('should return default skins on invalid JSON', () => {
      localStorage.setItem('geometry-dash-unlocked-skins', 'invalid');
      const unlocked = getUnlockedSkinIds();
      expect(unlocked).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('isSkinUnlocked', () => {
    it('should return true for default skins', () => {
      expect(isSkinUnlocked(1)).toBe(true);
      expect(isSkinUnlocked(2)).toBe(true);
      expect(isSkinUnlocked(6)).toBe(true);
    });

    it('should return false for locked skins', () => {
      expect(isSkinUnlocked(7)).toBe(false);
      expect(isSkinUnlocked(50)).toBe(false);
    });

    it('should return true for unlocked skins', () => {
      unlockSkin(10);
      expect(isSkinUnlocked(10)).toBe(true);
    });
  });

  describe('unlockSkin', () => {
    it('should unlock a skin', () => {
      unlockSkin(15);
      expect(isSkinUnlocked(15)).toBe(true);
    });

    it('should not duplicate unlocked skins', () => {
      unlockSkin(20);
      unlockSkin(20);
      const unlocked = getUnlockedSkinIds();
      expect(unlocked.filter(id => id === 20).length).toBe(1);
    });

    it('should persist unlocked skins', () => {
      unlockSkin(25);
      const saved = localStorage.getItem('geometry-dash-unlocked-skins');
      expect(JSON.parse(saved!)).toContain(25);
    });
  });

  describe('getSelectedSkinId', () => {
    it('should return 1 (default) when no skin selected', () => {
      expect(getSelectedSkinId()).toBe(1);
    });

    it('should return saved skin ID', () => {
      localStorage.setItem('geometry-dash-selected-skin', '5');
      expect(getSelectedSkinId()).toBe(5);
    });

    it('should return 1 for invalid skin ID', () => {
      localStorage.setItem('geometry-dash-selected-skin', '999');
      expect(getSelectedSkinId()).toBe(1);
    });

    it('should return 1 for invalid data', () => {
      localStorage.setItem('geometry-dash-selected-skin', 'not-a-number');
      expect(getSelectedSkinId()).toBe(1);
    });
  });

  describe('getSelectedSkin', () => {
    it('should return default skin object', () => {
      const skin = getSelectedSkin();
      expect(skin.id).toBe(1);
      expect(skin.name).toBe('Original');
    });

    it('should return correct skin object for selected skin', () => {
      setSelectedSkin(3);
      const skin = getSelectedSkin();
      expect(skin.id).toBe(3);
      expect(skin.name).toBe('Neon Blue');
    });
  });

  describe('setSelectedSkin', () => {
    it('should set selected skin', () => {
      setSelectedSkin(4);
      expect(getSelectedSkinId()).toBe(4);
    });

    it('should not set invalid skin ID (0)', () => {
      setSelectedSkin(4);
      setSelectedSkin(0);
      expect(getSelectedSkinId()).toBe(4);
    });

    it('should not set invalid skin ID (negative)', () => {
      setSelectedSkin(4);
      setSelectedSkin(-5);
      expect(getSelectedSkinId()).toBe(4);
    });

    it('should not set skin ID exceeding SKINS length', () => {
      setSelectedSkin(4);
      setSelectedSkin(9999);
      expect(getSelectedSkinId()).toBe(4);
    });
  });
});
