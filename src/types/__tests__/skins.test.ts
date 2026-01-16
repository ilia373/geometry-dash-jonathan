import { describe, it, expect } from 'vitest';
import {
  SKINS,
  SKIN_CATEGORIES,
  getSkinById,
  getSkinsByCategory,
} from '../skins';

describe('skins', () => {
  describe('SKINS array', () => {
    it('should have 102 skins', () => {
      expect(SKINS.length).toBe(102);
    });

    it('should have unique IDs for all skins', () => {
      const ids = SKINS.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(SKINS.length);
    });

    it('should have sequential IDs from 1 to 102', () => {
      const ids = SKINS.map(s => s.id).sort((a, b) => a - b);
      for (let i = 0; i < ids.length; i++) {
        expect(ids[i]).toBe(i + 1);
      }
    });

    it('should have all required properties for each skin', () => {
      SKINS.forEach(skin => {
        expect(skin.id).toBeDefined();
        expect(skin.name).toBeDefined();
        expect(skin.category).toBeDefined();
        expect(skin.colors).toBeDefined();
        expect(skin.colors.primary).toBeDefined();
        expect(skin.colors.secondary).toBeDefined();
        expect(skin.colors.accent).toBeDefined();
        expect(skin.colors.glow).toBeDefined();
      });
    });

    it('should have valid color hex codes', () => {
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      SKINS.forEach(skin => {
        expect(skin.colors.primary).toMatch(hexRegex);
        expect(skin.colors.secondary).toMatch(hexRegex);
        expect(skin.colors.accent).toMatch(hexRegex);
        expect(skin.colors.glow).toMatch(hexRegex);
      });
    });

    it('should have 6 default skins (IDs 1-6)', () => {
      const defaultSkins = SKINS.filter(s => s.category === 'default');
      expect(defaultSkins.length).toBe(6);
      defaultSkins.forEach(skin => {
        expect(skin.id).toBeGreaterThanOrEqual(1);
        expect(skin.id).toBeLessThanOrEqual(6);
      });
    });

    it('should have Rainbow skin with price 500', () => {
      const rainbow = SKINS.find(s => s.name === 'Rainbow');
      expect(rainbow).toBeDefined();
      expect(rainbow?.price).toBe(500);
    });
  });

  describe('SKIN_CATEGORIES', () => {
    it('should have 8 categories', () => {
      expect(SKIN_CATEGORIES.length).toBe(8);
    });

    it('should have unique category IDs', () => {
      const ids = SKIN_CATEGORIES.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(SKIN_CATEGORIES.length);
    });

    it('should include expected categories', () => {
      const categoryIds = SKIN_CATEGORIES.map(c => c.id);
      expect(categoryIds).toContain('default');
      expect(categoryIds).toContain('flags');
      expect(categoryIds).toContain('games');
      expect(categoryIds).toContain('animals');
      expect(categoryIds).toContain('cars');
      expect(categoryIds).toContain('food');
      expect(categoryIds).toContain('space');
      expect(categoryIds).toContain('special');
    });

    it('should have name and emoji for each category', () => {
      SKIN_CATEGORIES.forEach(cat => {
        expect(cat.name).toBeDefined();
        expect(cat.name.length).toBeGreaterThan(0);
        expect(cat.emoji).toBeDefined();
      });
    });
  });

  describe('getSkinById', () => {
    it('should return correct skin by ID', () => {
      const skin = getSkinById(1);
      expect(skin.id).toBe(1);
      expect(skin.name).toBe('Original');
    });

    it('should return default skin for invalid ID', () => {
      const skin = getSkinById(9999);
      expect(skin.id).toBe(1);
    });

    it('should return default skin for negative ID', () => {
      const skin = getSkinById(-1);
      expect(skin.id).toBe(1);
    });

    it('should return default skin for ID 0', () => {
      const skin = getSkinById(0);
      expect(skin.id).toBe(1);
    });

    it('should return correct skin for all valid IDs', () => {
      for (let i = 1; i <= 102; i++) {
        const skin = getSkinById(i);
        expect(skin.id).toBe(i);
      }
    });
  });

  describe('getSkinsByCategory', () => {
    it('should return 6 default skins', () => {
      const skins = getSkinsByCategory('default');
      expect(skins.length).toBe(6);
      skins.forEach(s => expect(s.category).toBe('default'));
    });

    it('should return 21 flag skins', () => {
      const skins = getSkinsByCategory('flags');
      expect(skins.length).toBe(21);
      skins.forEach(s => expect(s.category).toBe('flags'));
    });

    it('should return 20 game skins', () => {
      const skins = getSkinsByCategory('games');
      expect(skins.length).toBe(20);
      skins.forEach(s => expect(s.category).toBe('games'));
    });

    it('should return 20 animal skins', () => {
      const skins = getSkinsByCategory('animals');
      expect(skins.length).toBe(20);
      skins.forEach(s => expect(s.category).toBe('animals'));
    });

    it('should return 15 car skins', () => {
      const skins = getSkinsByCategory('cars');
      expect(skins.length).toBe(15);
      skins.forEach(s => expect(s.category).toBe('cars'));
    });

    it('should return 10 food skins', () => {
      const skins = getSkinsByCategory('food');
      expect(skins.length).toBe(10);
      skins.forEach(s => expect(s.category).toBe('food'));
    });

    it('should return 5 space skins', () => {
      const skins = getSkinsByCategory('space');
      expect(skins.length).toBe(5);
      skins.forEach(s => expect(s.category).toBe('space'));
    });

    it('should return 5 special skins', () => {
      const skins = getSkinsByCategory('special');
      expect(skins.length).toBe(5);
      skins.forEach(s => expect(s.category).toBe('special'));
    });

    it('should return empty array for invalid category', () => {
      // @ts-expect-error - Testing invalid input
      const skins = getSkinsByCategory('invalid');
      expect(skins.length).toBe(0);
    });
  });

  describe('skin data integrity', () => {
    it('should have USA flag skin with correct ID', () => {
      const usa = SKINS.find(s => s.name === 'USA');
      expect(usa).toBeDefined();
      expect(usa?.id).toBe(7);
      expect(usa?.category).toBe('flags');
      expect(usa?.emoji).toBe('🇺🇸');
    });

    it('should have Israel flag skin with correct ID', () => {
      const israel = SKINS.find(s => s.name === 'Israel');
      expect(israel).toBeDefined();
      expect(israel?.id).toBe(27);
      expect(israel?.category).toBe('flags');
    });

    it('should have Minecraft skins in games category', () => {
      const minecraftSkins = SKINS.filter(s => s.name.includes('Minecraft'));
      expect(minecraftSkins.length).toBe(4);
      minecraftSkins.forEach(s => expect(s.category).toBe('games'));
    });

    it('should have all category skins sum to 102', () => {
      const totalByCategory = SKIN_CATEGORIES.reduce((sum, cat) => {
        return sum + getSkinsByCategory(cat.id).length;
      }, 0);
      expect(totalByCategory).toBe(102);
    });
  });
});
