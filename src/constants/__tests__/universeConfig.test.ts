import { describe, it, expect, beforeEach } from 'vitest';
import {
  UNIVERSES,
  UNIVERSE_CONNECTIONS,
  getUniverseById,
  getUniverseForLevel,
  getUniverseConnections,
} from '../../constants/universeConfig';

describe('universeConfig', () => {
  describe('UNIVERSES', () => {
    it('should contain exactly 5 universes', () => {
      expect(UNIVERSES).toHaveLength(5);
    });

    it('should have milky-way as the first universe', () => {
      expect(UNIVERSES[0].id).toBe('milky-way');
    });

    it('should have milky-way and andromeda as non-comingSoon universes', () => {
      const unlocked = UNIVERSES.filter(u => !u.comingSoon);
      expect(unlocked).toHaveLength(2);
      expect(unlocked.map(u => u.id)).toEqual(['milky-way', 'andromeda']);
    });

    it('should assign 7 levels to milky-way', () => {
      const milkyWay = UNIVERSES.find(u => u.id === 'milky-way');
      expect(milkyWay?.levelIds).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should have empty levelIds for coming-soon universes', () => {
      const comingSoon = UNIVERSES.filter(u => u.comingSoon);
      comingSoon.forEach(u => {
        expect(u.levelIds).toHaveLength(0);
      });
    });

    it('should have a valid theme on every universe', () => {
      UNIVERSES.forEach(u => {
        expect(u.theme.primaryColor).toBeTruthy();
        expect(u.theme.secondaryColor).toBeTruthy();
        expect(u.theme.glowColor).toBeTruthy();
        expect(u.theme.groundColorOverride).toBeTruthy();
        expect(u.theme.backgroundColorOverride).toBeTruthy();
      });
    });

    it('should have position in 0-100 range for all universes', () => {
      UNIVERSES.forEach(u => {
        expect(u.position.x).toBeGreaterThanOrEqual(0);
        expect(u.position.x).toBeLessThanOrEqual(100);
        expect(u.position.y).toBeGreaterThanOrEqual(0);
        expect(u.position.y).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('UNIVERSE_CONNECTIONS', () => {
    it('should contain at least one connection', () => {
      expect(UNIVERSE_CONNECTIONS.length).toBeGreaterThan(0);
    });

    it('should only reference valid universe IDs', () => {
      const validIds = new Set(UNIVERSES.map(u => u.id));
      UNIVERSE_CONNECTIONS.forEach(conn => {
        expect(validIds.has(conn.from)).toBe(true);
        expect(validIds.has(conn.to)).toBe(true);
      });
    });

    it('should include a connection from milky-way to andromeda', () => {
      const conn = UNIVERSE_CONNECTIONS.find(
        c => c.from === 'milky-way' && c.to === 'andromeda'
      );
      expect(conn).toBeDefined();
    });
  });

  describe('getUniverseById', () => {
    it('should return the correct universe for a valid id', () => {
      const u = getUniverseById('milky-way');
      expect(u).toBeDefined();
      expect(u?.id).toBe('milky-way');
    });

    it('should return undefined for an unknown id', () => {
      expect(getUniverseById('does-not-exist')).toBeUndefined();
    });
  });

  describe('getUniverseForLevel', () => {
    it('should return milky-way for level 1', () => {
      const u = getUniverseForLevel(1);
      expect(u?.id).toBe('milky-way');
    });

    it('should return milky-way for level 6', () => {
      const u = getUniverseForLevel(6);
      expect(u?.id).toBe('milky-way');
    });

    it('should return milky-way for level 7 (boss)', () => {
      const u = getUniverseForLevel(7);
      expect(u?.id).toBe('milky-way');
    });

    it('should return andromeda for level 8', () => {
      const u = getUniverseForLevel(8);
      expect(u?.id).toBe('andromeda');
    });

    it('should return undefined for a level not in any universe', () => {
      expect(getUniverseForLevel(999)).toBeUndefined();
    });
  });

  describe('getUniverseConnections', () => {
    it('should return the same array as UNIVERSE_CONNECTIONS', () => {
      expect(getUniverseConnections()).toBe(UNIVERSE_CONNECTIONS);
    });

    beforeEach(() => {});
  });
});
