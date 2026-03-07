import { describe, it, expect } from 'vitest';

// Mock Firebase as safeguard (these are pure functions, but mock just in case)
import { vi } from 'vitest';
vi.mock('../../config/firebase', () => ({ db: {} }));

// Import after mocks
import {
  createProjectile,
  updateProjectiles,
  checkProjectileQuantCollision,
  checkAllProjectileCollisions,
  MAX_PROJECTILES,
} from '../projectilePhysics';
import type { Projectile } from '../../types/game';
import type { Quant } from '../../types/game';

// ── Helper factories ──────────────────────────────────────────────────────────

const makeProjectile = (overrides: Partial<Projectile> = {}): Projectile => ({
  id: 1,
  x: 500,
  y: 400,
  vx: 8,
  width: 8,
  height: 4,
  damage: 10,
  life: 300,
  category: 'ballistic',
  color: '#FFD700',
  ...overrides,
});

const makeQuant = (overrides: Partial<Quant> = {}): Quant => ({
  id: 1,
  x: 500,
  y: 395,
  width: 35,
  height: 35,
  type: 'static',
  vx: 0,
  vy: 0,
  baseY: 395,
  color: '#8B00FF',
  isDead: false,
  coinDrop: 5,
  hp: 20,
  maxHp: 20,
  flashTimer: 0,
  ...overrides,
});

// ── MAX_PROJECTILES ───────────────────────────────────────────────────────────

describe('MAX_PROJECTILES', () => {
  it('should equal 50', () => {
    expect(MAX_PROJECTILES).toBe(50);
  });
});

// ── createProjectile ──────────────────────────────────────────────────────────

describe('createProjectile', () => {
  const player = { x: 50, y: 400, width: 40, height: 40 };
  const weapon = {
    projectileSpeed: 8,
    projectileSize: { width: 8, height: 4 },
    damage: 5,
    category: 'ballistic' as const,
    projectileColor: '#FFD700',
    // Additional required Weapon fields (minimal stubs)
    name: 'Test Gun',
    type: 'ranged',
    fireRate: 10,
    unlockCost: 0,
  };
  const cameraX = 100;
  const projectileId = 1;

  it('should set x to player.x + player.width + cameraX (world-space)', () => {
    const p = createProjectile(player as never, weapon as never, cameraX, projectileId);
    // 50 + 40 + 100 = 190
    expect(p.x).toBe(190);
  });

  it('should set y to player center minus half projectile height', () => {
    const p = createProjectile(player as never, weapon as never, cameraX, projectileId);
    // 400 + 40/2 - 4/2 = 400 + 20 - 2 = 418
    expect(p.y).toBe(418);
  });

  it('should set vx to weapon.projectileSpeed', () => {
    const p = createProjectile(player as never, weapon as never, cameraX, projectileId);
    expect(p.vx).toBe(8);
  });

  it('should set damage from weapon', () => {
    const p = createProjectile(player as never, weapon as never, cameraX, projectileId);
    expect(p.damage).toBe(5);
  });

  it('should set life to 300', () => {
    const p = createProjectile(player as never, weapon as never, cameraX, projectileId);
    expect(p.life).toBe(300);
  });

  it('should set category from weapon', () => {
    const p = createProjectile(player as never, weapon as never, cameraX, projectileId);
    expect(p.category).toBe('ballistic');
  });

  it('should set color from weapon.projectileColor', () => {
    const p = createProjectile(player as never, weapon as never, cameraX, projectileId);
    expect(p.color).toBe('#FFD700');
  });

  it('should set the provided projectileId as id', () => {
    const p = createProjectile(player as never, weapon as never, cameraX, 42);
    expect(p.id).toBe(42);
  });

  it('should set width and height from weapon.projectileSize', () => {
    const p = createProjectile(player as never, weapon as never, cameraX, projectileId);
    expect(p.width).toBe(8);
    expect(p.height).toBe(4);
  });
});

// ── updateProjectiles ─────────────────────────────────────────────────────────

