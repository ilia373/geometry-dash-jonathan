import { GAME_CONFIG, QUANT_CONFIG, QUANT_HP_CONFIG } from './physicsConfig';
import type { Obstacle, Quant, QuantType } from '../types/game';

// Helper to generate unique quant IDs
let quantIdCounter = 0;
export const getNextQuantId = () => ++quantIdCounter;
export const resetQuantIdCounter = () => { quantIdCounter = 0; };

// Helper function to create quants at specific positions
export const createQuant = (
  x: number,
  type: QuantType,
  y?: number,
  levelIndex: number = 0
): Quant => {
  const coinDrop = Math.floor(
    Math.random() * (QUANT_CONFIG.maxCoinDrop - QUANT_CONFIG.minCoinDrop + 1)
  ) + QUANT_CONFIG.minCoinDrop;
  
  const groundY = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - QUANT_CONFIG.size;
  const posY = y ?? groundY;
  
  const maxHp = Math.round(
    QUANT_HP_CONFIG.baseHp[type] * QUANT_HP_CONFIG.levelMultipliers[levelIndex]
  );
  
  return {
    x,
    y: posY,
    width: QUANT_CONFIG.size,
    height: QUANT_CONFIG.size,
    type,
    id: getNextQuantId(),
    vx: type === 'moving' ? -QUANT_CONFIG.moveSpeed : 0,
    vy: 0,
    baseY: posY,
    color: QUANT_CONFIG.colors[type],
    isDead: false,
    coinDrop,
    hp: maxHp,
    maxHp,
    flashTimer: 0,
  };
};

// Convenient quant creation helpers
export const createStaticQuant = (x: number, y?: number, levelIndex: number = 0): Quant => createQuant(x, 'static', y, levelIndex);
export const createMovingQuant = (x: number, y?: number, levelIndex: number = 0): Quant => createQuant(x, 'moving', y, levelIndex);
export const createJumpingQuant = (x: number, y?: number, levelIndex: number = 0): Quant => createQuant(x, 'jumping', y, levelIndex);

// Helper function to create obstacles at specific positions
export const createSpike = (x: number, y?: number): Obstacle => ({
  x,
  y: y ?? GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - 35,
  width: 35,
  height: 35,
  type: 'spike',
});

export const createJumpPad = (x: number): Obstacle => ({
  x,
  y: GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - 15,
  width: 40,
  height: 15,
  type: 'jump-pad',
});

export const createJumpOrb = (x: number, y: number): Obstacle => ({
  x,
  y,
  width: 30,
  height: 30,
  type: 'jump-orb',
});

export const createCoin = (x: number, y?: number): Obstacle => ({
  x,
  y: y ?? GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - 30,
  width: 25,
  height: 25,
  type: 'coin',
  collected: false,
});
