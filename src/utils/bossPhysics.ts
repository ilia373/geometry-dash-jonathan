import type { BossProjectile, DroppedCoin, Player, Quant } from '../types/game';
import { GAME_CONFIG } from '../constants/gameConfig';

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
  projectileSize: {
    width: number;
    height: number;
  };
  projectileHeights: [number, number];
  jumpInterval: number;
  jumpForce: number;
  coinDropMin: number;
  coinDropMax: number;
}

export interface BossFireTimer {
  timer: number;
  shotIndex: 0 | 1;
}

export interface BossPhysicsUpdate {
  boss: Quant;
  fireTimer: BossFireTimer;
  jumpTimer: number;
  shouldFire: boolean;
}

export const createBoss = (config: BossConfig, universeId: string): Quant => {
  const _unusedUniverseId = universeId;
  void _unusedUniverseId;

  const size = config.size;
  const x = GAME_CONFIG.canvasWidth - size - 80;
  const baseY = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - size;

  return {
    x,
    y: baseY,
    width: size,
    height: size,
    type: 'boss',
    id: 9999,
    vx: 0,
    vy: 0,
    baseY,
    color: config.color,
    isDead: false,
    coinDrop: config.coinDropMax,
    hp: config.hp,
    maxHp: config.hp,
    flashTimer: 0,
  };
};

export const updateBossPhysics = (
  boss: Quant,
  config: BossConfig,
  fireTimer: BossFireTimer,
  jumpTimer: number
): BossPhysicsUpdate => {
  if (boss.isDead) {
    return {
      boss,
      fireTimer,
      jumpTimer,
      shouldFire: false,
    };
  }

  const gravity = GAME_CONFIG.gravity * 0.8;
  let newVy = boss.vy + gravity;
  let newY = boss.y + newVy;
  let newJumpTimer = jumpTimer;

  if (newY >= boss.baseY) {
    newY = boss.baseY;
    newVy = 0;

    if (jumpTimer >= config.jumpInterval) {
      newVy = config.jumpForce;
      newJumpTimer = 0;
    } else {
      newJumpTimer = jumpTimer + 1;
    }
  }

  if (newY < 0) {
    newY = 0;
    newVy = 0;
  }

  let shouldFire = false;
  let nextFireTimer = fireTimer.timer + 1;
  let nextShotIndex = fireTimer.shotIndex;

  if (nextFireTimer >= config.fireRate) {
    shouldFire = true;
    nextFireTimer = 0;
    nextShotIndex = fireTimer.shotIndex === 0 ? 1 : 0;
  }

  return {
    boss: {
      ...boss,
      y: newY,
      vy: newVy,
    },
    fireTimer: {
      timer: nextFireTimer,
      shotIndex: nextShotIndex,
    },
    jumpTimer: newJumpTimer,
    shouldFire,
  };
};

export const createBossProjectile = (
  boss: Quant,
  config: BossConfig,
  projectileId: number,
  heightIndex: 0 | 1
): BossProjectile => {
  return {
    id: projectileId,
    x: boss.x - config.projectileSize.width,
    y: config.projectileHeights[heightIndex],
    vx: -config.projectileSpeed,
    width: config.projectileSize.width,
    height: config.projectileSize.height,
    damage: 1,
    life: 300,
  };
};

export const updateBossProjectiles = (
  projectiles: BossProjectile[]
): BossProjectile[] => {
  return projectiles
    .map((projectile) => ({
      ...projectile,
      x: projectile.x + projectile.vx,
      life: projectile.life - 1,
    }))
    .filter((projectile) => projectile.life > 0 && projectile.x > -100);
};

export const checkBossProjectilePlayerCollision = (
  player: Player,
  projectile: BossProjectile
): boolean => {
  const playerHitbox = {
    x: player.x + 8,
    y: player.y + 8,
    width: player.width - 16,
    height: player.height - 16,
  };

  const projectileHitbox = {
    x: projectile.x,
    y: projectile.y,
    width: projectile.width,
    height: projectile.height,
  };

  return (
    playerHitbox.x < projectileHitbox.x + projectileHitbox.width &&
    playerHitbox.x + playerHitbox.width > projectileHitbox.x &&
    playerHitbox.y < projectileHitbox.y + projectileHitbox.height &&
    playerHitbox.y + playerHitbox.height > projectileHitbox.y
  );
};

export const createBossDeathCoins = (
  config: BossConfig,
  canvasWidth: number,
  canvasHeight: number,
  startId: number = 0
): DroppedCoin[] => {
  const coins: DroppedCoin[] = [];
  const minDrop = config.coinDropMin;
  const maxDrop = config.coinDropMax;
  const coinCount = Math.max(
    0,
    Math.floor(Math.random() * Math.max(0, maxDrop - minDrop)) + minDrop
  );

  if (coinCount === 0) {
    return coins;
  }

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  for (let i = 0; i < coinCount; i += 1) {
    const angle = (Math.PI * 2 * i) / coinCount - Math.PI / 2;
    const speed = 8 + Math.random() * 4;

    coins.push({
      id: startId + i + 1,
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      collected: false,
      life: 480,
    });
  }

  return coins;
};
