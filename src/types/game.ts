// Game Types for Geometry Dash Clone

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
  obstacles: Obstacle[];
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