describe('updateProjectiles', () => {
  it('should move projectile by vx and decrement life', () => {
    const p = makeProjectile({ x: 500, vx: 8, life: 300 });
    const result = updateProjectiles([p]);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBe(508);
    expect(result[0].life).toBe(299);
  });

  it('should filter out projectile when life reaches 0 (life=1 → 0 → removed)', () => {
    const p = makeProjectile({ life: 1 });
    const result = updateProjectiles([p]);
    expect(result).toHaveLength(0);
  });

  it('should filter out projectile when life is already 0', () => {
    const p = makeProjectile({ life: 0 });
    // After update life becomes -1, which is not > 0
    const result = updateProjectiles([p]);
    expect(result).toHaveLength(0);
  });

  it('should return empty array when input is empty', () => {
    expect(updateProjectiles([])).toEqual([]);
  });

  it('should update multiple projectiles independently', () => {
    const p1 = makeProjectile({ id: 1, x: 100, vx: 5, life: 10 });
    const p2 = makeProjectile({ id: 2, x: 200, vx: 3, life: 2 });
    const result = updateProjectiles([p1, p2]);
    expect(result).toHaveLength(2);
    expect(result[0].x).toBe(105);
    expect(result[0].life).toBe(9);
    expect(result[1].x).toBe(203);
    expect(result[1].life).toBe(1);
  });

  it('should keep alive projectiles and remove expired ones in the same array', () => {
    const alive = makeProjectile({ id: 1, life: 5 });
    const dying = makeProjectile({ id: 2, life: 1 });
    const result = updateProjectiles([alive, dying]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('should not mutate the original array', () => {
    const p = makeProjectile({ x: 100 });
    const original = [...[p]];
    updateProjectiles([p]);
    expect(p.x).toBe(100); // original projectile unchanged
    expect(original[0].x).toBe(100);
  });
});

// ── checkProjectileQuantCollision ─────────────────────────────────────────────

describe('checkProjectileQuantCollision', () => {
  it('should return true when projectile overlaps quant (quant fully encloses projectile)', () => {
    // Projectile at (505, 400, 8x4), quant at (500, 395, 35x35)
    // Overlap: 505 < 535 && 513 > 500 && 400 < 430 && 404 > 395 → true
    const p = makeProjectile({ x: 505, y: 400, width: 8, height: 4 });
    const q = makeQuant({ x: 500, y: 395, width: 35, height: 35 });
    expect(checkProjectileQuantCollision(p, q, 0)).toBe(true);
  });

  it('should return false when projectile is far to the right of quant', () => {
    const p = makeProjectile({ x: 600, y: 400, width: 8, height: 4 });
    const q = makeQuant({ x: 500, y: 395, width: 35, height: 35 });
    expect(checkProjectileQuantCollision(p, q, 0)).toBe(false);
  });

  it('should return false when projectile is far to the left of quant', () => {
    const p = makeProjectile({ x: 400, y: 400, width: 8, height: 4 });
    const q = makeQuant({ x: 500, y: 395, width: 35, height: 35 });
    expect(checkProjectileQuantCollision(p, q, 0)).toBe(false);
  });

  it('should return false when projectile is above the quant', () => {
    const p = makeProjectile({ x: 505, y: 300, width: 8, height: 4 });
    const q = makeQuant({ x: 500, y: 395, width: 35, height: 35 });
    expect(checkProjectileQuantCollision(p, q, 0)).toBe(false);
  });

  it('should return false when projectile is below the quant', () => {
    const p = makeProjectile({ x: 505, y: 500, width: 8, height: 4 });
    const q = makeQuant({ x: 500, y: 395, width: 35, height: 35 });
    expect(checkProjectileQuantCollision(p, q, 0)).toBe(false);
  });

  it('should return false when quant isDead is true', () => {
    const p = makeProjectile({ x: 505, y: 400, width: 8, height: 4 });
    const q = makeQuant({ x: 500, y: 395, width: 35, height: 35, isDead: true });
    expect(checkProjectileQuantCollision(p, q, 0)).toBe(false);
  });

  it('should return false when quant hp <= 0', () => {
    const p = makeProjectile({ x: 505, y: 400, width: 8, height: 4 });
    const q = makeQuant({ x: 500, y: 395, width: 35, height: 35, hp: 0 });
    expect(checkProjectileQuantCollision(p, q, 0)).toBe(false);
  });

  it('should return false when quant hp is negative', () => {
    const p = makeProjectile({ x: 505, y: 400, width: 8, height: 4 });
    const q = makeQuant({ x: 500, y: 395, width: 35, height: 35, hp: -5 });
    expect(checkProjectileQuantCollision(p, q, 0)).toBe(false);
  });

  it('should ignore cameraX (projectile and quant are in world-space)', () => {
    // Same positions, different cameraX — result should be same
    const p = makeProjectile({ x: 505, y: 400, width: 8, height: 4 });
    const q = makeQuant({ x: 500, y: 395, width: 35, height: 35 });
    const r1 = checkProjectileQuantCollision(p, q, 0);
    const r2 = checkProjectileQuantCollision(p, q, 9999);
    expect(r1).toBe(r2);
    expect(r1).toBe(true);
  });

  it('should NOT collide when projectile right edge exactly touches quant left edge (strict < AABB)', () => {
    // Projectile x=500 width=8 → right edge=508; quant x=508
    // Condition: projectile.x + width > quant.x → 508 > 508 → false → no collision
    const p = makeProjectile({ x: 500, y: 400, width: 8, height: 4 });
    const q = makeQuant({ x: 508, y: 395, width: 35, height: 35 });
    expect(checkProjectileQuantCollision(p, q, 0)).toBe(false);
  });

  it('should NOT collide when projectile left edge exactly touches quant right edge (strict < AABB)', () => {
    // Projectile x=535 width=8; quant x=500 width=35 → right=535
    // Condition: projectile.x < quant.x + quant.width → 535 < 535 → false → no collision
    const p = makeProjectile({ x: 535, y: 400, width: 8, height: 4 });
    const q = makeQuant({ x: 500, y: 395, width: 35, height: 35 });
    expect(checkProjectileQuantCollision(p, q, 0)).toBe(false);
  });

  it('should collide when projectile overlaps quant by 1px on the x axis', () => {
    // Projectile x=507 width=8 → right=515; quant x=508 width=35
    // 507 < 543 && 515 > 508 → true; need y to also overlap
    const p = makeProjectile({ x: 507, y: 400, width: 8, height: 4 });
    const q = makeQuant({ x: 508, y: 395, width: 35, height: 35 });
    expect(checkProjectileQuantCollision(p, q, 0)).toBe(true);
  });
});

// ── checkAllProjectileCollisions ──────────────────────────────────────────────

describe('checkAllProjectileCollisions', () => {
  it('should return empty array when projectiles is empty', () => {
    const q = makeQuant();
    expect(checkAllProjectileCollisions([], [q], 0)).toEqual([]);
  });

  it('should return empty array when quants is empty', () => {
    const p = makeProjectile();
    expect(checkAllProjectileCollisions([p], [], 0)).toEqual([]);
  });

  it('should return empty array when both arrays are empty', () => {
    expect(checkAllProjectileCollisions([], [], 0)).toEqual([]);
  });

  it('should return a hit when projectile overlaps a quant', () => {
    // Projectile inside quant bounds
    const p = makeProjectile({ id: 1, x: 505, y: 400, width: 8, height: 4, damage: 10 });
    const q = makeQuant({ id: 2, x: 500, y: 395, width: 35, height: 35 });
    const hits = checkAllProjectileCollisions([p], [q], 0);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toEqual({ projectileId: 1, quantId: 2, damage: 10 });
  });

  it('should mutate projectile.life = 0 after a hit', () => {
    const p = makeProjectile({ id: 1, x: 505, y: 400, life: 300 });
    const q = makeQuant({ id: 1, x: 500, y: 395, width: 35, height: 35 });
    checkAllProjectileCollisions([p], [q], 0);
    expect(p.life).toBe(0);
  });

  it('should skip projectile already dead (life <= 0)', () => {
    const p = makeProjectile({ x: 505, y: 400, life: 0 });
    const q = makeQuant({ x: 500, y: 395, width: 35, height: 35 });
    const hits = checkAllProjectileCollisions([p], [q], 0);
    expect(hits).toHaveLength(0);
  });

  it('should skip dead quants (isDead: true)', () => {
    const p = makeProjectile({ x: 505, y: 400 });
    const q = makeQuant({ x: 500, y: 395, isDead: true });
    const hits = checkAllProjectileCollisions([p], [q], 0);
    expect(hits).toHaveLength(0);
  });

  it('should skip quants with hp <= 0', () => {
    const p = makeProjectile({ x: 505, y: 400 });
    const q = makeQuant({ x: 500, y: 395, hp: 0 });
    const hits = checkAllProjectileCollisions([p], [q], 0);
    expect(hits).toHaveLength(0);
  });

  it('should skip quants out of view to the left (quant.x < cameraX - 100)', () => {
    const cameraX = 1000;
    // quant.x = 899 < 1000 - 100 = 900 → skip
    const p = makeProjectile({ x: 899, y: 400 });
    const q = makeQuant({ x: 899, y: 395, width: 35, height: 35 });
    const hits = checkAllProjectileCollisions([p], [q], cameraX);
    expect(hits).toHaveLength(0);
  });

  it('should skip quants out of view to the right (quant.x > cameraX + 1400)', () => {
    const cameraX = 0;
    // quant.x = 1401 > 0 + 1400 = 1400 → skip
    const p = makeProjectile({ x: 1401, y: 400 });
    const q = makeQuant({ x: 1401, y: 395, width: 35, height: 35 });
    const hits = checkAllProjectileCollisions([p], [q], cameraX);
    expect(hits).toHaveLength(0);
  });

  it('should include quants exactly at the right edge of view (quant.x === cameraX + 1400)', () => {
    const cameraX = 0;
    // quant.x = 1400 which is NOT > 1400, so NOT skipped
    const p = makeProjectile({ x: 1400, y: 400, width: 8, height: 4 });
    const q = makeQuant({ x: 1400, y: 395, width: 35, height: 35 });
    const hits = checkAllProjectileCollisions([p], [q], cameraX);
    // Projectile at 1400, quant at 1400 → 1400 < 1435 && 1408 > 1400 → overlap in X
    // y: 400 < 430 && 404 > 395 → overlap in Y
    expect(hits).toHaveLength(1);
  });

  it('should hit only first matching quant per projectile (break after first hit)', () => {
    // Two quants at overlapping positions
    const p = makeProjectile({ id: 1, x: 505, y: 400, width: 8, height: 4 });
    const q1 = makeQuant({ id: 10, x: 500, y: 395, width: 35, height: 35 });
    const q2 = makeQuant({ id: 20, x: 500, y: 395, width: 35, height: 35 });
    const hits = checkAllProjectileCollisions([p], [q1, q2], 0);
    expect(hits).toHaveLength(1);
    expect(hits[0].quantId).toBe(10); // first quant wins
  });

  it('should handle multiple projectiles hitting multiple quants', () => {
    // Two projectiles, each hitting a different quant
    const p1 = makeProjectile({ id: 1, x: 505, y: 400, width: 8, height: 4, damage: 10 });
    const p2 = makeProjectile({ id: 2, x: 705, y: 400, width: 8, height: 4, damage: 15 });
    const q1 = makeQuant({ id: 10, x: 500, y: 395, width: 35, height: 35 });
    const q2 = makeQuant({ id: 20, x: 700, y: 395, width: 35, height: 35 });
    const hits = checkAllProjectileCollisions([p1, p2], [q1, q2], 0);
    expect(hits).toHaveLength(2);
    expect(hits).toContainEqual({ projectileId: 1, quantId: 10, damage: 10 });
    expect(hits).toContainEqual({ projectileId: 2, quantId: 20, damage: 15 });
  });

  it('should not record hit for projectile that misses all quants', () => {
    const p = makeProjectile({ x: 1000, y: 400 }); // far from quant
    const q = makeQuant({ x: 200, y: 395 });
    const hits = checkAllProjectileCollisions([p], [q], 0);
    expect(hits).toHaveLength(0);
  });

  it('should correctly handle a mix of hitting and missing projectiles', () => {
    const hitting = makeProjectile({ id: 1, x: 505, y: 400, width: 8, height: 4 });
    const missing = makeProjectile({ id: 2, x: 1000, y: 400, width: 8, height: 4 });
    const q = makeQuant({ id: 10, x: 500, y: 395, width: 35, height: 35 });
    const hits = checkAllProjectileCollisions([hitting, missing], [q], 0);
    expect(hits).toHaveLength(1);
    expect(hits[0].projectileId).toBe(1);
    expect(hitting.life).toBe(0);   // consumed
    expect(missing.life).toBe(300); // untouched
  });
});
