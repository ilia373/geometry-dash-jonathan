import type { GameConfig, Level, Obstacle, Quant, QuantType } from '../types/game';

// Game configuration constants
export const GAME_CONFIG: GameConfig = {
  canvasWidth: 1280,
  canvasHeight: 720,
  gravity: 0.8,
  jumpForce: -14,
  playerSpeed: 3,
  groundHeight: 100,
  playerSize: 40,
};

// Quant configuration
export const QUANT_CONFIG = {
  size: 35,
  moveSpeed: 2,        // Speed for moving quants (towards geo)
  jumpForce: -10,      // Jump force for jumping quants
  jumpInterval: 90,    // Frames between jumps for jumping quants
  minCoinDrop: 3,      // Minimum coins dropped when killed (more satisfying!)
  maxCoinDrop: 7,      // Maximum coins dropped when killed
  colors: {
    static: '#8B00FF',   // Purple for static quants
    moving: '#FF4500',   // Orange-red for moving quants
    jumping: '#00CED1',  // Cyan for jumping quants
  },
};

// Helper to generate unique quant IDs
let quantIdCounter = 0;
export const getNextQuantId = () => ++quantIdCounter;
export const resetQuantIdCounter = () => { quantIdCounter = 0; };

// Helper function to create quants at specific positions
const createQuant = (
  x: number,
  type: QuantType,
  y?: number
): Quant => {
  const coinDrop = Math.floor(
    Math.random() * (QUANT_CONFIG.maxCoinDrop - QUANT_CONFIG.minCoinDrop + 1)
  ) + QUANT_CONFIG.minCoinDrop;
  
  const groundY = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - QUANT_CONFIG.size;
  const posY = y ?? groundY;
  
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
  };
};

// Convenient quant creation helpers
const createStaticQuant = (x: number, y?: number): Quant => createQuant(x, 'static', y);
const createMovingQuant = (x: number, y?: number): Quant => createQuant(x, 'moving', y);
const createJumpingQuant = (x: number, y?: number): Quant => createQuant(x, 'jumping', y);

// Helper function to create obstacles at specific positions
const createSpike = (x: number, y?: number): Obstacle => ({
  x,
  y: y ?? GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - 35,
  width: 35,
  height: 35,
  type: 'spike',
});

const createJumpPad = (x: number): Obstacle => ({
  x,
  y: GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - 15,
  width: 40,
  height: 15,
  type: 'jump-pad',
});

const createJumpOrb = (x: number, y: number): Obstacle => ({
  x,
  y,
  width: 30,
  height: 30,
  type: 'jump-orb',
});

const createCoin = (x: number, y?: number): Obstacle => ({
  x,
  y: y ?? GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - 30,
  width: 25,
  height: 25,
  type: 'coin',
  collected: false,
});

