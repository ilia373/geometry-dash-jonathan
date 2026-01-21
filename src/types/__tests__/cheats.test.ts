import { describe, it, expect } from 'vitest';
import { defaultCheatState, cheatDescriptions } from '../../types/cheats';

describe('cheats', () => {
  describe('defaultCheatState', () => {
    it('should have all cheats disabled by default', () => {
      expect(defaultCheatState.infiniteCoins).toBe(false);
      expect(defaultCheatState.float).toBe(false);
      expect(defaultCheatState.speedBoost).toBe(false);
      expect(defaultCheatState.slowMotion).toBe(false);
      expect(defaultCheatState.autoQuantKiller).toBe(false);
      expect(defaultCheatState.tenXCoins).toBe(false);
      expect(defaultCheatState.magnetPower).toBe(false);
      expect(defaultCheatState.ghostMode).toBe(false);
    });

    it('should have exactly 8 cheat options', () => {
      const cheatCount = Object.keys(defaultCheatState).length;
      expect(cheatCount).toBe(8);
    });
  });

  describe('cheatDescriptions', () => {
    it('should have descriptions for all cheats', () => {
      const cheats = Object.keys(defaultCheatState);
      cheats.forEach((cheat) => {
        expect(cheatDescriptions[cheat as keyof typeof cheatDescriptions]).toBeDefined();
      });
    });

    it('should have emoji and name for each cheat', () => {
      Object.values(cheatDescriptions).forEach((desc) => {
        expect(desc.emoji).toBeDefined();
        expect(desc.name).toBeDefined();
        expect(desc.emoji.length).toBeGreaterThan(0);
        expect(desc.name.length).toBeGreaterThan(0);
      });
    });

    it('should have correct descriptions', () => {
      expect(cheatDescriptions.infiniteCoins.name).toBe('Infinite Coins');
      expect(cheatDescriptions.infiniteCoins.emoji).toBe('💰');
      
      expect(cheatDescriptions.float.name).toBe('Float Mode');
      expect(cheatDescriptions.float.emoji).toBe('🎈');
      
      expect(cheatDescriptions.speedBoost.name).toBe('Speed Boost');
      expect(cheatDescriptions.speedBoost.emoji).toBe('⚡');
      
      expect(cheatDescriptions.slowMotion.name).toBe('Slow Motion');
      expect(cheatDescriptions.slowMotion.emoji).toBe('🐌');
      
      expect(cheatDescriptions.autoQuantKiller.name).toBe('Auto Quant Kill');
      expect(cheatDescriptions.autoQuantKiller.emoji).toBe('☠️');
      
      expect(cheatDescriptions.tenXCoins.name).toBe('10x Coins');
      expect(cheatDescriptions.tenXCoins.emoji).toBe('🌟');
      
      expect(cheatDescriptions.magnetPower.name).toBe('Super Magnet');
      expect(cheatDescriptions.magnetPower.emoji).toBe('🧲');
      
      expect(cheatDescriptions.ghostMode.name).toBe('Ghost Mode');
      expect(cheatDescriptions.ghostMode.emoji).toBe('👻');
    });
  });
});
