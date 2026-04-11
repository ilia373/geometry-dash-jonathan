import { describe, it, expect } from 'vitest';
import { LEVELS, GAME_CONFIG, QUANT_HP_CONFIG } from '../../constants/gameConfig';

describe('Golden Regression: gameConfig.ts', () => {
  describe('LEVELS', () => {
    it('should have exactly 35 levels', () => {
      expect(LEVELS).toHaveLength(35);
    });

    it('should have correct level IDs from 1 to 35', () => {
      const levelIds = LEVELS.map(l => l.id);
      expect(levelIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]);
    });

    it('should have exactly 4 boss levels', () => {
      const bossLevels = LEVELS.filter(l => l.levelType === 'boss');
      expect(bossLevels).toHaveLength(4);
    });

    it('should have boss levels at IDs 7, 16, 25, and 35', () => {
      const bossIds = LEVELS.filter(l => l.levelType === 'boss').map(l => l.id);
      expect(bossIds).toEqual([7, 16, 25, 35]);
    });

    it('should have all boss levels with length 1280', () => {
      const bossLevels = LEVELS.filter(l => l.levelType === 'boss');
      bossLevels.forEach(level => {
        expect(level.length).toBe(1280);
      });
    });
  });

  describe('GAME_CONFIG', () => {
    it('should have canvasWidth of 1280', () => {
      expect(GAME_CONFIG.canvasWidth).toBe(1280);
    });

    it('should have canvasHeight of 720', () => {
      expect(GAME_CONFIG.canvasHeight).toBe(720);
    });

    it('should have gravity of 0.8', () => {
      expect(GAME_CONFIG.gravity).toBe(0.8);
    });

    it('should have jumpForce of -14', () => {
      expect(GAME_CONFIG.jumpForce).toBe(-14);
    });

    it('should have playerSpeed of 3', () => {
      expect(GAME_CONFIG.playerSpeed).toBe(3);
    });

    it('should have groundHeight of 100', () => {
      expect(GAME_CONFIG.groundHeight).toBe(100);
    });

    it('should have playerSize of 40', () => {
      expect(GAME_CONFIG.playerSize).toBe(40);
    });
  });

  describe('QUANT_HP_CONFIG', () => {
    it('should have levelMultipliers with exactly 35 entries', () => {
      expect(QUANT_HP_CONFIG.levelMultipliers).toHaveLength(35);
    });

    it('should have first level multiplier of 1.0', () => {
      expect(QUANT_HP_CONFIG.levelMultipliers[0]).toBe(1.0);
    });

    it('should have last level multiplier of 18.0', () => {
      expect(QUANT_HP_CONFIG.levelMultipliers[34]).toBe(18.0);
    });

    it('should have first QR level multiplier of 13.5', () => {
      expect(QUANT_HP_CONFIG.levelMultipliers[25]).toBe(13.5);
    });

    it('should have baseHp.static of 20', () => {
      expect(QUANT_HP_CONFIG.baseHp.static).toBe(20);
    });

    it('should have baseHp.moving of 40', () => {
      expect(QUANT_HP_CONFIG.baseHp.moving).toBe(40);
    });

    it('should have baseHp.jumping of 60', () => {
      expect(QUANT_HP_CONFIG.baseHp.jumping).toBe(60);
    });
  });
});
