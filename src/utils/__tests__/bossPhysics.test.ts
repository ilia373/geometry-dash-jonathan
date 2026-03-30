import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  createBoss,
  updateBossPhysics,
  createBossProjectile,
  updateBossProjectiles,
  checkBossProjectilePlayerCollision,
  createBossDeathCoins,
} from '../bossPhysics';
import type { BossConfig, BossFireTimer } from '../bossPhysics';
import { BOSS_CONFIGS } from '../../constants/bossConfig';
import { GAME_CONFIG } from '../../constants/gameConfig';
import type { Player, Quant, BossProjectile } from '../../types/game';

const config: BossConfig = BOSS_CONFIGS.milky_way;

const createTestPlayer = (): Player => ({
  x: 80,
  y: 620,
  vy: 0,
  width: GAME_CONFIG.playerSize,
  height: GAME_CONFIG.playerSize,
  rotation: 0,
  isJumping: false,
  isDead: false,
});

const createTestBoss = (): Quant => createBoss(config, 'milky_way');

const defaultFireTimer = (): BossFireTimer => ({ timer: 0, shotIndex: 0 });

describe('bossPhysics', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('createBoss', () => {
    it('should return a Quant with type "boss"', () => {
      const boss = createTestBoss();
      expect(boss.type).toBe('boss');
    });

    it('should assign id 9999', () => {
      const boss = createTestBoss();
      expect(boss.id).toBe(9999);
    });

    it('should place x at canvasWidth - size - 80', () => {
      const boss = createTestBoss();
      const expectedX = GAME_CONFIG.canvasWidth - config.size - 80;
      expect(boss.x).toBe(expectedX);
    });

    it('should place y at canvasHeight - groundHeight - size (baseY)', () => {
      const boss = createTestBoss();
      const expectedY = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - config.size;
      expect(boss.y).toBe(expectedY);
    });

    it('should set baseY equal to y', () => {
      const boss = createTestBoss();
      expect(boss.baseY).toBe(boss.y);
    });

    it('should set hp and maxHp to config.hp', () => {
      const boss = createTestBoss();
      expect(boss.hp).toBe(config.hp);
      expect(boss.maxHp).toBe(config.hp);
    });

    it('should start with flashTimer = 0', () => {
      const boss = createTestBoss();
      expect(boss.flashTimer).toBe(0);
    });

    it('should start alive (isDead = false)', () => {
      const boss = createTestBoss();
      expect(boss.isDead).toBe(false);
    });

    it('should set coinDrop to config.coinDropMax', () => {
      const boss = createTestBoss();
      expect(boss.coinDrop).toBe(config.coinDropMax);
    });

    it('should set width and height to config.size', () => {
      const boss = createTestBoss();
      expect(boss.width).toBe(config.size);
      expect(boss.height).toBe(config.size);
    });

    it('should set vx and vy to 0', () => {
      const boss = createTestBoss();
      expect(boss.vx).toBe(0);
      expect(boss.vy).toBe(0);
    });
  });

  describe('updateBossPhysics', () => {
    it('should return unchanged state with shouldFire=false when boss is dead', () => {
      const boss = { ...createTestBoss(), isDead: true };
      const fireTimer = defaultFireTimer();
      const result = updateBossPhysics(boss, config, fireTimer, 0);

      expect(result.boss).toBe(boss);
      expect(result.fireTimer).toBe(fireTimer);
      expect(result.jumpTimer).toBe(0);
      expect(result.shouldFire).toBe(false);
    });

    it('should apply gravity (vy increases) when boss is in air', () => {
      const baseY = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - config.size;
      const boss = { ...createTestBoss(), y: baseY - 100, vy: 0 };
      const result = updateBossPhysics(boss, config, defaultFireTimer(), 0);

      expect(result.boss.vy).toBeGreaterThan(0);
      expect(result.boss.y).toBeGreaterThan(baseY - 100);
    });

    it('should clamp boss to baseY when it would go below', () => {
      const boss = { ...createTestBoss(), y: 600, vy: 20 };
      const result = updateBossPhysics(boss, config, defaultFireTimer(), 0);

      expect(result.boss.y).toBe(boss.baseY);
    });

    it('should reset vy to 0 upon landing', () => {
      const boss = { ...createTestBoss(), y: 600, vy: 20 };
      const result = updateBossPhysics(boss, config, defaultFireTimer(), 0);

      expect(result.boss.vy).toBe(0);
    });

    it('should trigger jump when jumpTimer >= config.jumpInterval and on ground', () => {
      const boss = { ...createTestBoss(), y: 600, vy: 20 };
      const result = updateBossPhysics(boss, config, defaultFireTimer(), config.jumpInterval);

      expect(result.boss.vy).toBe(config.jumpForce);
      expect(result.jumpTimer).toBe(0);
    });

    it('should increment jumpTimer by 1 when on ground but not yet at jumpInterval', () => {
      const boss = { ...createTestBoss(), y: 600, vy: 20 };
      const result = updateBossPhysics(boss, config, defaultFireTimer(), 5);

      expect(result.jumpTimer).toBe(6);
    });

    it('should not modify jumpTimer while boss is in air', () => {
      const baseY = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - config.size;
      const boss = { ...createTestBoss(), y: baseY - 50, vy: -5 };
      const result = updateBossPhysics(boss, config, defaultFireTimer(), 20);

      expect(result.jumpTimer).toBe(20);
    });

    it('should clamp y to 0 if it would go above ceiling', () => {
      const boss = { ...createTestBoss(), y: -5, vy: -50 };
      const result = updateBossPhysics(boss, config, defaultFireTimer(), 0);

      expect(result.boss.y).toBe(0);
      expect(result.boss.vy).toBe(0);
    });

    it('should set shouldFire=true when fireTimer reaches config.fireRate', () => {
      const boss = createTestBoss();
      const fireTimer: BossFireTimer = { timer: config.fireRate - 1, shotIndex: 0 };
      const result = updateBossPhysics(boss, config, fireTimer, 0);

      expect(result.shouldFire).toBe(true);
      expect(result.fireTimer.timer).toBe(0);
    });

    it('should cycle shotIndex from 0 to 1 when firing', () => {
      const boss = createTestBoss();
      const fireTimer: BossFireTimer = { timer: config.fireRate - 1, shotIndex: 0 };
      const result = updateBossPhysics(boss, config, fireTimer, 0);

      expect(result.fireTimer.shotIndex).toBe(1);
    });

    it('should cycle shotIndex from 1 to 2 when firing (3 heights)', () => {
      const boss = createTestBoss();
      const fireTimer: BossFireTimer = { timer: config.fireRate - 1, shotIndex: 1 };
      const result = updateBossPhysics(boss, config, fireTimer, 0);

      expect(result.fireTimer.shotIndex).toBe(2);
    });

    it('should wrap shotIndex back to 0 after reaching last height index', () => {
      const boss = createTestBoss();
      const lastIndex = config.projectileHeights.length - 1;
      const fireTimer: BossFireTimer = { timer: config.fireRate - 1, shotIndex: lastIndex };
      const result = updateBossPhysics(boss, config, fireTimer, 0);

      expect(result.fireTimer.shotIndex).toBe(0);
    });

    it('should increment timer when NOT firing', () => {
      const boss = createTestBoss();
      const fireTimer: BossFireTimer = { timer: 5, shotIndex: 0 };
      const result = updateBossPhysics(boss, config, fireTimer, 0);

      expect(result.shouldFire).toBe(false);
      expect(result.fireTimer.timer).toBe(6);
    });

    it('should not change shotIndex when NOT firing', () => {
      const boss = createTestBoss();
      const fireTimer: BossFireTimer = { timer: 5, shotIndex: 1 };
      const result = updateBossPhysics(boss, config, fireTimer, 0);

      expect(result.fireTimer.shotIndex).toBe(1);
    });
  });

  describe('createBossProjectile', () => {
    it('should set x to boss.x - projectileSize.width', () => {
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, config, 1, 0);

      expect(proj.x).toBe(boss.x - config.projectileSize.width);
    });

    it('should set y to projectileHeights[0] when heightIndex=0', () => {
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, config, 1, 0);

      expect(proj.y).toBe(config.projectileHeights[0]);
    });

    it('should set y to projectileHeights[1] when heightIndex=1', () => {
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, config, 2, 1);

      expect(proj.y).toBe(config.projectileHeights[1]);
    });

    it('should set y to projectileHeights[2] when heightIndex=2', () => {
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, config, 3, 2);

      expect(proj.y).toBe(config.projectileHeights[2]);
    });

    it('should wrap heightIndex via modulo when out of range', () => {
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, config, 4, config.projectileHeights.length);

      expect(proj.y).toBe(config.projectileHeights[0]);
    });

    it('should set vx to negative projectileSpeed (moves left)', () => {
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, config, 1, 0);

      expect(proj.vx).toBe(-config.projectileSpeed);
    });

    it('should set width and height from config.projectileSize', () => {
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, config, 1, 0);

      expect(proj.width).toBe(config.projectileSize.width);
      expect(proj.height).toBe(config.projectileSize.height);
    });

    it('should set damage to 1', () => {
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, config, 1, 0);

      expect(proj.damage).toBe(1);
    });

    it('should set life to 300', () => {
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, config, 1, 0);

      expect(proj.life).toBe(300);
    });

    it('should use the provided projectileId', () => {
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, config, 42, 0);

      expect(proj.id).toBe(42);
    });

    it('should use fixed height when aimAtPlayer is false', () => {
      const noAimConfig: BossConfig = { ...config, aimAtPlayer: false };
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, noAimConfig, 1, 0, 400);

      expect(proj.y).toBe(noAimConfig.projectileHeights[0]);
    });

    it('should use fixed height when playerY is undefined', () => {
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, config, 1, 0, undefined);

      expect(proj.y).toBe(config.projectileHeights[0]);
    });

    it('should aim at playerY when aimAtPlayer is true and random < aimChance', () => {
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const aimConfig: BossConfig = { ...config, aimAtPlayer: true, aimChance: 0.5 };
      const boss = createTestBoss();
      const playerY = 580;
      const proj = createBossProjectile(boss, aimConfig, 1, 0, playerY);

      expect(proj.y).toBe(playerY);
      spy.mockRestore();
    });

    it('should use fixed height when aimAtPlayer is true but random >= aimChance', () => {
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const aimConfig: BossConfig = { ...config, aimAtPlayer: true, aimChance: 0.5 };
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, aimConfig, 1, 0, 580);

      expect(proj.y).toBe(aimConfig.projectileHeights[0]);
      spy.mockRestore();
    });

    it('should default aimChance to 0 when not specified', () => {
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const noChanceConfig: BossConfig = { ...config, aimAtPlayer: true, aimChance: undefined };
      const boss = createTestBoss();
      const proj = createBossProjectile(boss, noChanceConfig, 1, 0, 580);

      // aimChance defaults to 0, random() returns 0, 0 < 0 is false → use fixed height
      expect(proj.y).toBe(noChanceConfig.projectileHeights[0]);
      spy.mockRestore();
    });
  });

  describe('updateBossProjectiles', () => {
    const makeProjectile = (overrides: Partial<BossProjectile> = {}): BossProjectile => ({
      id: 1,
      x: 500,
      y: 400,
      vx: -6,
      width: 20,
      height: 12,
      damage: 1,
      life: 300,
      ...overrides,
    });

    it('should move each projectile by its vx', () => {
      const projs = [makeProjectile({ x: 500, vx: -6 })];
      const updated = updateBossProjectiles(projs);

      expect(updated[0].x).toBe(494);
    });

    it('should decrement life by 1 each call', () => {
      const projs = [makeProjectile({ life: 100 })];
      const updated = updateBossProjectiles(projs);

      expect(updated[0].life).toBe(99);
    });

    it('should filter out projectiles with life <= 0', () => {
      const projs = [makeProjectile({ life: 1, x: 500 })];
      const updated = updateBossProjectiles(projs);

      expect(updated.length).toBe(0);
    });

    it('should filter out projectiles with x <= -100', () => {
      const projs = [makeProjectile({ x: -95, vx: -6 })];
      const updated = updateBossProjectiles(projs);

      expect(updated.length).toBe(0);
    });

    it('should keep projectiles that are still alive and on-screen', () => {
      const projs = [
        makeProjectile({ id: 1, x: 500, life: 200 }),
        makeProjectile({ id: 2, x: 300, life: 1 }),
        makeProjectile({ id: 3, x: -95, life: 100 }),
      ];
      const updated = updateBossProjectiles(projs);

      expect(updated.length).toBe(1);
      expect(updated[0].id).toBe(1);
    });

    it('should handle an empty array', () => {
      const updated = updateBossProjectiles([]);
      expect(updated).toEqual([]);
    });

    it('should not mutate original projectile array', () => {
      const projs = [makeProjectile({ x: 500, life: 50 })];
      const originalX = projs[0].x;
      updateBossProjectiles(projs);

      expect(projs[0].x).toBe(originalX);
    });
  });

  describe('checkBossProjectilePlayerCollision', () => {
    const makeProjectile = (x: number, y: number): BossProjectile => ({
      id: 1,
      x,
      y,
      vx: -6,
      width: 20,
      height: 12,
      damage: 1,
      life: 100,
    });

    it('should return true when projectile overlaps the player hitbox (center hit)', () => {
      const player = createTestPlayer();
      const proj = makeProjectile(90, 630);
      expect(checkBossProjectilePlayerCollision(player, proj)).toBe(true);
    });

    it('should return false when projectile is to the left (no overlap)', () => {
      const player = createTestPlayer();
      const proj = makeProjectile(50, 628);
      expect(checkBossProjectilePlayerCollision(player, proj)).toBe(false);
    });

    it('should return false when projectile is to the right (no overlap)', () => {
      const player = createTestPlayer();
      const proj = makeProjectile(150, 628);
      expect(checkBossProjectilePlayerCollision(player, proj)).toBe(false);
    });

    it('should return false when projectile is above (no overlap)', () => {
      const player = createTestPlayer();
      const proj = makeProjectile(90, 600);
      expect(checkBossProjectilePlayerCollision(player, proj)).toBe(false);
    });

    it('should return false when projectile is below (no overlap)', () => {
      const player = createTestPlayer();
      const proj = makeProjectile(90, 660);
      expect(checkBossProjectilePlayerCollision(player, proj)).toBe(false);
    });

    it('should return true when projectile partially overlaps from left side', () => {
      const player = createTestPlayer();
      const proj = makeProjectile(80, 630);
      expect(checkBossProjectilePlayerCollision(player, proj)).toBe(true);
    });

    it('should return true when projectile partially overlaps from right side', () => {
      const player = createTestPlayer();
      const proj = makeProjectile(105, 630);
      expect(checkBossProjectilePlayerCollision(player, proj)).toBe(true);
    });
  });

  describe('createBossDeathCoins', () => {
    const canvasWidth = GAME_CONFIG.canvasWidth;
    const canvasHeight = GAME_CONFIG.canvasHeight;

    it('should return between coinDropMin and coinDropMax coins', () => {
      for (let i = 0; i < 20; i++) {
        const coins = createBossDeathCoins(config, canvasWidth, canvasHeight);
        expect(coins.length).toBeGreaterThanOrEqual(config.coinDropMin);
        expect(coins.length).toBeLessThanOrEqual(config.coinDropMax);
      }
    });

    it('should start each coin at screen center (canvasWidth/2, canvasHeight/2)', () => {
      const coins = createBossDeathCoins(config, canvasWidth, canvasHeight);
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      coins.forEach(c => {
        expect(c.x).toBe(centerX);
        expect(c.y).toBe(centerY);
      });
    });

    it('should set life = 480 for all coins', () => {
      const coins = createBossDeathCoins(config, canvasWidth, canvasHeight);
      coins.forEach(c => { expect(c.life).toBe(480); });
    });

    it('should set collected = false for all coins', () => {
      const coins = createBossDeathCoins(config, canvasWidth, canvasHeight);
      coins.forEach(c => { expect(c.collected).toBe(false); });
    });

    it('should assign ids as startId + i + 1 (default startId=0)', () => {
      const coins = createBossDeathCoins(config, canvasWidth, canvasHeight);
      coins.forEach((c, i) => { expect(c.id).toBe(i + 1); });
    });

    it('should assign ids relative to custom startId', () => {
      const startId = 100;
      const coins = createBossDeathCoins(config, canvasWidth, canvasHeight, startId);
      coins.forEach((c, i) => { expect(c.id).toBe(startId + i + 1); });
    });

    it('should give each coin finite vx and vy values', () => {
      const coins = createBossDeathCoins(config, canvasWidth, canvasHeight);
      coins.forEach(c => {
        expect(isFinite(c.vx)).toBe(true);
        expect(isFinite(c.vy)).toBe(true);
      });
    });

    it('should produce unique ids when coinCount > 1', () => {
      const coins = createBossDeathCoins(config, canvasWidth, canvasHeight);
      if (coins.length > 1) {
        const ids = coins.map(c => c.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });

    it('should handle custom canvas dimensions', () => {
      const coins = createBossDeathCoins(config, 800, 600);
      coins.forEach(c => {
        expect(c.x).toBe(400);
        expect(c.y).toBe(300);
      });
    });
  });
});
