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

export const ANDROMEDA_LEVELS: Level[] = [
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
