import type { Level } from '../types/game';
import { LEVELS } from './gameConfig';

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