// Level definitions
export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Stereo Madness',
    groundColor: '#1a1a2e',
    backgroundColor: '#0f0f1a',
    length: 5000,
    obstacles: [
      // Opening section - very easy single jumps with lots of space
      createCoin(500),
      createSpike(700),
      createCoin(850),
      createSpike(1000),
      createSpike(1300),
      
      // First platform - easy landing
      createCoin(1550),
      createSpike(1850),
      
      // Simple jump pad
      createCoin(2000),
      createJumpPad(2100),
      createSpike(2400),
      
      // Easy platforms
      createCoin(2650),
      createSpike(3200),
      
      // Single spikes with good spacing
      createCoin(3350),
      createSpike(3500),
      createSpike(3800),
      createCoin(3950),
      createSpike(4100),
      
      // Final section - just two jumps
      createCoin(4250),
      createSpike(4400),
      createCoin(4550),
      createSpike(4700),
    ],
    quants: [
      // Just 2 easy quants far from obstacles
      createStaticQuant(1150),     // Big safe zone
      createStaticQuant(2550),     // Another safe zone
    ],
  },
  {
    id: 2,
    name: 'Back on Track',
    groundColor: '#2d132c',
    backgroundColor: '#1a0a1a',
    length: 6000,
    obstacles: [
      // Intro - gentle start
      createCoin(300),
      createSpike(400),
      createCoin(550),
      createSpike(700),
      createSpike(1150),
      
      // Platform section - easy jumps
      createCoin(1350),
      createCoin(1600),
      createSpike(1900),
      
      // Jump pad intro
      createCoin(2050),
      createJumpPad(2150),
      createSpike(2450),
      createCoin(2600),
      createSpike(2750),
      
      // Platform with jump orb
      createCoin(2900),
      createJumpOrb(3200, GAME_CONFIG.canvasHeight - 200),
      createSpike(3450),
      
      // Simple block obstacles
      createCoin(3600),
      createSpike(3900),
      
      // Double spike with spacing
      createCoin(4050),
      createSpike(4200),
      createSpike(4250),
      
      // Jump pad to platform
      createCoin(4450),
      createJumpPad(4500),
      createSpike(4900),
      
      // Final section - spaced spikes
      createCoin(5050),
      createSpike(5200),
      createCoin(5350),
      createSpike(5500),
      createCoin(5650),
      createSpike(5800),
    ],
    quants: [
      // 3 quants with lots of space
      createStaticQuant(1250),     // Big clear zone
      createStaticQuant(2950),     // Safe area
      createMovingQuant(4650),     // Clear zone near end
    ],
  },
  {
    id: 3,
    name: 'Polargeist',
    groundColor: '#0d3b66',
    backgroundColor: '#051a33',
    length: 7000,
    obstacles: [
      // Intro section - spaced single jumps
      createCoin(300),
      createSpike(400),
      createCoin(550),
      createSpike(700),
      createCoin(850),
      createSpike(1000),
      createSpike(1500),
      
      // First platform section
      createCoin(1750),
      createSpike(2050),
      createCoin(2250),
      createSpike(2550),
      
      // Jump pad section
      createCoin(2700),
      createJumpPad(2800),
      createCoin(2900),
      createSpike(3200),
      
      // Jump orb section
      createJumpOrb(3450, GAME_CONFIG.canvasHeight - 150),
      createCoin(3550),
      createSpike(3700),
      createCoin(3850),
      createSpike(4000),
      
      // Block section
      createCoin(4150),
      createSpike(4450),
      
      // Platform parkour - easier spacing
      createCoin(4650),
      createCoin(4900),
      createCoin(5150),
      createSpike(5450),
      
      // Jump pad combo
      createCoin(5600),
      createJumpPad(5700),
      createSpike(6000),
      
      // Final section - well-spaced
      createCoin(6100),
      createSpike(6250),
      createCoin(6350),
      createSpike(6500),
      createSpike(6850),
    ],
    quants: [
      // 4 quants with safe spacing
      createStaticQuant(1250),     // Big clear zone
      createStaticQuant(2350),     // Safe area
      createJumpingQuant(3950),    // Clear zone
      createMovingQuant(5300),     // Safe zone near end
    ],
  },
  {
    id: 4,
    name: 'Dry Out',
    groundColor: '#4a1942',
    backgroundColor: '#2a0a22',
    length: 7500,
    obstacles: [
      // Intro - moderate difficulty
      createCoin(300),
      createSpike(400),
      createCoin(550),
      createSpike(650),
      createCoin(800),
      createSpike(900),
      
      // Block jumps
      createCoin(1150),
      createSpike(1350),
      createSpike(1750),
      
      // Platform section
      createCoin(1950),
      createCoin(2150),
      createSpike(2400),
      createSpike(2450),
      
      // Jump pad sequence
      createCoin(2600),
      createJumpPad(2700),
      createSpike(2950),
      createCoin(3050),
      createJumpPad(3150),
      createCoin(3250),
      createSpike(3500),
      
      // Mixed obstacles
      createCoin(3650),
      createSpike(3900),
      createJumpOrb(4100, GAME_CONFIG.canvasHeight - 150),
      createCoin(4200),
      createSpike(4300),
      
      // Platform parkour
      createCoin(4500),
      createCoin(4700),
      createCoin(4900),
      createSpike(5150),
      
      // Double spikes
      createCoin(5300),
      createSpike(5400),
      createSpike(5450),
      createCoin(5600),
      createSpike(5700),
      createSpike(5750),
      
      // Final run
      createCoin(5900),
      createJumpPad(6000),
      createCoin(6150),
      createSpike(6250),
      createCoin(6400),
      createSpike(6500),
      createSpike(6850),
      createCoin(7000),
      createSpike(7100),
      createSpike(7300),
    ],
    quants: [
      // 4 quants with very safe spacing
      createStaticQuant(1550),     // Big clear zone
      createJumpingQuant(2550),    // Safe area
      createStaticQuant(4350),     // Clear zone
      createMovingQuant(6050),     // Safe zone near end
    ],
  },
  {
    id: 5,
    name: 'Base After Base',
    groundColor: '#1a4d2e',
    backgroundColor: '#0a2a1a',
    length: 8000,
    obstacles: [
      // Opening
      createCoin(300),
      createSpike(400),
      createCoin(500),
      createSpike(600),
      createCoin(800),
      createSpike(1000),
      createCoin(1100),
      createSpike(1200),
      
      // Platform intro
      createCoin(1400),
      createSpike(1650),
      createCoin(1800),
      createSpike(2050),
      
      // Jump pad combo
      createCoin(2200),
      createJumpPad(2300),
      createCoin(2400),
      createJumpOrb(2600, GAME_CONFIG.canvasHeight - 200),
      createCoin(2700),
      createSpike(2800),
      createSpike(2850),
      
      // Block maze
      createCoin(3000),
      createSpike(3300),
      
      // Triple spikes
      createCoin(3450),
      createSpike(3550),
      createSpike(3600),
      createSpike(3650),
      
      // Platform section
      createCoin(3850),
      createCoin(4050),
      createCoin(4250),
      createSpike(4500),
      
      // Jump orb chain
      createCoin(4650),
      createJumpOrb(4750, GAME_CONFIG.canvasHeight - 140),
      createCoin(4850),
      createSpike(4950),
      createJumpOrb(5150, GAME_CONFIG.canvasHeight - 160),
      createCoin(5250),
      createSpike(5350),
      
      // Intense section
      createCoin(5500),
      createSpike(5600),
      createSpike(5650),
      createCoin(5750),
      createJumpPad(5850),
      createCoin(6000),
      createSpike(6100),
      createSpike(6150),
      
      // Final stretch
      createCoin(6300),
      createCoin(6350),
      createSpike(6600),
      createCoin(6750),
      createSpike(6850),
      createCoin(7000),
      createSpike(7100),
      createSpike(7450),
      createCoin(7600),
      createSpike(7700),
    ],
    quants: [
      // 5 quants with generous spacing
      createStaticQuant(1550),     // Big clear zone
      createJumpingQuant(2950),    // Safe area
      createStaticQuant(4150),     // Clear zone
      createMovingQuant(5800),     // Safe area
      createStaticQuant(7300),     // Near end clear zone
    ],
  },
  {
    id: 6,
    name: 'Cant Let Go',
    groundColor: '#4a3728',
    backgroundColor: '#2a1a10',
    length: 8500,
    obstacles: [
      // Fast intro
      createCoin(250),
      createSpike(350),
      createCoin(450),
      createSpike(550),
      createCoin(650),
      createSpike(750),
      createCoin(950),
      createSpike(1150),
      
      // Block sequence
      createCoin(1300),
      createSpike(1600),
      createCoin(1700),
      createSpike(1950),
      
      // Platform climb
      createCoin(2100),
      createCoin(2350),
      createCoin(2550),
      createSpike(2800),
      createSpike(2850),
      
      // Jump pad sequence
      createCoin(3000),
      createJumpPad(3100),
      createCoin(3250),
      createSpike(3350),
      createCoin(3450),
      createJumpPad(3550),
      createCoin(3650),
      createJumpOrb(3850, GAME_CONFIG.canvasHeight - 230),
      createCoin(3950),
      createSpike(4050),
      
      // Mixed obstacles
      createCoin(4200),
      createSpike(4300),
      createCoin(4450),
      createSpike(4650),
      createSpike(4700),
      
      // Triple spike challenge
      createCoin(4850),
      createSpike(4950),
      createSpike(5000),
      createSpike(5050),
      
      // Platform recovery
      createCoin(5200),
      createCoin(5250),
      createSpike(5500),
      
      // Jump orb section
      createCoin(5650),
      createJumpOrb(5750, GAME_CONFIG.canvasHeight - 150),
      createCoin(5850),
      createSpike(5950),
      createCoin(6050),
      createJumpOrb(6150, GAME_CONFIG.canvasHeight - 170),
      createCoin(6250),
      createSpike(6350),
      
      // Final challenge
      createCoin(6500),
      createSpike(6600),
      createSpike(6650),
      createCoin(6750),
      createJumpPad(6850),
      createCoin(7000),
      createSpike(7100),
      createCoin(7400),
      createSpike(7500),
      createCoin(7600),
      createSpike(7700),
      createCoin(7850),
      createSpike(7950),
      createCoin(8100),
      createSpike(8200),
    ],
    quants: [
      // 5 quants with very generous spacing
      createStaticQuant(1250),     // Big clear zone
      createJumpingQuant(2500),    // Safe area
      createStaticQuant(4250),     // Clear zone
      createMovingQuant(5900),     // Safe area
      createJumpingQuant(7300),    // Near end clear zone
    ],
  },
];

export const getCurrentLevel = (levelId: number): Level => {
  return LEVELS.find(l => l.id === levelId) || LEVELS[0];
};
