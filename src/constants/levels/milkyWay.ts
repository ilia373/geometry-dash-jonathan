import type { Level } from '../../types/game';
import { GAME_CONFIG } from '../physicsConfig';
import {
  createCoin,
  createJumpingQuant,
  createJumpOrb,
  createJumpPad,
  createMovingQuant,
  createSpike,
  createStaticQuant,
} from '../levelFactories';

export const MILKY_WAY_LEVELS: Level[] = [
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
];
