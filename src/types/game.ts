// Game Types for Geometry Dash Clone

import type { WeaponCategory } from './weapons';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Player extends Position, Dimensions {
  vy: number;
  rotation: number;
  isJumping: boolean;
  isDead: boolean;
}

export type ObstacleType = 'spike' | 'portal' | 'jump-pad' | 'jump-orb' | 'coin';

export interface Obstacle extends Position, Dimensions {
  type: ObstacleType;
  color?: string;
  collected?: boolean; // For coins
}

export interface Level {
  id: number;
  name: string;
  planetName?: string;
  obstacles: Obstacle[];
  quants: Quant[];       // Quant enemies in this level
  groundColor: string;
  backgroundColor: string;
  length: number;
}

export type GameState = 'menu' | 'playing' | 'paused' | 'dead' | 'won';

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  gravity: number;
  jumpForce: number;
  playerSpeed: number;
  groundHeight: number;
  playerSize: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface GameStats {
  attempts: number;
  progress: number;
  bestProgress: number;
  coinsCollected: number;
}

// Quant (enemy) types
export type QuantType = 'static' | 'moving' | 'jumping';

export interface Quant extends Position, Dimensions {
  type: QuantType;
  id: number;
  vx: number;           // horizontal velocity (for moving quants)
  vy: number;           // vertical velocity (for jumping quants)
  baseY: number;        // original Y position (for jumping quants)
  color: string;        // quant color
  isDead: boolean;      // whether this quant has been eliminated
  coinDrop: number;     // number of coins to drop when killed
  // HP system fields (added for weapons combat)
  hp: number;           // current health points
  maxHp: number;        // maximum health points
  flashTimer: number;   // flash animation timer when taking damage
}

// Dropped coin from killed quants
export interface DroppedCoin extends Position {
  id: number;
  vx: number;
  vy: number;
  collected: boolean;
  life: number;         // time before it disappears
}

// Projectile fired by weapons
export interface Projectile {
  id: number;
  x: number;            // world-space X position
  y: number;            // world-space Y position
  vx: number;           // horizontal velocity (projectileSpeed from weapon)
  width: number;
  height: number;
  damage: number;       // from weapon stats
  life: number;         // frames remaining (TTL, 300 = ~5 seconds at 60fps)
  category: WeaponCategory;  // determines visual style
  color: string;        // projectile color from weapon
}
