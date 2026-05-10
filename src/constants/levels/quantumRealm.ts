import type { Level } from '../../types/game';
import type { Obstacle, Quant } from '../../types/game';
import {
  createCoin,
  createJumpingQuant,
  createJumpOrb,
  createJumpPad,
  createMovingQuant,
  createSpike,
  createStaticQuant,
} from '../levelFactories';

const QUANTUM_REALM_GROUND = '#003d4d';
const QUANTUM_REALM_BACKGROUND = '#001a1f';

function extendObstacles(
  startX: number,
  endX: number,
  seed: number,
  spacing: number
): Obstacle[] {
  const result: Obstacle[] = [];
  let x = startX;
  let i = seed;
  while (x < endX) {
    const pattern = ((i % 10) + 10) % 10;
    if (pattern === 0) result.push(createSpike(x));
    else if (pattern === 1) result.push(createCoin(x, 540));
    else if (pattern === 2) result.push(createSpike(x));
    else if (pattern === 3) result.push(createJumpPad(x));
    else if (pattern === 4) result.push(createSpike(x));
    else if (pattern === 5) result.push(createSpike(x));
    else if (pattern === 6) result.push(createCoin(x, 530));
    else if (pattern === 7) result.push(createJumpOrb(x, 490));
    else if (pattern === 8) result.push(createSpike(x));
    else result.push(createCoin(x, 535));
    x += spacing + ((i % 3) - 1) * 30;
    i++;
  }
  return result;
}

function extendQuants(
  startX: number,
  endX: number,
  levelIndex: number,
  count: number,
  seed: number
): Quant[] {
  const result: Quant[] = [];
  if (count <= 0 || endX <= startX) return result;
  const step = (endX - startX) / count;
  for (let i = 0; i < count; i++) {
    const x = Math.round(startX + step * (i + 0.5));
    const t = ((i + seed) % 3 + 3) % 3;
    if (t === 0) result.push(createStaticQuant(x, undefined, levelIndex));
    else if (t === 1) result.push(createMovingQuant(x, undefined, levelIndex));
    else result.push(createJumpingQuant(x, undefined, levelIndex));
  }
  return result;
}

const EXTEND_END = 15500;

