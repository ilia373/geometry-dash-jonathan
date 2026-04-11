import {
  createSpike,
  createCoin,
  createJumpPad,
  createJumpOrb,
  createStaticQuant,
  createMovingQuant,
  createJumpingQuant,
} from '../constants/levelFactories';
import type { Obstacle, Quant, QuantType } from '../types/game';

export const spikeRun = (
  startX: number,
  count: number,
  spacing: number = 200
): Obstacle[] => {
  const result: Obstacle[] = [];
  for (let i = 0; i < count; i++) {
    result.push(createSpike(startX + i * spacing));
  }
  return result;
};

export const coinTrail = (
  startX: number,
  count: number,
  spacing: number = 150,
  y?: number
): Obstacle[] => {
  const result: Obstacle[] = [];
  for (let i = 0; i < count; i++) {
    result.push(createCoin(startX + i * spacing, y));
  }
  return result;
};

export const coinSpikePair = (
  startX: number,
  coinOffset: number = -150
): Obstacle[] => {
  return [createCoin(startX + coinOffset), createSpike(startX)];
};

export const jumpPadSection = (padX: number, spikeX: number): Obstacle[] => {
  return [createJumpPad(padX), createSpike(spikeX)];
};

export const jumpOrbSection = (
  orbX: number,
  orbY: number,
  followSpikeX?: number
): Obstacle[] => {
  const result: Obstacle[] = [createJumpOrb(orbX, orbY)];
  if (followSpikeX !== undefined) {
    result.push(createSpike(followSpikeX));
  }
  return result;
};

export const quantGroup = (
  startX: number,
  count: number,
  spacing: number,
  type: QuantType,
  levelIndex: number
): Quant[] => {
  const result: Quant[] = [];
  for (let i = 0; i < count; i++) {
    const x = startX + i * spacing;
    if (type === 'moving') {
      result.push(createMovingQuant(x, undefined, levelIndex));
    } else if (type === 'jumping') {
      result.push(createJumpingQuant(x, undefined, levelIndex));
    } else {
      result.push(createStaticQuant(x, undefined, levelIndex));
    }
  }
  return result;
};

export const mixedSection = (
  startX: number,
  levelIndex: number
): { obstacles: Obstacle[]; quants: Quant[] } => {
  const obstacles: Obstacle[] = [
    ...coinSpikePair(startX + 300),
    ...jumpPadSection(startX + 500, startX + 800),
  ];

  const quants: Quant[] = [
    createStaticQuant(startX + 1000, undefined, levelIndex),
  ];

  return { obstacles, quants };
};
