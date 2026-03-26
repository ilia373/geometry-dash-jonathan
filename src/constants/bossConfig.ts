/**
 * Boss configurations per universe
 * Used by Game.tsx for boss spawning and behavior
 */

export interface BossConfig {
  universeId: string;
  name: string;
  emoji: string;
  hp: number;
  size: number;
  color: string;
  glowColor: string;
  fireRate: number;
  projectileSpeed: number;
  projectileSize: { width: number; height: number };
  projectileHeights: [number, number];
  jumpInterval: number;
  jumpForce: number;
  coinDropMin: number;
  coinDropMax: number;
}

export const BOSS_CONFIGS: Record<string, BossConfig> = {
  milky_way: {
    universeId: 'milky_way',
    name: 'Galactic Guardian',
    emoji: '🔥',
    hp: 500,
    size: 90,
    color: '#FF6B35',
    glowColor: '#FF8C5A',
    fireRate: 120,
    projectileSpeed: 6,
    projectileSize: { width: 20, height: 12 },
    projectileHeights: [555, 400],
    jumpInterval: 90,
    jumpForce: -15,
    coinDropMin: 100,
    coinDropMax: 500,
  },
  andromeda: {
    universeId: 'andromeda',
    name: 'Andromeda Colossus',
    emoji: '🌀',
    hp: 800,
    size: 105,
    color: '#9b59b6',
    glowColor: '#b379d4',
    fireRate: 90,
    projectileSpeed: 8,
    projectileSize: { width: 24, height: 14 },
    projectileHeights: [555, 400],
    jumpInterval: 90,
    jumpForce: -15,
    coinDropMin: 200,
    coinDropMax: 700,
  },
};

/**
 * Get boss configuration by universe ID
 * @param universeId - The universe identifier
 * @returns BossConfig for the universe, or undefined if not found
 */
export function getBossConfig(universeId: string): BossConfig | undefined {
  return BOSS_CONFIGS[universeId];
}
