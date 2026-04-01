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
  projectileHeights: number[];
  jumpInterval: number;
  jumpForce: number;
  coinDropMin: number;
  coinDropMax: number;
  aimAtPlayer?: boolean;
  aimChance?: number;
  burstCount?: number;
  burstDelay?: number;
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
    fireRate: 70,
    projectileSpeed: 8,
    projectileSize: { width: 30, height: 18 },
    projectileHeights: [590, 560, 540],
    jumpInterval: 60,
    jumpForce: -15,
    coinDropMin: 100,
    coinDropMax: 500,
    aimAtPlayer: true,
    aimChance: 0.3,
  },
  andromeda: {
    universeId: 'andromeda',
    name: 'Andromeda Colossus',
    emoji: '🌀',
    hp: 800,
    size: 105,
    color: '#9b59b6',
    glowColor: '#b379d4',
    fireRate: 50,
    projectileSpeed: 10,
    projectileSize: { width: 36, height: 20 },
    projectileHeights: [590, 570, 545, 510],
    jumpInterval: 45,
    jumpForce: -18,
    coinDropMin: 200,
    coinDropMax: 700,
    aimAtPlayer: true,
    aimChance: 0.5,
    burstCount: 2,
    burstDelay: 8,
  },
  nebula_vortex: {
    universeId: 'nebula_vortex',
    name: 'Nebula Devourer',
    emoji: '💫',
    hp: 1200,
    size: 115,
    color: '#ff69b4',
    glowColor: '#ff1493',
    fireRate: 35,
    projectileSpeed: 13,
    projectileSize: { width: 40, height: 22 },
    projectileHeights: [590, 570, 545, 510, 480],
    jumpInterval: 35,
    jumpForce: -20,
    coinDropMin: 300,
    coinDropMax: 900,
    aimAtPlayer: true,
    aimChance: 0.7,
    burstCount: 3,
    burstDelay: 6,
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
