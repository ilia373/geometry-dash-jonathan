import type { GameConfig } from '../types/game';

export const GAME_CONFIG: GameConfig = {
  canvasWidth: 1280,
  canvasHeight: 720,
  gravity: 0.8,
  jumpForce: -14,
  playerSpeed: 3,
  groundHeight: 100,
  playerSize: 40,
};

export const QUANT_CONFIG = {
  size: 35,
  moveSpeed: 2,
  jumpForce: -10,
  jumpInterval: 90,
  minCoinDrop: 3,
  maxCoinDrop: 7,
  colors: {
    static: '#8B00FF',
    moving: '#FF4500',
    jumping: '#00CED1',
    boss: '#FF0000',
  },
};

export const QUANT_HP_CONFIG = {
  baseHp: {
    static: 20,
    moving: 40,
    jumping: 60,
    boss: 500,
  },
  levelMultipliers: [
    // Milky Way (levels 1-7, indices 0-6)
    1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0,
    // Andromeda (levels 8-16, indices 7-15)
    4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5,
    // Nebula Vortex (levels 17-25, indices 16-24)
    9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0,
    // Quantum Realm (levels 26-35, indices 25-34)
    13.5, 14.0, 14.5, 15.0, 15.5, 16.0, 16.5, 17.0, 17.5, 18.0,
  ],
};
