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

// Quant HP configuration - determines health scaling across levels
export const QUANT_HP_CONFIG = {
  baseHp: {
    static: 20,
    moving: 40,
    jumping: 60,
  },
  // index = levelId - 1, values scale quant HP (16 entries for 16 levels across 2 universes)
  levelMultipliers: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5],
};

// Helper to generate unique quant IDs
let quantIdCounter = 0;
export const getNextQuantId = () => ++quantIdCounter;
export const resetQuantIdCounter = () => { quantIdCounter = 0; };

// Helper function to create quants at specific positions
const createQuant = (
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
const createStaticQuant = (x: number, y?: number, levelIndex: number = 0): Quant => createQuant(x, 'static', y, levelIndex);
const createMovingQuant = (x: number, y?: number, levelIndex: number = 0): Quant => createQuant(x, 'moving', y, levelIndex);
const createJumpingQuant = (x: number, y?: number, levelIndex: number = 0): Quant => createQuant(x, 'jumping', y, levelIndex);

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
    planetName: 'Mercury',
    groundColor: '#1a1a2e',
    backgroundColor: '#0f0f1a',
    length: 5000,
    obstacles: [
      // Opening section - very easy single jumps with lots of space
      createCoin(500),
      createSpike(700),
      createCoin(900),
      createSpike(1100),
      createSpike(1400),
      
      // First platform - easy landing
      createCoin(1650),
      createSpike(1950),
      
      // Simple jump pad
      createCoin(2150),
      createJumpPad(2350),
      createSpike(2650),
      
      // Easy platforms
      createCoin(2900),
      createSpike(3200),
      
      // Single spikes with good spacing
      createCoin(3450),
      createSpike(3650),
      createSpike(3950),
      createCoin(4150),
      createSpike(4350),
      
      // Final section - just two jumps
      createCoin(4550),
      createSpike(4750),
    ],
    quants: [
      // Just 2 easy quants far from obstacles
      createStaticQuant(1250),     // Big safe zone
      createStaticQuant(2800),     // Another safe zone
    ],
  },
  {
    id: 2,
    name: 'Back on Track',
    planetName: 'Venus',
    groundColor: '#2d132c',
    backgroundColor: '#1a0a1a',
    length: 6000,
    obstacles: [
      // Intro - gentle start
      createCoin(300),
      createSpike(500),
      createCoin(700),
      createSpike(900),
      createSpike(1200),
      
      // Platform section - easy jumps
      createCoin(1450),
      createCoin(1700),
      createSpike(2000),
      
      // Jump pad intro
      createCoin(2200),
      createJumpPad(2400),
      createSpike(2700),
      createCoin(2900),
      createSpike(3100),
      
      // Platform with jump orb
      createCoin(3300),
      createJumpOrb(3500, GAME_CONFIG.canvasHeight - 200),
      createSpike(3800),
      
      // Simple block obstacles
      createCoin(4000),
      createSpike(4200),
      
      // Single spike - no doubles
      createCoin(4400),
      createSpike(4600),
      
      // Jump pad to platform
      createCoin(4850),
      createJumpPad(5000),
      createSpike(5300),
      
      // Final section - spaced spikes
      createCoin(5500),
      createSpike(5700),
      createCoin(5850),
    ],
    quants: [
      // 3 quants with lots of space
      createStaticQuant(1300),     // Big clear zone
      createStaticQuant(3200),     // Safe area
      createMovingQuant(4750),     // Clear zone near end
    ],
  },
  {
    id: 3,
    name: 'Polargeist',
    planetName: 'Earth',
    groundColor: '#0d3b66',
    backgroundColor: '#051a33',
    length: 7000,
    obstacles: [
      // Intro section - spaced single jumps
      createCoin(300),
      createSpike(500),
      createCoin(700),
      createSpike(900),
      createCoin(1100),
      createSpike(1300),
      createSpike(1600),
      
      // First platform section
      createCoin(1850),
      createSpike(2100),
      createCoin(2350),
      createSpike(2600),
      
      // Jump pad section
      createCoin(2850),
      createJumpPad(3050),
      createCoin(3200),
      createSpike(3450),
      
      // Jump orb section
      createJumpOrb(3700, GAME_CONFIG.canvasHeight - 150),
      createCoin(3900),
      createSpike(4100),
      createCoin(4300),
      createSpike(4500),
      
      // Block section
      createCoin(4700),
      createSpike(4950),
      
      // Platform parkour - easier spacing
      createCoin(5150),
      createCoin(5400),
      createCoin(5650),
      createSpike(5900),
      
      // Jump pad combo
      createCoin(6100),
      createJumpPad(6300),
      createSpike(6600),
      
      // Final section - well-spaced
      createCoin(6750),
      createSpike(6900),
    ],
    quants: [
      // 4 quants with safe spacing
      createStaticQuant(1450),     // Big clear zone
      createStaticQuant(2700),     // Safe area
      createJumpingQuant(4650),    // Clear zone
      createMovingQuant(6000),     // Safe zone near end
    ],
  },
  {
    id: 4,
    name: 'Dry Out',
    planetName: 'Mars',
    groundColor: '#4a1942',
    backgroundColor: '#2a0a22',
    length: 7500,
    obstacles: [
      // Intro - moderate difficulty
      createCoin(300),
      createSpike(500),
      createCoin(700),
      createSpike(900),
      createCoin(1100),
      createSpike(1300),
      
      // Block jumps
      createCoin(1550),
      createSpike(1750),
      createSpike(2050),
      
      // Platform section
      createCoin(2250),
      createCoin(2500),
      createSpike(2750),
      
      // Jump pad sequence
      createCoin(2950),
      createJumpPad(3150),
      createSpike(3450),
      createCoin(3650),
      createJumpPad(3850),
      createCoin(4050),
      createSpike(4300),
      
      // Mixed obstacles
      createCoin(4500),
      createSpike(4700),
      createJumpOrb(4950, GAME_CONFIG.canvasHeight - 150),
      createCoin(5150),
      createSpike(5350),
      
      // Platform parkour
      createCoin(5550),
      createCoin(5800),
      createCoin(6050),
      createSpike(6300),
      
      // Spaced spikes
      createCoin(6500),
      createSpike(6700),
      createCoin(6900),
      createSpike(7100),
      
      // Final run
      createCoin(7300),
      createSpike(7500),
    ],
    quants: [
      // 4 quants with very safe spacing
      createStaticQuant(1900),     // Big clear zone
      createJumpingQuant(3000),    // Safe area
      createStaticQuant(5450),     // Clear zone
      createMovingQuant(6150),     // Safe zone near end
    ],
  },
  {
    id: 5,
    name: 'Base After Base',
    planetName: 'Jupiter',
    groundColor: '#1a4d2e',
    backgroundColor: '#0a2a1a',
    length: 8000,
    obstacles: [
      // Opening
      createCoin(300),
      createSpike(500),
      createCoin(700),
      createSpike(900),
      createCoin(1100),
      createSpike(1300),
      createCoin(1500),
      createSpike(1700),
      
      // Platform intro
      createCoin(1950),
      createSpike(2150),
      createCoin(2350),
      createSpike(2550),
      
      // Jump pad combo
      createCoin(2750),
      createJumpPad(2950),
      createCoin(3150),
      createJumpOrb(3400, GAME_CONFIG.canvasHeight - 200),
      createCoin(3600),
      createSpike(3800),
      
      // Block maze
      createCoin(4050),
      createSpike(4250),
      
      // Single spike obstacles
      createCoin(4500),
      createSpike(4700),
      
      // Platform section
      createCoin(4950),
      createCoin(5200),
      createCoin(5450),
      createSpike(5700),
      
      // Jump orb chain
      createCoin(5900),
      createJumpOrb(6100, GAME_CONFIG.canvasHeight - 140),
      createCoin(6300),
      createSpike(6500),
      createJumpOrb(6750, GAME_CONFIG.canvasHeight - 160),
      createCoin(6950),
      createSpike(7150),
      
      // Final stretch
      createCoin(7350),
      createSpike(7550),
      createCoin(7750),
    ],
    quants: [
      // 5 quants with generous spacing
      createStaticQuant(1800),     // Big clear zone
      createJumpingQuant(3250),    // Safe area
      createStaticQuant(4800),     // Clear zone
      createMovingQuant(6650),     // Safe area
      createStaticQuant(7450),     // Near end clear zone
    ],
  },
  {
    id: 6,
    name: 'Cant Let Go',
    planetName: 'Saturn',
    groundColor: '#4a3728',
    backgroundColor: '#2a1a10',
    length: 8500,
    obstacles: [
      // Intro
      createCoin(250),
      createSpike(450),
      createCoin(650),
      createSpike(850),
      createCoin(1050),
      createSpike(1250),
      createCoin(1450),
      createSpike(1650),
      
      // Block sequence
      createCoin(1900),
      createSpike(2100),
      createCoin(2300),
      createSpike(2500),
      
      // Platform climb
      createCoin(2750),
      createCoin(3000),
      createCoin(3250),
      createSpike(3500),
      
      // Jump pad sequence
      createCoin(3750),
      createJumpPad(3950),
      createCoin(4150),
      createSpike(4350),
      createCoin(4600),
      createJumpPad(4800),
      createCoin(5000),
      createJumpOrb(5250, GAME_CONFIG.canvasHeight - 230),
      createCoin(5450),
      createSpike(5650),
      
      // Mixed obstacles
      createCoin(5900),
      createSpike(6100),
      createCoin(6350),
      createSpike(6550),
      
      // Single spike challenge
      createCoin(6800),
      createSpike(7000),
      
      // Platform recovery
      createCoin(7200),
      createCoin(7450),
      createSpike(7700),
      
      // Final challenge
      createCoin(7950),
      createSpike(8150),
      createCoin(8350),
    ],
    quants: [
      // 5 quants with very generous spacing
      createStaticQuant(1750),     // Big clear zone
      createJumpingQuant(2900),    // Safe area
      createStaticQuant(4500),     // Clear zone
      createMovingQuant(6700),     // Safe area
      createJumpingQuant(8000),    // Near end clear zone
    ],
  },

  // ── Milky Way Boss ──────────────────────────────────────────────────────────
  {
    id: 7,
    name: 'Galactic Guardian',
    planetName: 'Uranus',
    groundColor: '#1a1a2e',
    backgroundColor: '#0f0f1a',
    length: 1280,
    levelType: 'boss',
    obstacles: [],
    quants: [],
  },

  // ── Andromeda Regular Levels ─────────────────────────────────────────────────

  {
    id: 8,
    name: 'Nebula Drift',
    planetName: 'Alpha Centauri',
    groundColor: '#2d1040',
    backgroundColor: '#1a0a2e',
    length: 8500,
    obstacles: [
      // Opening - moderate intro (similar to level 4 difficulty)
      createCoin(300),
      createSpike(500),
      createCoin(700),
      createSpike(900),
      createCoin(1100),
      createSpike(1300),

      // Early jumps
      createCoin(1550),
      createSpike(1750),
      createSpike(2050),

      // Platform section
      createCoin(2250),
      createCoin(2500),
      createSpike(2750),

      // Jump pad sequence
      createCoin(2950),
      createJumpPad(3150),
      createSpike(3450),
      createCoin(3650),
      createJumpPad(3850),
      createCoin(4050),
      createSpike(4300),

      // Mixed obstacles
      createCoin(4500),
      createSpike(4700),
      createJumpOrb(4950, GAME_CONFIG.canvasHeight - 150),
      createCoin(5150),
      createSpike(5350),

      // Platform parkour
      createCoin(5550),
      createCoin(5800),
      createCoin(6050),
      createSpike(6300),

      // Spaced spikes
      createCoin(6500),
      createSpike(6700),
      createCoin(6900),
      createSpike(7100),

      // Final run
      createCoin(7300),
      createSpike(7550),
      createCoin(7800),
      createSpike(8100),
      createCoin(8350),
    ],
    quants: [
      createStaticQuant(1900, undefined, 7),
      createJumpingQuant(3000, undefined, 7),
      createStaticQuant(5450, undefined, 7),
      createMovingQuant(7200, undefined, 7),
    ],
  },

  {
    id: 9,
    name: 'Violet Surge',
    planetName: 'Sirius',
    groundColor: '#2d1040',
    backgroundColor: '#1a0a2e',
    length: 9000,
    obstacles: [
      createCoin(250),
      createSpike(450),
      createCoin(650),
      createSpike(850),
      createCoin(1050),
      createSpike(1250),
      createCoin(1450),
      createSpike(1650),

      // Block sequence
      createCoin(1900),
      createSpike(2100),
      createSpike(2400),
      createCoin(2600),
      createSpike(2800),

      // Platform climb
      createCoin(3050),
      createCoin(3300),
      createSpike(3550),

      // Jump pad + orb combo
      createCoin(3750),
      createJumpPad(3950),
      createCoin(4150),
      createSpike(4350),
      createCoin(4600),
      createJumpOrb(4850, GAME_CONFIG.canvasHeight - 200),
      createCoin(5050),
      createSpike(5250),

      // Mixed mid-section
      createCoin(5500),
      createSpike(5700),
      createCoin(5950),
      createSpike(6150),

      // Tighter spikes
      createCoin(6400),
      createSpike(6600),
      createSpike(6900),
      createCoin(7100),

      // Jump pad final
      createJumpPad(7300),
      createSpike(7600),
      createCoin(7800),
      createSpike(8000),
      createCoin(8200),
      createSpike(8500),
      createCoin(8750),
    ],
    quants: [
      createStaticQuant(2000, undefined, 8),
      createJumpingQuant(3800, undefined, 8),
      createMovingQuant(5400, undefined, 8),
      createStaticQuant(7450, undefined, 8),
    ],
  },

  {
    id: 10,
    name: 'Dark Matter',
    planetName: 'Vega',
    groundColor: '#2d1040',
    backgroundColor: '#1a0a2e',
    length: 9500,
    obstacles: [
      createCoin(250),
      createSpike(450),
      createCoin(650),
      createSpike(850),
      createCoin(1050),
      createSpike(1250),
      createSpike(1500),
      createCoin(1700),
      createSpike(1900),

      // Block jump sequence
      createCoin(2150),
      createSpike(2350),
      createSpike(2650),
      createCoin(2850),
      createSpike(3050),

      // Jump pad section
      createCoin(3300),
      createJumpPad(3500),
      createCoin(3700),
      createSpike(3900),
      createCoin(4150),
      createJumpOrb(4400, GAME_CONFIG.canvasHeight - 180),
      createCoin(4600),
      createSpike(4800),

      // Dense mid section
      createCoin(5050),
      createSpike(5250),
      createSpike(5550),
      createCoin(5750),
      createSpike(5950),
      createJumpPad(6200),
      createCoin(6400),
      createSpike(6600),

      // Orb chain
      createJumpOrb(6900, GAME_CONFIG.canvasHeight - 160),
      createCoin(7100),
      createSpike(7300),
      createSpike(7600),
      createCoin(7800),

      // Final stretch
      createSpike(8050),
      createCoin(8250),
      createSpike(8500),
      createCoin(8750),
      createSpike(9000),
      createCoin(9250),
    ],
    quants: [
      createStaticQuant(1800, undefined, 9),
      createMovingQuant(3200, undefined, 9),
      createJumpingQuant(5100, undefined, 9),
      createStaticQuant(7000, undefined, 9),
      createMovingQuant(8600, undefined, 9),
    ],
  },

  {
    id: 11,
    name: 'Gravity Rift',
    planetName: 'Rigel',
    groundColor: '#2d1040',
    backgroundColor: '#1a0a2e',
    length: 10000,
    obstacles: [
      createCoin(250),
      createSpike(450),
      createCoin(650),
      createSpike(850),
      createSpike(1100),
      createCoin(1300),
      createSpike(1500),
      createSpike(1800),

      // Early density
      createCoin(2050),
      createSpike(2250),
      createSpike(2550),
      createCoin(2750),
      createSpike(2950),

      // Jump pad combo
      createCoin(3200),
      createJumpPad(3400),
      createSpike(3700),
      createCoin(3900),
      createJumpPad(4100),
      createSpike(4400),
      createCoin(4600),

      // Jump orb section
      createJumpOrb(4900, GAME_CONFIG.canvasHeight - 200),
      createCoin(5100),
      createSpike(5300),
      createSpike(5600),
      createCoin(5800),
      createSpike(6000),

      // Mid dense run
      createCoin(6250),
      createJumpOrb(6500, GAME_CONFIG.canvasHeight - 160),
      createSpike(6750),
      createSpike(7050),
      createCoin(7250),
      createSpike(7450),

      // Final section
      createCoin(7700),
      createJumpPad(7900),
      createSpike(8200),
      createCoin(8400),
      createSpike(8650),
      createSpike(8950),
      createCoin(9150),
      createSpike(9400),
      createCoin(9700),
    ],
    quants: [
      createStaticQuant(1650, undefined, 10),
      createJumpingQuant(3050, undefined, 10),
      createMovingQuant(5450, undefined, 10),
      createStaticQuant(7150, undefined, 10),
      createJumpingQuant(9050, undefined, 10),
    ],
  },

  {
    id: 12,
    name: 'Stellar Collapse',
    planetName: 'Betelgeuse',
    groundColor: '#2d1040',
    backgroundColor: '#1a0a2e',
    length: 10500,
    obstacles: [
      createCoin(200),
      createSpike(400),
      createCoin(600),
      createSpike(800),
      createSpike(1050),
      createCoin(1250),
      createSpike(1450),
      createSpike(1700),
      createCoin(1900),
      createSpike(2100),

      // Mixed types early
      createJumpPad(2350),
      createCoin(2550),
      createSpike(2800),
      createSpike(3100),
      createCoin(3300),
      createJumpOrb(3550, GAME_CONFIG.canvasHeight - 190),
      createSpike(3800),
      createCoin(4000),
      createSpike(4200),

      // Dense middle
      createSpike(4450),
      createSpike(4750),
      createCoin(4950),
      createJumpPad(5150),
      createSpike(5450),
      createCoin(5650),
      createSpike(5850),
      createJumpOrb(6100, GAME_CONFIG.canvasHeight - 170),
      createCoin(6300),
      createSpike(6500),
      createSpike(6800),

      // Increasing pressure
      createCoin(7050),
      createSpike(7250),
      createJumpPad(7500),
      createSpike(7800),
      createCoin(8000),
      createSpike(8250),
      createSpike(8550),
      createCoin(8750),

      // Final run
      createSpike(9000),
      createJumpOrb(9250, GAME_CONFIG.canvasHeight - 160),
      createSpike(9500),
      createCoin(9700),
      createSpike(9950),
      createCoin(10200),
    ],
    quants: [
      createStaticQuant(1550, undefined, 11),
      createMovingQuant(3200, undefined, 11),
      createJumpingQuant(5000, undefined, 11),
      createStaticQuant(6700, undefined, 11),
      createMovingQuant(8800, undefined, 11),
    ],
  },

  {
    id: 13,
    name: 'Void Runner',
    planetName: 'Antares',
    groundColor: '#2d1040',
    backgroundColor: '#1a0a2e',
    length: 11000,
    obstacles: [
      createCoin(200),
      createSpike(400),
      createSpike(650),
      createCoin(850),
      createSpike(1050),
      createSpike(1300),
      createCoin(1500),
      createSpike(1700),
      createSpike(1950),
      createCoin(2150),
      createSpike(2350),

      // Obstacle density ramps up
      createJumpPad(2600),
      createSpike(2900),
      createSpike(3200),
      createCoin(3400),
      createJumpOrb(3650, GAME_CONFIG.canvasHeight - 200),
      createSpike(3900),
      createSpike(4200),
      createCoin(4400),
      createSpike(4600),

      // Dense section
      createJumpPad(4850),
      createSpike(5150),
      createCoin(5350),
      createSpike(5550),
      createSpike(5800),
      createJumpOrb(6050, GAME_CONFIG.canvasHeight - 160),
      createCoin(6250),
      createSpike(6450),
      createSpike(6700),
      createCoin(6900),
      createSpike(7100),

      // Very dense
      createJumpPad(7350),
      createSpike(7650),
      createSpike(7950),
      createCoin(8150),
      createJumpOrb(8400, GAME_CONFIG.canvasHeight - 180),
      createSpike(8650),
      createSpike(8950),
      createCoin(9150),
      createSpike(9350),
      createSpike(9600),

      // Final
      createCoin(9850),
      createSpike(10050),
      createJumpPad(10300),
      createSpike(10600),
      createCoin(10850),
    ],
    quants: [
      createMovingQuant(1800, undefined, 12),
      createJumpingQuant(3500, undefined, 12),
      createStaticQuant(5700, undefined, 12),
      createMovingQuant(7500, undefined, 12),
      createJumpingQuant(9750, undefined, 12),
    ],
  },

  {
    id: 14,
    name: 'Photon Storm',
    planetName: 'Proxima',
    groundColor: '#2d1040',
    backgroundColor: '#1a0a2e',
    length: 11500,
    obstacles: [
      createCoin(200),
      createSpike(400),
      createSpike(650),
      createCoin(850),
      createSpike(1050),
      createSpike(1300),
      createSpike(1550),
      createCoin(1750),
      createSpike(1950),
      createSpike(2200),
      createCoin(2400),
      createSpike(2600),

      // Early dense combos
      createJumpPad(2850),
      createSpike(3150),
      createSpike(3450),
      createCoin(3650),
      createJumpOrb(3900, GAME_CONFIG.canvasHeight - 200),
      createSpike(4150),
      createSpike(4450),
      createCoin(4650),
      createSpike(4850),

      // Dense mid section
      createJumpPad(5100),
      createSpike(5400),
      createCoin(5600),
      createSpike(5800),
      createSpike(6050),
      createJumpOrb(6300, GAME_CONFIG.canvasHeight - 170),
      createCoin(6500),
      createSpike(6700),
      createSpike(6950),
      createCoin(7150),
      createSpike(7350),

      // Very dense
      createJumpPad(7600),
      createSpike(7900),
      createSpike(8200),
      createCoin(8400),
      createJumpOrb(8650, GAME_CONFIG.canvasHeight - 185),
      createSpike(8900),
      createSpike(9200),
      createCoin(9400),
      createSpike(9600),
      createSpike(9850),

      // Final gauntlet
      createCoin(10100),
      createSpike(10300),
      createJumpPad(10550),
      createSpike(10850),
      createCoin(11050),
      createSpike(11300),
    ],
    quants: [
      createMovingQuant(1600, undefined, 13),
      createJumpingQuant(3300, undefined, 13),
      createStaticQuant(5300, undefined, 13),
      createMovingQuant(7450, undefined, 13),
      createJumpingQuant(9500, undefined, 13),
      createStaticQuant(11100, undefined, 13),
    ],
  },

  {
    id: 15,
    name: 'Galaxy Annihilator',
    planetName: 'Epsilon Eridani',
    groundColor: '#2d1040',
    backgroundColor: '#1a0a2e',
    length: 12000,
    obstacles: [
      createCoin(200),
      createSpike(400),
      createSpike(650),
      createCoin(850),
      createSpike(1050),
      createSpike(1300),
      createSpike(1550),
      createCoin(1750),
      createSpike(1950),
      createSpike(2200),
      createSpike(2450),
      createCoin(2650),
      createSpike(2850),

      // Dense from the start
      createJumpPad(3100),
      createSpike(3400),
      createSpike(3700),
      createCoin(3900),
      createJumpOrb(4150, GAME_CONFIG.canvasHeight - 200),
      createSpike(4400),
      createSpike(4700),
      createCoin(4900),
      createSpike(5100),
      createSpike(5350),

      // Maximum density mid
      createJumpPad(5600),
      createSpike(5900),
      createCoin(6100),
      createSpike(6300),
      createSpike(6550),
      createJumpOrb(6800, GAME_CONFIG.canvasHeight - 175),
      createCoin(7000),
      createSpike(7200),
      createSpike(7450),
      createCoin(7650),
      createSpike(7850),
      createSpike(8100),

      // Dense with orb chains
      createJumpPad(8350),
      createCoin(8550),
      createSpike(8750),
      createSpike(9000),
      createJumpOrb(9250, GAME_CONFIG.canvasHeight - 190),
      createCoin(9450),
      createSpike(9650),
      createSpike(9900),
      createCoin(10100),
      createSpike(10300),

      // Final punishing stretch
      createJumpPad(10550),
      createSpike(10850),
      createSpike(11150),
      createCoin(11350),
      createJumpOrb(11600, GAME_CONFIG.canvasHeight - 165),
      createSpike(11800),
      createCoin(11950),
    ],
    quants: [
      createMovingQuant(1450, undefined, 14),
      createJumpingQuant(3250, undefined, 14),
      createStaticQuant(5250, undefined, 14),
      createMovingQuant(7100, undefined, 14),
      createJumpingQuant(9150, undefined, 14),
      createStaticQuant(10950, undefined, 14),
    ],
  },

  // ── Andromeda Boss ────────────────────────────────────────────────────────────
  {
    id: 16,
    name: 'Andromeda Colossus',
    planetName: 'M31 Core',
    groundColor: '#2d1040',
    backgroundColor: '#1a0a2e',
    length: 1280,
    levelType: 'boss',
    obstacles: [],
    quants: [],
  },
];

// Universe color override — set before entering game, cleared on exit
let activeColorOverride: { groundColor?: string; backgroundColor?: string } | null = null;

export const setColorOverride = (override: { groundColor?: string; backgroundColor?: string } | null): void => {
  activeColorOverride = override;
};

export const getColorOverride = (): { groundColor?: string; backgroundColor?: string } | null => {
  return activeColorOverride;
};

export const getCurrentLevel = (levelId: number): Level => {
  const level = LEVELS.find(l => l.id === levelId) || LEVELS[0];
  if (activeColorOverride) {
    return {
      ...level,
      groundColor: activeColorOverride.groundColor ?? level.groundColor,
      backgroundColor: activeColorOverride.backgroundColor ?? level.backgroundColor,
    };
  }
  return level;
};