export const QUANTUM_REALM_LEVELS: Level[] = [
  {
    id: 26,
    name: 'Superposition',
    planetName: 'Quantum Gate Alpha',
    groundColor: QUANTUM_REALM_GROUND,
    backgroundColor: QUANTUM_REALM_BACKGROUND,
    length: 16000,
    obstacles: [
      createCoin(850, 540),
      createSpike(1100),
      createCoin(1500, 540),
      createSpike(1850),
      createCoin(2350, 540),
      createSpike(2700),
      createCoin(3200, 540),
      createSpike(3650),
      createSpike(4200),
      createCoin(4550, 520),
      createJumpOrb(4900, 485),
      createSpike(5250),
      createCoin(5850, 530),
      createSpike(6300),
      ...extendObstacles(6800, EXTEND_END, 0, 360),
    ],
    quants: [
      createStaticQuant(2100, undefined, 25),
      createStaticQuant(5200, undefined, 25),
      ...extendQuants(7000, EXTEND_END, 25, 5, 0),
    ],
  },
  {
    id: 27,
    name: 'Entanglement',
    planetName: 'Quantum Gate Beta',
    groundColor: QUANTUM_REALM_GROUND,
    backgroundColor: QUANTUM_REALM_BACKGROUND,
    length: 16000,
    obstacles: [
      createCoin(820, 540),
      createSpike(1080),
      createCoin(1400, 540),
      createSpike(1700),
      createCoin(2100, 540),
      createSpike(2450),
      createSpike(2850),
      createCoin(3200, 530),
      createSpike(3550),
      createCoin(3950, 530),
      createJumpPad(4300),
      createSpike(4700),
      createCoin(5150, 540),
      createSpike(5550),
      createJumpOrb(6000, 490),
      createSpike(6350),
      ...extendObstacles(6850, EXTEND_END, 1, 350),
    ],
    quants: [
      createStaticQuant(2000, undefined, 26),
      createMovingQuant(5000, undefined, 26),
      ...extendQuants(7000, EXTEND_END, 26, 5, 1),
    ],
  },
  {
    id: 28,
    name: 'Wave Function',
    planetName: 'Quantum Gate Gamma',
    groundColor: QUANTUM_REALM_GROUND,
    backgroundColor: QUANTUM_REALM_BACKGROUND,
    length: 16000,
    obstacles: [
      createCoin(840, 540),
      createSpike(1120),
      createCoin(1450, 540),
      createSpike(1750),
      createSpike(2100),
      createCoin(2450, 540),
      createSpike(2800),
      createCoin(3200, 530),
      createJumpPad(3600),
      createSpike(3950),
      createCoin(4350, 530),
      createJumpOrb(4700, 495),
      createSpike(5050),
      createSpike(5400),
      createCoin(5750, 530),
      ...extendObstacles(6300, EXTEND_END, 2, 340),
    ],
    quants: [
      createStaticQuant(1900, undefined, 27),
      createMovingQuant(4300, undefined, 27),
      createJumpingQuant(6200, undefined, 27),
      ...extendQuants(7000, EXTEND_END, 27, 6, 2),
    ],
  },
  {
    id: 29,
    name: 'Quantum Tunneling',
    planetName: 'Quantum Gate Delta',
    groundColor: QUANTUM_REALM_GROUND,
    backgroundColor: QUANTUM_REALM_BACKGROUND,
    length: 16000,
    obstacles: [
      createCoin(800, 540),
      createSpike(1080),
      createSpike(1420),
      createCoin(1750, 535),
      createSpike(2100),
      createCoin(2450, 535),
      createSpike(2800),
      createSpike(3100),
      createCoin(3450, 525),
      createJumpPad(3800),
      createSpike(4200),
      createCoin(4550, 520),
      createJumpOrb(4900, 490),
      createSpike(5250),
      createSpike(5600),
      ...extendObstacles(6100, EXTEND_END, 3, 330),
    ],
    quants: [
      createStaticQuant(2000, undefined, 28),
      createMovingQuant(3600, undefined, 28),
      createJumpingQuant(5200, undefined, 28),
      createMovingQuant(6400, undefined, 28),
      ...extendQuants(7100, EXTEND_END, 28, 6, 3),
    ],
  },
  {
    id: 30,
    name: "Schrödinger's Gate",
    planetName: 'Quantum Gate Epsilon',
    groundColor: QUANTUM_REALM_GROUND,
    backgroundColor: QUANTUM_REALM_BACKGROUND,
    length: 16000,
    obstacles: [
      createCoin(820, 540),
      createSpike(1100),
      createSpike(1420),
      createCoin(1750, 535),
      createSpike(2100),
      createSpike(2420),
      createCoin(2750, 530),
      createJumpPad(3100),
      createSpike(3500),
      createCoin(3850, 525),
      createJumpPad(4200),
      createSpike(4550),
      createCoin(4900, 520),
      createJumpOrb(5250, 495),
      createSpike(5600),
      createSpike(5950),
      ...extendObstacles(6450, EXTEND_END, 4, 320),
    ],
    quants: [
      createStaticQuant(1950, undefined, 29),
      createMovingQuant(3600, undefined, 29),
      createJumpingQuant(5200, undefined, 29),
      createMovingQuant(6600, undefined, 29),
      ...extendQuants(7200, EXTEND_END, 29, 7, 4),
    ],
  },
  {
    id: 31,
    name: "Heisenberg's Path",
    planetName: 'Quantum Gate Zeta',
    groundColor: QUANTUM_REALM_GROUND,
    backgroundColor: QUANTUM_REALM_BACKGROUND,
    length: 16000,
    obstacles: [
      createCoin(800, 540),
      createSpike(1080),
      createSpike(1400),
      createCoin(1700, 535),
      createSpike(2050),
      createSpike(2350),
      createCoin(2700, 530),
      createJumpPad(3050),
      createSpike(3450),
      createCoin(3800, 525),
      createJumpOrb(4150, 495),
      createSpike(4500),
      createCoin(4850, 520),
      createJumpPad(5200),
      createSpike(5550),
      createJumpOrb(5900, 485),
      createSpike(6250),
      ...extendObstacles(6750, EXTEND_END, 5, 310),
    ],
    quants: [
      createMovingQuant(1900, undefined, 30),
      createStaticQuant(3500, undefined, 30),
      createJumpingQuant(4700, undefined, 30),
      createMovingQuant(6100, undefined, 30),
      createJumpingQuant(7200, undefined, 30),
      ...extendQuants(8000, EXTEND_END, 30, 7, 5),
    ],
  },
  {
    id: 32,
    name: 'Dark Energy',
    planetName: 'Quantum Gate Eta',
    groundColor: QUANTUM_REALM_GROUND,
    backgroundColor: QUANTUM_REALM_BACKGROUND,
    length: 16000,
    obstacles: [
      createCoin(780, 540),
      createSpike(1050),
      createSpike(1320),
      createCoin(1600, 535),
      createSpike(1900),
      createSpike(2200),
      createCoin(2500, 530),
      createJumpPad(2850),
      createSpike(3200),
      createCoin(3500, 525),
      createJumpOrb(3850, 495),
      createSpike(4150),
      createSpike(4450),
      createCoin(4750, 520),
      createJumpPad(5100),
      createSpike(5450),
      createJumpOrb(5800, 490),
      createSpike(6120),
      ...extendObstacles(6600, EXTEND_END, 6, 300),
    ],
    quants: [
      createStaticQuant(1750, undefined, 31),
      createMovingQuant(3300, undefined, 31),
      createJumpingQuant(4550, undefined, 31),
      createMovingQuant(5850, undefined, 31),
      createJumpingQuant(7200, undefined, 31),
      ...extendQuants(8000, EXTEND_END, 31, 8, 6),
    ],
  },
  {
    id: 33,
    name: 'Planck Epoch',
    planetName: 'Quantum Gate Theta',
    groundColor: QUANTUM_REALM_GROUND,
    backgroundColor: QUANTUM_REALM_BACKGROUND,
    length: 16000,
    obstacles: [
      createCoin(760, 540),
      createSpike(1020),
      createSpike(1280),
      createCoin(1550, 535),
      createSpike(1820),
      createSpike(2080),
      createCoin(2350, 530),
      createJumpPad(2680),
      createSpike(3000),
      createCoin(3300, 525),
      createJumpOrb(3600, 495),
      createSpike(3900),
      createSpike(4200),
      createCoin(4500, 520),
      createJumpPad(4850),
      createSpike(5150),
      createJumpOrb(5450, 485),
      createSpike(5750),
      createSpike(6050),
      ...extendObstacles(6550, EXTEND_END, 7, 290),
    ],
    quants: [
      createMovingQuant(1700, undefined, 32),
      createJumpingQuant(3150, undefined, 32),
      createStaticQuant(4400, undefined, 32),
      createMovingQuant(5600, undefined, 32),
      createJumpingQuant(6900, undefined, 32),
      createStaticQuant(8150, undefined, 32),
      ...extendQuants(9000, EXTEND_END, 32, 8, 7),
    ],
  },
  {
    id: 34,
    name: 'Quantum Decoherence',
    planetName: 'Quantum Gate Iota',
    groundColor: QUANTUM_REALM_GROUND,
    backgroundColor: QUANTUM_REALM_BACKGROUND,
    length: 16000,
    obstacles: [
      createCoin(740, 540),
      createSpike(1000),
      createSpike(1260),
      createCoin(1520, 535),
      createSpike(1780),
      createSpike(2040),
      createCoin(2300, 530),
      createJumpPad(2600),
      createSpike(2900),
      createCoin(3200, 525),
      createJumpOrb(3500, 495),
      createSpike(3800),
      createSpike(4100),
      createCoin(4400, 520),
      createJumpPad(4700),
      createSpike(5000),
      createJumpOrb(5300, 485),
      createSpike(5600),
      createSpike(5900),
      createJumpPad(6200),
      createSpike(6500),
      ...extendObstacles(7000, EXTEND_END, 8, 280),
    ],
    quants: [
      createMovingQuant(1650, undefined, 33),
      createJumpingQuant(3000, undefined, 33),
      createStaticQuant(4300, undefined, 33),
      createMovingQuant(5500, undefined, 33),
      createJumpingQuant(6900, undefined, 33),
      createStaticQuant(8200, undefined, 33),
      createMovingQuant(9400, undefined, 33),
      createJumpingQuant(10600, undefined, 33),
      ...extendQuants(11400, EXTEND_END, 33, 5, 8),
    ],
  },
  {
    id: 35,
    name: 'Quantum Collapse',
    planetName: 'Quantum Singularity',
    groundColor: QUANTUM_REALM_GROUND,
    backgroundColor: QUANTUM_REALM_BACKGROUND,
    length: 1280,
    levelType: 'boss',
    obstacles: [],
    quants: [],
  },
];
