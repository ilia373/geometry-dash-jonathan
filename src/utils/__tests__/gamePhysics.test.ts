import { describe, it, expect, vi } from 'vitest';

// Mock Firebase config to prevent auth/invalid-api-key error in CI
vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
}));

// Mock skinManager
vi.mock('../skinManager', () => ({
  getSelectedSkin: vi.fn(() => ({
    id: 1,
    name: 'Original',
    colors: { primary: '#00ff88', secondary: '#00cc66', accent: '#009944', glow: '#00ff88' },
  })),
}));

import {
  createPlayer,
  updatePlayerPhysics,
  jump,
  isOnGround,
  checkCollision,
  checkAllCollisions,
  createDeathParticles,
  updateParticles,
  createTrailParticle,
  updateQuantPhysics,
  updateAllQuants,
  checkQuantCollision,
  checkAllQuantCollisions,
  createQuantDeathParticles,
  createDroppedCoins,
  updateDroppedCoins,
  checkDroppedCoinCollision,
} from '../gamePhysics';
import { GAME_CONFIG } from '../../constants/gameConfig';
import type { Obstacle, Particle, ObstacleType, Quant, DroppedCoin } from '../../types/game';

describe('gamePhysics', () => {
  describe('createPlayer', () => {
    it('should create a player at starting position', () => {
      const player = createPlayer();
      expect(player.x).toBe(100);
      expect(player.width).toBe(GAME_CONFIG.playerSize);
      expect(player.height).toBe(GAME_CONFIG.playerSize);
      expect(player.vy).toBe(0);
      expect(player.rotation).toBe(0);
      expect(player.isJumping).toBe(false);
      expect(player.isDead).toBe(false);
    });

    it('should position player above ground', () => {
      const player = createPlayer();
      const expectedY = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - GAME_CONFIG.playerSize;
      expect(player.y).toBe(expectedY);
    });
  });

  describe('updatePlayerPhysics', () => {
    it('should apply gravity to player', () => {
      const player = createPlayer();
      player.y = 200; // In the air
      player.vy = 0;
      player.isJumping = true;

      const updated = updatePlayerPhysics(player, GAME_CONFIG);
      expect(updated.vy).toBeGreaterThan(0); // Falling
      expect(updated.y).toBeGreaterThan(player.y);
    });

    it('should stop player at ground', () => {
      const player = createPlayer();
      const groundY = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - GAME_CONFIG.playerSize;
      player.y = groundY + 50; // Below ground
      player.vy = 10;
      player.isJumping = true;

      const updated = updatePlayerPhysics(player, GAME_CONFIG);
      expect(updated.y).toBe(groundY);
      expect(updated.vy).toBe(0);
      expect(updated.isJumping).toBe(false);
    });

    it('should stop player at ceiling', () => {
      const player = createPlayer();
      player.y = -10;
      player.vy = -5;

      const updated = updatePlayerPhysics(player, GAME_CONFIG);
      expect(updated.y).toBe(0);
      expect(updated.vy).toBe(0);
    });

    it('should rotate player while in air', () => {
      const player = createPlayer();
      player.y = 200;
      player.isJumping = true;
      player.rotation = 0;

      const updated = updatePlayerPhysics(player, GAME_CONFIG);
      expect(updated.rotation).toBe(5);
    });

    it('should snap rotation to 90 degrees when landing', () => {
      const player = createPlayer();
      const groundY = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - GAME_CONFIG.playerSize;
      player.y = groundY + 5;
      player.vy = 2;
      player.rotation = 47;
      player.isJumping = true;

      const updated = updatePlayerPhysics(player, GAME_CONFIG);
      expect(updated.rotation % 90).toBe(0);
    });
  });

  describe('jump', () => {
    it('should apply jump force to player', () => {
      const player = createPlayer();
      const jumped = jump(player, GAME_CONFIG);

      expect(jumped.vy).toBe(GAME_CONFIG.jumpForce);
      expect(jumped.isJumping).toBe(true);
    });

    it('should apply custom jump force', () => {
      const player = createPlayer();
      const customForce = -20;
      const jumped = jump(player, GAME_CONFIG, customForce);

      expect(jumped.vy).toBe(customForce);
    });
  });

  describe('isOnGround', () => {
    it('should return true when player is on ground', () => {
      const player = createPlayer();
      expect(isOnGround(player, GAME_CONFIG)).toBe(true);
    });

    it('should return false when player is in air', () => {
      const player = createPlayer();
      player.y = 100;
      expect(isOnGround(player, GAME_CONFIG)).toBe(false);
    });
  });

  describe('checkCollision', () => {
    const createObstacle = (type: ObstacleType, x: number, y: number): Obstacle => ({
      type,
      x,
      y,
      width: 40,
      height: 40,
    });

    it('should detect spike collision', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const spike = createObstacle('spike', 110, 400);
      const result = checkCollision(player, spike, 0);

      expect(result.type).toBe('death');
      expect(result.obstacle).toBe(spike);
    });

    it('should not detect collision when player is far away', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const spike = createObstacle('spike', 500, 400);
      const result = checkCollision(player, spike, 0);

      expect(result.type).toBeNull();
    });

    it('should detect coin collision', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const coin: Obstacle = { ...createObstacle('coin', 110, 400), collected: false };
      const result = checkCollision(player, coin, 0);

      expect(result.type).toBe('coin');
    });

    it('should not collect already collected coins', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const coin: Obstacle = { ...createObstacle('coin', 110, 400), collected: true };
      const result = checkCollision(player, coin, 0);

      expect(result.type).toBeNull();
    });

    it('should detect jump-pad collision', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const jumpPad = createObstacle('jump-pad', 110, 400);
      const result = checkCollision(player, jumpPad, 0);

      expect(result.type).toBe('jump-pad');
    });

    it('should detect jump-orb collision', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const jumpOrb = createObstacle('jump-orb', 110, 400);
      const result = checkCollision(player, jumpOrb, 0);

      expect(result.type).toBe('jump-orb');
    });

    it('should account for camera offset', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const spike = createObstacle('spike', 600, 400);
      const result = checkCollision(player, spike, 500); // Camera at 500

      expect(result.type).toBe('death');
    });
  });

  describe('checkAllCollisions', () => {
    it('should check all obstacles and return collisions', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const obstacles: Obstacle[] = [
        { type: 'spike', x: 110, y: 400, width: 40, height: 40 },
        { type: 'coin', x: 120, y: 400, width: 30, height: 30, collected: false },
        { type: 'spike', x: 5000, y: 400, width: 40, height: 40 }, // Far away
      ];

      const results = checkAllCollisions(player, obstacles, 0);
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should ignore off-screen obstacles', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const obstacles: Obstacle[] = [
        { type: 'spike', x: 5000, y: 400, width: 40, height: 40 },
      ];

      const results = checkAllCollisions(player, obstacles, 0);
      expect(results.length).toBe(0);
    });
  });

  describe('createDeathParticles', () => {
    it('should create 20 particles', () => {
      const player = createPlayer();
      const particles = createDeathParticles(player);

      expect(particles.length).toBe(20);
    });

    it('should create particles at player center', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 200;
      const particles = createDeathParticles(player);

      particles.forEach(p => {
        expect(p.x).toBe(player.x + player.width / 2);
        expect(p.y).toBe(player.y + player.height / 2);
      });
    });

    it('should create particles with life and color', () => {
      const player = createPlayer();
      const particles = createDeathParticles(player);

      particles.forEach(p => {
        expect(p.life).toBe(60);
        expect(p.maxLife).toBe(60);
        expect(p.color).toBeDefined();
        expect(p.size).toBeGreaterThan(0);
      });
    });
  });

  describe('updateParticles', () => {
    it('should update particle positions', () => {
      const particles: Particle[] = [
        { x: 100, y: 100, vx: 5, vy: -5, size: 10, color: '#fff', life: 60, maxLife: 60 },
      ];

      const updated = updateParticles(particles);
      expect(updated[0].x).toBe(105);
      expect(updated[0].y).toBe(95); // y + vy (gravity applied after)
    });

    it('should apply gravity to particles', () => {
      const particles: Particle[] = [
        { x: 100, y: 100, vx: 0, vy: 0, size: 10, color: '#fff', life: 60, maxLife: 60 },
      ];

      const updated = updateParticles(particles);
      expect(updated[0].vy).toBe(0.2);
    });

    it('should decrease particle life', () => {
      const particles: Particle[] = [
        { x: 100, y: 100, vx: 0, vy: 0, size: 10, color: '#fff', life: 60, maxLife: 60 },
      ];

      const updated = updateParticles(particles);
      expect(updated[0].life).toBe(59);
    });

    it('should remove dead particles', () => {
      const particles: Particle[] = [
        { x: 100, y: 100, vx: 0, vy: 0, size: 10, color: '#fff', life: 1, maxLife: 60 },
      ];

      const updated = updateParticles(particles);
      expect(updated.length).toBe(0);
    });

    it('should shrink particles over time', () => {
      const particles: Particle[] = [
        { x: 100, y: 100, vx: 0, vy: 0, size: 10, color: '#fff', life: 60, maxLife: 60 },
      ];

      const updated = updateParticles(particles);
      expect(updated[0].size).toBeLessThan(10);
    });
  });

  describe('createTrailParticle', () => {
    it('should create a trail particle at player position', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 200;
      const particle = createTrailParticle(player);

      // Particle should be near player's bottom
      expect(particle.x).toBeGreaterThanOrEqual(player.x);
      expect(particle.x).toBeLessThanOrEqual(player.x + 10);
      expect(particle.y).toBeGreaterThanOrEqual(player.y + player.height - 5);
      expect(particle.y).toBeLessThanOrEqual(player.y + player.height + 5);
    });

    it('should have negative vx (moving left, behind player)', () => {
      const player = createPlayer();
      const particle = createTrailParticle(player);

      expect(particle.vx).toBeLessThan(0);
    });

    it('should have short life for quick fade', () => {
      const player = createPlayer();
      const particle = createTrailParticle(player);

      expect(particle.life).toBe(20);
      expect(particle.maxLife).toBe(20);
    });

    it('should use skin glow color', () => {
      const player = createPlayer();
      const particle = createTrailParticle(player);

      expect(particle.color).toBe('#00ff88'); // From mocked skin
    });
  });

  describe('updateQuantPhysics', () => {
    const createQuant = (type: 'static' | 'moving' | 'jumping', overrides?: Partial<Quant>): Quant => ({
      id: 1,
      type,
      x: 500,
      y: 400,
      baseY: 400,
      width: 40,
      height: 40,
      vx: -2,
      vy: 0,
      color: '#ff0000',
      coinDrop: 5,
      isDead: false,
      ...overrides,
    });

    it('should not update dead quants', () => {
      const quant = createQuant('moving', { isDead: true, x: 500 });
      const updated = updateQuantPhysics(quant, 0);

      expect(updated.x).toBe(500);
      expect(updated).toBe(quant);
    });

    it('should move moving quants when on screen', () => {
      const quant = createQuant('moving', { x: 200, vx: -2 });
      const updated = updateQuantPhysics(quant, 0);

      expect(updated.x).toBe(198); // Moved left by vx
    });

    it('should not move moving quants when off screen', () => {
      const quant = createQuant('moving', { x: 2000 });
      const updated = updateQuantPhysics(quant, 0);

      expect(updated.x).toBe(2000);
    });

    it('should apply gravity to jumping quants', () => {
      const quant = createQuant('jumping', { y: 300, baseY: 400, vy: -5 });
      const updated = updateQuantPhysics(quant, 0);

      expect(updated.vy).toBeGreaterThan(-5); // Gravity reduces upward velocity
      expect(updated.y).toBe(300 + updated.vy);
    });

    it('should not move static quants', () => {
      const quant = createQuant('static', { x: 300 });
      const updated = updateQuantPhysics(quant, 0);

      expect(updated.x).toBe(300);
      expect(updated.y).toBe(quant.y);
    });
  });

  describe('updateAllQuants', () => {
    it('should update all quants in array', () => {
      const quants: Quant[] = [
        { id: 1, type: 'moving', x: 200, y: 400, baseY: 400, width: 40, height: 40, vx: -2, vy: 0, color: '#ff0000', coinDrop: 5, isDead: false },
        { id: 2, type: 'static', x: 300, y: 400, baseY: 400, width: 40, height: 40, vx: 0, vy: 0, color: '#00ff00', coinDrop: 3, isDead: false },
      ];

      const updated = updateAllQuants(quants, 0);

      expect(updated.length).toBe(2);
      expect(updated[0].x).toBe(198); // Moving quant moved
      expect(updated[1].x).toBe(300); // Static quant didn't move
    });
  });

  describe('checkQuantCollision', () => {
    const createQuant = (overrides?: Partial<Quant>): Quant => ({
      id: 1,
      type: 'static',
      x: 110,
      y: 400,
      baseY: 400,
      width: 40,
      height: 40,
      vx: 0,
      vy: 0,
      color: '#ff0000',
      coinDrop: 5,
      isDead: false,
      ...overrides,
    });

    it('should not detect collision with dead quants', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const quant = createQuant({ isDead: true });
      const result = checkQuantCollision(player, quant, 0);

      expect(result.type).toBeNull();
    });

    it('should detect stomp when player falls on top of quant', () => {
      const player = createPlayer();
      // Position player just above quant, overlapping slightly and falling down
      // Player hitbox: x + 8, y + 8, width - 16, height - 16
      // Quant hitbox: x + 5, y + 5, width - 10, height - 10
      // For collision: player hitbox bottom must overlap quant hitbox top
      player.x = 100;
      player.y = 380; // Just above quant at 400, overlapping after hitbox adjustment
      player.width = 40;
      player.height = 40;
      player.vy = 5; // Falling down

      // Quant at same x, slightly below
      const quant = createQuant({ x: 100, y: 400, width: 40, height: 40 });
      const result = checkQuantCollision(player, quant, 0);

      // playerCenterY = 380 + 20 = 400
      // quantCenterY = 400 + 20 = 420
      // playerBottom = 380 + 40 = 420
      // hittingTopHalf: 420 < 420 + 10 = 430 ✓
      // comingFromAbove: 400 < 420 ✓
      // vy > 0 ✓
      expect(result.type).toBe('stomp');
      expect(result.quant).toBe(quant);
    });

    it('should detect death when player collides from side', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400; // Same level
      player.vy = 0;

      const quant = createQuant({ x: 110, y: 400 });
      const result = checkQuantCollision(player, quant, 0);

      expect(result.type).toBe('death');
    });

    it('should not detect collision when far apart', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const quant = createQuant({ x: 500 });
      const result = checkQuantCollision(player, quant, 0);

      expect(result.type).toBeNull();
    });

    it('should account for camera offset', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;
      player.vy = 0;

      const quant = createQuant({ x: 610, y: 400 }); // Would be at 110 with camera at 500
      const result = checkQuantCollision(player, quant, 500);

      expect(result.type).toBe('death');
    });
  });

  describe('checkAllQuantCollisions', () => {
    it('should check all quants and return collisions', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;
      player.vy = 0;

      const quants: Quant[] = [
        { id: 1, type: 'static', x: 110, y: 400, baseY: 400, width: 40, height: 40, vx: 0, vy: 0, color: '#ff0000', coinDrop: 5, isDead: false },
        { id: 2, type: 'static', x: 5000, y: 400, baseY: 400, width: 40, height: 40, vx: 0, vy: 0, color: '#00ff00', coinDrop: 3, isDead: false }, // Far away
      ];

      const results = checkAllQuantCollisions(player, quants, 0);
      expect(results.length).toBe(1);
      expect(results[0].type).toBe('death');
    });

    it('should ignore off-screen quants', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const quants: Quant[] = [
        { id: 1, type: 'static', x: 5000, y: 400, baseY: 400, width: 40, height: 40, vx: 0, vy: 0, color: '#ff0000', coinDrop: 5, isDead: false },
      ];

      const results = checkAllQuantCollisions(player, quants, 0);
      expect(results.length).toBe(0);
    });
  });

  describe('createQuantDeathParticles', () => {
    it('should create 15 particles', () => {
      const quant: Quant = {
        id: 1, type: 'static', x: 200, y: 300, baseY: 300, width: 40, height: 40,
        vx: 0, vy: 0, color: '#ff0000', coinDrop: 5, isDead: false,
      };
      const particles = createQuantDeathParticles(quant, 0);

      expect(particles.length).toBe(15);
    });

    it('should create particles at quant center (screen position)', () => {
      const quant: Quant = {
        id: 1, type: 'static', x: 300, y: 200, baseY: 200, width: 40, height: 40,
        vx: 0, vy: 0, color: '#ff0000', coinDrop: 5, isDead: false,
      };
      const cameraX = 100;
      const particles = createQuantDeathParticles(quant, cameraX);

      const expectedX = (quant.x - cameraX) + quant.width / 2;
      const expectedY = quant.y + quant.height / 2;

      particles.forEach(p => {
        expect(p.x).toBe(expectedX);
        expect(p.y).toBe(expectedY);
      });
    });

    it('should use quant color for particles', () => {
      const quant: Quant = {
        id: 1, type: 'static', x: 200, y: 300, baseY: 300, width: 40, height: 40,
        vx: 0, vy: 0, color: '#00ff00', coinDrop: 5, isDead: false,
      };
      const particles = createQuantDeathParticles(quant, 0);

      particles.forEach(p => {
        expect(p.color).toBe('#00ff00');
      });
    });
  });

  describe('createDroppedCoins', () => {
    it('should create at least 3 coins', () => {
      const quant: Quant = {
        id: 1, type: 'static', x: 200, y: 300, baseY: 300, width: 40, height: 40,
        vx: 0, vy: 0, color: '#ff0000', coinDrop: 1, isDead: false,
      };
      const coins = createDroppedCoins(quant, 0);

      expect(coins.length).toBeGreaterThanOrEqual(3);
    });

    it('should create coinDrop number of coins if greater than 3', () => {
      const quant: Quant = {
        id: 1, type: 'static', x: 200, y: 300, baseY: 300, width: 40, height: 40,
        vx: 0, vy: 0, color: '#ff0000', coinDrop: 10, isDead: false,
      };
      const coins = createDroppedCoins(quant, 0);

      expect(coins.length).toBe(10);
    });

    it('should create coins at quant center (screen position)', () => {
      const quant: Quant = {
        id: 1, type: 'static', x: 300, y: 200, baseY: 200, width: 40, height: 40,
        vx: 0, vy: 0, color: '#ff0000', coinDrop: 5, isDead: false,
      };
      const cameraX = 100;
      const coins = createDroppedCoins(quant, cameraX);

      const expectedX = (quant.x - cameraX) + quant.width / 2;
      const expectedY = quant.y + quant.height / 2;

      coins.forEach(c => {
        expect(c.x).toBe(expectedX);
        expect(c.y).toBe(expectedY);
      });
    });

    it('should create coins with upward initial velocity', () => {
      const quant: Quant = {
        id: 1, type: 'static', x: 200, y: 300, baseY: 300, width: 40, height: 40,
        vx: 0, vy: 0, color: '#ff0000', coinDrop: 5, isDead: false,
      };
      const coins = createDroppedCoins(quant, 0);

      // Most coins should have some upward component due to -5 boost
      const coinsWithUpwardVelocity = coins.filter(c => c.vy < 0);
      expect(coinsWithUpwardVelocity.length).toBeGreaterThan(0);
    });

    it('should create unique ids for each coin', () => {
      const quant: Quant = {
        id: 1, type: 'static', x: 200, y: 300, baseY: 300, width: 40, height: 40,
        vx: 0, vy: 0, color: '#ff0000', coinDrop: 5, isDead: false,
      };
      const coins = createDroppedCoins(quant, 0);

      const ids = coins.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(coins.length);
    });
  });

  describe('updateDroppedCoins', () => {
    it('should apply gravity during spread phase', () => {
      const coins: DroppedCoin[] = [
        { id: 1, x: 100, y: 100, vx: 5, vy: 0, collected: false, life: 360 }, // New coin (age=0)
      ];

      const updated = updateDroppedCoins(coins, 200, 200, 40, 40);

      expect(updated[0].vy).toBeGreaterThan(0); // Gravity applied
    });

    it('should bounce off ground during spread phase', () => {
      const groundY = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - 15;
      const coins: DroppedCoin[] = [
        { id: 1, x: 100, y: groundY + 5, vx: 0, vy: 10, collected: false, life: 360 },
      ];

      const updated = updateDroppedCoins(coins, 200, 200, 40, 40);

      expect(updated[0].y).toBe(groundY);
      expect(updated[0].vy).toBeLessThan(0); // Bounced up
    });

    it('should move toward player during magnet phase', () => {
      // Coin is old (spread phase over)
      const coins: DroppedCoin[] = [
        { id: 1, x: 100, y: 100, vx: 0, vy: 0, collected: false, life: 290 }, // age=70 (past spread duration of 60)
      ];

      const updated = updateDroppedCoins(coins, 200, 200, 40, 40);

      // Coin should be moving toward player at (220, 220) center
      expect(updated[0].vx).toBeGreaterThan(0); // Moving right toward player
      expect(updated[0].vy).toBeGreaterThan(0); // Moving down toward player
    });

    it('should remove dead coins', () => {
      const coins: DroppedCoin[] = [
        { id: 1, x: 100, y: 100, vx: 0, vy: 0, collected: false, life: 1 },
      ];

      const updated = updateDroppedCoins(coins, 200, 200, 40, 40);

      expect(updated.length).toBe(0);
    });

    it('should remove collected coins', () => {
      const coins: DroppedCoin[] = [
        { id: 1, x: 100, y: 100, vx: 0, vy: 0, collected: true, life: 300 },
      ];

      const updated = updateDroppedCoins(coins, 200, 200, 40, 40);

      expect(updated.length).toBe(0);
    });

    it('should keep coins within wall bounds during spread phase', () => {
      const coins: DroppedCoin[] = [
        { id: 1, x: 5, y: 100, vx: -10, vy: 0, collected: false, life: 360 },
        { id: 2, x: GAME_CONFIG.canvasWidth - 5, y: 100, vx: 10, vy: 0, collected: false, life: 360 },
      ];

      const updated = updateDroppedCoins(coins, 200, 200, 40, 40);

      expect(updated[0].x).toBeGreaterThanOrEqual(10);
      expect(updated[1].x).toBeLessThanOrEqual(GAME_CONFIG.canvasWidth - 10);
    });
  });

  describe('checkDroppedCoinCollision', () => {
    it('should detect collision when coin overlaps player', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const coin: DroppedCoin = { id: 1, x: 120, y: 420, vx: 0, vy: 0, collected: false, life: 300 };

      const result = checkDroppedCoinCollision(player, coin);
      expect(result).toBe(true);
    });

    it('should not detect collision when coin is far from player', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const coin: DroppedCoin = { id: 1, x: 300, y: 400, vx: 0, vy: 0, collected: false, life: 300 };

      const result = checkDroppedCoinCollision(player, coin);
      expect(result).toBe(false);
    });

    it('should not detect collision with already collected coins', () => {
      const player = createPlayer();
      player.x = 100;
      player.y = 400;

      const coin: DroppedCoin = { id: 1, x: 120, y: 420, vx: 0, vy: 0, collected: true, life: 300 };

      const result = checkDroppedCoinCollision(player, coin);
      expect(result).toBe(false);
    });
  });
});
