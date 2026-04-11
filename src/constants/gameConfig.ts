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
    boss: '#FF0000',
  },
};

// Quant HP configuration - determines health scaling across levels
export const QUANT_HP_CONFIG = {
  baseHp: {
    static: 20,
    moving: 40,
    jumping: 60,
    boss: 500,
  },
  // index = levelId - 1, values scale quant HP (25 entries for 25 levels across 3 universes)
  levelMultipliers: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0],
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

  // ── Nebula Vortex Regular Levels ─────────────────────────────────────────────

  {
    id: 17,
    name: 'Cosmic Reckoning',
    planetName: 'Carina Nebula',
    groundColor: '#3d1040',
    backgroundColor: '#1e0a1e',
    length: 12500,
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
      createSpike(3100),

      createJumpPad(3350),
      createSpike(3650),
      createSpike(3950),
      createCoin(4150),
      createJumpOrb(4400, GAME_CONFIG.canvasHeight - 200),
      createSpike(4650),
      createSpike(4950),
      createCoin(5150),
      createSpike(5350),
      createSpike(5600),

      createJumpPad(5850),
      createSpike(6150),
      createCoin(6350),
      createSpike(6550),
      createSpike(6800),
      createJumpOrb(7050, GAME_CONFIG.canvasHeight - 175),
      createCoin(7250),
      createSpike(7450),
      createSpike(7700),
      createCoin(7900),
      createSpike(8100),
      createSpike(8350),

      createJumpPad(8600),
      createCoin(8800),
      createSpike(9000),
      createSpike(9250),
      createJumpOrb(9500, GAME_CONFIG.canvasHeight - 190),
      createCoin(9700),
      createSpike(9900),
      createSpike(10150),
      createCoin(10350),
      createSpike(10550),

      createJumpPad(10800),
      createSpike(11100),
      createSpike(11400),
      createCoin(11600),
      createJumpOrb(11850, GAME_CONFIG.canvasHeight - 165),
      createSpike(12050),
      createCoin(12250),
    ],
    quants: [
      createMovingQuant(1400, undefined, 16),
      createJumpingQuant(3200, undefined, 16),
      createStaticQuant(5200, undefined, 16),
      createMovingQuant(7100, undefined, 16),
      createJumpingQuant(9100, undefined, 16),
      createStaticQuant(10900, undefined, 16),
    ],
  },

  {
    id: 18,
    name: 'Nebula Inferno',
    planetName: "Orion's Arm",
    groundColor: '#3d1040',
    backgroundColor: '#1e0a1e',
    length: 13000,
    obstacles: [
      createCoin(200),
      createSpike(400),
      createSpike(650),
      createSpike(900),
      createCoin(1100),
      createSpike(1300),
      createSpike(1550),
      createSpike(1800),
      createCoin(2000),
      createSpike(2200),
      createSpike(2450),
      createSpike(2700),
      createCoin(2900),
      createSpike(3100),

      createJumpPad(3350),
      createSpike(3650),
      createSpike(3950),
      createSpike(4200),
      createCoin(4400),
      createJumpOrb(4650, GAME_CONFIG.canvasHeight - 200),
      createSpike(4900),
      createSpike(5200),
      createCoin(5400),
      createSpike(5600),
      createSpike(5850),

      createJumpPad(6100),
      createSpike(6400),
      createCoin(6600),
      createSpike(6800),
      createSpike(7050),
      createSpike(7300),
      createJumpOrb(7550, GAME_CONFIG.canvasHeight - 170),
      createCoin(7750),
      createSpike(7950),
      createSpike(8200),
      createSpike(8450),
      createCoin(8650),
      createSpike(8850),

      createJumpPad(9100),
      createSpike(9400),
      createSpike(9700),
      createCoin(9900),
      createJumpOrb(10150, GAME_CONFIG.canvasHeight - 185),
      createSpike(10400),
      createSpike(10700),
      createCoin(10900),
      createSpike(11100),
      createSpike(11350),

      createJumpPad(11600),
      createSpike(11900),
      createCoin(12100),
      createSpike(12350),
      createSpike(12600),
      createCoin(12800),
    ],
    quants: [
      createMovingQuant(1400, undefined, 17),
      createJumpingQuant(3500, undefined, 17),
      createMovingQuant(5500, undefined, 17),
      createStaticQuant(7400, undefined, 17),
      createJumpingQuant(9600, undefined, 17),
      createMovingQuant(11500, undefined, 17),
    ],
  },

  {
    id: 19,
    name: 'Stellar Abyss',
    planetName: 'Pillars of Creation',
    groundColor: '#3d1040',
    backgroundColor: '#1e0a1e',
    length: 13500,
    obstacles: [
      createCoin(200),
      createSpike(400),
      createSpike(600),
      createSpike(850),
      createCoin(1050),
      createSpike(1250),
      createSpike(1450),
      createSpike(1700),
      createSpike(1950),
      createCoin(2150),
      createSpike(2350),
      createSpike(2600),
      createSpike(2850),
      createCoin(3050),
      createSpike(3250),

      createJumpPad(3500),
      createSpike(3800),
      createSpike(4050),
      createSpike(4300),
      createCoin(4500),
      createJumpOrb(4750, GAME_CONFIG.canvasHeight - 195),
      createSpike(5000),
      createSpike(5250),
      createSpike(5500),
      createCoin(5700),
      createSpike(5900),

      createJumpPad(6150),
      createSpike(6450),
      createCoin(6650),
      createSpike(6850),
      createSpike(7100),
      createSpike(7350),
      createJumpOrb(7600, GAME_CONFIG.canvasHeight - 175),
      createSpike(7850),
      createCoin(8050),
      createSpike(8250),
      createSpike(8500),
      createSpike(8750),
      createCoin(8950),
      createSpike(9150),

      createJumpPad(9400),
      createSpike(9700),
      createSpike(9950),
      createCoin(10150),
      createJumpOrb(10400, GAME_CONFIG.canvasHeight - 180),
      createSpike(10650),
      createSpike(10900),
      createCoin(11100),
      createSpike(11300),
      createSpike(11550),

      createJumpPad(11800),
      createSpike(12100),
      createSpike(12350),
      createCoin(12550),
      createSpike(12800),
      createSpike(13050),
      createCoin(13250),
    ],
    quants: [
      createJumpingQuant(1500, undefined, 18),
      createMovingQuant(3400, undefined, 18),
      createJumpingQuant(5600, undefined, 18),
      createStaticQuant(7500, undefined, 18),
      createMovingQuant(9800, undefined, 18),
      createJumpingQuant(12000, undefined, 18),
    ],
  },

  {
    id: 20,
    name: 'Dark Horizon',
    planetName: 'Eagle Nebula',
    groundColor: '#3d1040',
    backgroundColor: '#1e0a1e',
    length: 14000,
    obstacles: [
      createCoin(200),
      createSpike(400),
      createSpike(600),
      createSpike(800),
      createCoin(1000),
      createSpike(1200),
      createSpike(1400),
      createSpike(1650),
      createSpike(1900),
      createCoin(2100),
      createSpike(2300),
      createSpike(2550),
      createSpike(2800),
      createSpike(3050),
      createCoin(3250),
      createSpike(3450),

      createJumpPad(3700),
      createSpike(4000),
      createSpike(4250),
      createSpike(4500),
      createCoin(4700),
      createJumpOrb(4950, GAME_CONFIG.canvasHeight - 200),
      createSpike(5200),
      createSpike(5450),
      createSpike(5700),
      createCoin(5900),
      createSpike(6100),
      createSpike(6350),

      createJumpPad(6600),
      createSpike(6900),
      createCoin(7100),
      createSpike(7300),
      createSpike(7550),
      createSpike(7800),
      createJumpOrb(8050, GAME_CONFIG.canvasHeight - 170),
      createSpike(8300),
      createCoin(8500),
      createSpike(8700),
      createSpike(8950),
      createSpike(9200),
      createCoin(9400),
      createSpike(9600),

      createJumpPad(9850),
      createSpike(10150),
      createSpike(10400),
      createCoin(10600),
      createJumpOrb(10850, GAME_CONFIG.canvasHeight - 185),
      createSpike(11100),
      createSpike(11350),
      createCoin(11550),
      createSpike(11750),
      createSpike(12000),

      createJumpPad(12250),
      createSpike(12550),
      createSpike(12800),
      createCoin(13000),
      createSpike(13250),
      createSpike(13500),
      createCoin(13750),
    ],
    quants: [
      createMovingQuant(1300, undefined, 19),
      createJumpingQuant(3600, undefined, 19),
      createMovingQuant(5800, undefined, 19),
      createJumpingQuant(7700, undefined, 19),
      createStaticQuant(10200, undefined, 19),
      createMovingQuant(12400, undefined, 19),
      createJumpingQuant(13400, undefined, 19),
    ],
  },

  {
    id: 21,
    name: 'Void Cascade',
    planetName: 'Horsehead Nebula',
    groundColor: '#3d1040',
    backgroundColor: '#1e0a1e',
    length: 14500,
    obstacles: [
      createCoin(200),
      createSpike(400),
      createSpike(600),
      createSpike(800),
      createSpike(1050),
      createCoin(1250),
      createSpike(1450),
      createSpike(1650),
      createSpike(1900),
      createSpike(2150),
      createCoin(2350),
      createSpike(2550),
      createSpike(2800),
      createSpike(3050),
      createSpike(3300),
      createCoin(3500),
      createSpike(3700),

      createJumpPad(3950),
      createSpike(4250),
      createSpike(4500),
      createSpike(4750),
      createCoin(4950),
      createJumpOrb(5200, GAME_CONFIG.canvasHeight - 195),
      createSpike(5450),
      createSpike(5700),
      createSpike(5950),
      createCoin(6150),
      createSpike(6350),
      createSpike(6600),

      createJumpPad(6850),
      createSpike(7150),
      createCoin(7350),
      createSpike(7550),
      createSpike(7800),
      createSpike(8050),
      createJumpOrb(8300, GAME_CONFIG.canvasHeight - 175),
      createSpike(8550),
      createCoin(8750),
      createSpike(8950),
      createSpike(9200),
      createSpike(9450),
      createCoin(9650),
      createSpike(9850),
      createSpike(10100),

      createJumpPad(10350),
      createSpike(10650),
      createSpike(10900),
      createCoin(11100),
      createJumpOrb(11350, GAME_CONFIG.canvasHeight - 180),
      createSpike(11600),
      createSpike(11850),
      createCoin(12050),
      createSpike(12250),
      createSpike(12500),

      createJumpPad(12750),
      createSpike(13050),
      createSpike(13300),
      createCoin(13500),
      createSpike(13750),
      createSpike(14000),
      createCoin(14250),
    ],
    quants: [
      createJumpingQuant(1400, undefined, 20),
      createMovingQuant(3800, undefined, 20),
      createJumpingQuant(5600, undefined, 20),
      createMovingQuant(7700, undefined, 20),
      createStaticQuant(10000, undefined, 20),
      createJumpingQuant(12200, undefined, 20),
      createMovingQuant(13900, undefined, 20),
    ],
  },

  {
    id: 22,
    name: 'Photon Annihilator',
    planetName: 'Tarantula Nebula',
    groundColor: '#3d1040',
    backgroundColor: '#1e0a1e',
    length: 15000,
    obstacles: [
      createCoin(200),
      createSpike(400),
      createSpike(600),
      createSpike(800),
      createSpike(1000),
      createCoin(1200),
      createSpike(1400),
      createSpike(1600),
      createSpike(1850),
      createSpike(2100),
      createSpike(2350),
      createCoin(2550),
      createSpike(2750),
      createSpike(2950),
      createSpike(3200),
      createSpike(3450),
      createCoin(3650),
      createSpike(3850),

      createJumpPad(4100),
      createSpike(4400),
      createSpike(4650),
      createSpike(4900),
      createCoin(5100),
      createJumpOrb(5350, GAME_CONFIG.canvasHeight - 200),
      createSpike(5600),
      createSpike(5850),
      createSpike(6100),
      createCoin(6300),
      createSpike(6500),
      createSpike(6750),
      createSpike(7000),

      createJumpPad(7250),
      createSpike(7550),
      createCoin(7750),
      createSpike(7950),
      createSpike(8200),
      createSpike(8450),
      createJumpOrb(8700, GAME_CONFIG.canvasHeight - 170),
      createSpike(8950),
      createCoin(9150),
      createSpike(9350),
      createSpike(9600),
      createSpike(9850),
      createCoin(10050),
      createSpike(10250),
      createSpike(10500),

      createJumpPad(10750),
      createSpike(11050),
      createSpike(11300),
      createCoin(11500),
      createJumpOrb(11750, GAME_CONFIG.canvasHeight - 185),
      createSpike(12000),
      createSpike(12250),
      createCoin(12450),
      createSpike(12650),
      createSpike(12900),

      createJumpPad(13150),
      createSpike(13450),
      createSpike(13700),
      createCoin(13900),
      createSpike(14150),
      createSpike(14400),
      createCoin(14650),
      createSpike(14800),
    ],
    quants: [
      createMovingQuant(1300, undefined, 21),
      createJumpingQuant(3700, undefined, 21),
      createMovingQuant(5500, undefined, 21),
      createJumpingQuant(7400, undefined, 21),
      createStaticQuant(9500, undefined, 21),
      createMovingQuant(11700, undefined, 21),
      createJumpingQuant(13600, undefined, 21),
    ],
  },

  {
    id: 23,
    name: 'Nebula Shatter',
    planetName: 'Veil Nebula',
    groundColor: '#3d1040',
    backgroundColor: '#1e0a1e',
    length: 15500,
    obstacles: [
      createCoin(200),
      createSpike(350),
      createSpike(550),
      createSpike(750),
      createSpike(950),
      createCoin(1150),
      createSpike(1350),
      createSpike(1550),
      createSpike(1750),
      createSpike(2000),
      createSpike(2250),
      createCoin(2450),
      createSpike(2650),
      createSpike(2850),
      createSpike(3100),
      createSpike(3350),
      createSpike(3600),
      createCoin(3800),
      createSpike(4000),

      createJumpPad(4250),
      createSpike(4550),
      createSpike(4800),
      createSpike(5050),
      createCoin(5250),
      createJumpOrb(5500, GAME_CONFIG.canvasHeight - 195),
      createSpike(5750),
      createSpike(6000),
      createSpike(6250),
      createCoin(6450),
      createSpike(6650),
      createSpike(6900),
      createSpike(7150),

      createJumpPad(7400),
      createSpike(7700),
      createCoin(7900),
      createSpike(8100),
      createSpike(8350),
      createSpike(8600),
      createJumpOrb(8850, GAME_CONFIG.canvasHeight - 175),
      createSpike(9100),
      createCoin(9300),
      createSpike(9500),
      createSpike(9750),
      createSpike(10000),
      createCoin(10200),
      createSpike(10400),
      createSpike(10650),
      createSpike(10900),

      createJumpPad(11150),
      createSpike(11450),
      createSpike(11700),
      createCoin(11900),
      createJumpOrb(12150, GAME_CONFIG.canvasHeight - 180),
      createSpike(12400),
      createSpike(12650),
      createCoin(12850),
      createSpike(13050),
      createSpike(13300),

      createJumpPad(13550),
      createSpike(13850),
      createSpike(14100),
      createCoin(14300),
      createSpike(14550),
      createSpike(14800),
      createCoin(15050),
      createSpike(15250),
    ],
    quants: [
      createJumpingQuant(1200, undefined, 22),
      createMovingQuant(3500, undefined, 22),
      createJumpingQuant(5400, undefined, 22),
      createMovingQuant(7300, undefined, 22),
      createJumpingQuant(9600, undefined, 22),
      createStaticQuant(11600, undefined, 22),
      createMovingQuant(13700, undefined, 22),
      createJumpingQuant(15100, undefined, 22),
    ],
  },

  {
    id: 24,
    name: 'Star Collapse',
    planetName: 'Ring Nebula',
    groundColor: '#3d1040',
    backgroundColor: '#1e0a1e',
    length: 16000,
    obstacles: [
      createCoin(200),
      createSpike(350),
      createSpike(550),
      createSpike(750),
      createSpike(950),
      createSpike(1150),
      createCoin(1350),
      createSpike(1550),
      createSpike(1750),
      createSpike(1950),
      createSpike(2150),
      createSpike(2400),
      createCoin(2600),
      createSpike(2800),
      createSpike(3000),
      createSpike(3250),
      createSpike(3500),
      createSpike(3750),
      createCoin(3950),
      createSpike(4150),

      createJumpPad(4400),
      createSpike(4700),
      createSpike(4950),
      createSpike(5200),
      createCoin(5400),
      createJumpOrb(5650, GAME_CONFIG.canvasHeight - 200),
      createSpike(5900),
      createSpike(6150),
      createSpike(6400),
      createCoin(6600),
      createSpike(6800),
      createSpike(7050),
      createSpike(7300),

      createJumpPad(7550),
      createSpike(7850),
      createCoin(8050),
      createSpike(8250),
      createSpike(8500),
      createSpike(8750),
      createJumpOrb(9000, GAME_CONFIG.canvasHeight - 175),
      createSpike(9250),
      createCoin(9450),
      createSpike(9650),
      createSpike(9900),
      createSpike(10150),
      createCoin(10350),
      createSpike(10550),
      createSpike(10800),
      createSpike(11050),

      createJumpPad(11300),
      createSpike(11600),
      createSpike(11850),
      createCoin(12050),
      createJumpOrb(12300, GAME_CONFIG.canvasHeight - 180),
      createSpike(12550),
      createSpike(12800),
      createCoin(13000),
      createSpike(13200),
      createSpike(13450),
      createSpike(13700),

      createJumpPad(13950),
      createSpike(14250),
      createSpike(14500),
      createCoin(14700),
      createSpike(14950),
      createSpike(15200),
      createCoin(15450),
      createSpike(15700),
    ],
    quants: [
      createMovingQuant(1200, undefined, 23),
      createJumpingQuant(3400, undefined, 23),
      createMovingQuant(5300, undefined, 23),
      createJumpingQuant(7200, undefined, 23),
      createMovingQuant(9500, undefined, 23),
      createJumpingQuant(11500, undefined, 23),
      createStaticQuant(13600, undefined, 23),
      createMovingQuant(15500, undefined, 23),
    ],
  },

  // ── Nebula Vortex Boss ──────────────────────────────────────────────────────
  {
    id: 25,
    name: 'Nebula Devourer',
    planetName: 'Nebula Core',
    groundColor: '#3d1040',
    backgroundColor: '#1e0a1e',
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
