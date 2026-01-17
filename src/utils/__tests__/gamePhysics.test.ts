import { describe, it, expect, vi } from 'vitest';

// Mock Firebase config to prevent auth/invalid-api-key error in CI
vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
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
} from '../gamePhysics';
import { GAME_CONFIG } from '../../constants/gameConfig';
import type { Obstacle, Particle, ObstacleType } from '../../types/game';

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
});
