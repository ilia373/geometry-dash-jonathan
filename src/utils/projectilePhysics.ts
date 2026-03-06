import type { Player, Projectile, Quant } from '../types/game';
import type { Weapon } from '../types/weapons';

export type ProjectileHit = {
  projectileId: number;
  quantId: number;
  damage: number;
};

export const MAX_PROJECTILES = 50;

/**
 * Create a new projectile in world-space aligned to the player's right edge.
 */
export const createProjectile = (
  player: Player,
  weapon: Weapon,
  cameraX: number,
  projectileId: number
): Projectile => {
  return {
    id: projectileId,
    x: player.x + player.width + cameraX,
    y: player.y + player.height / 2 - weapon.projectileSize.height / 2,
    vx: weapon.projectileSpeed,
    width: weapon.projectileSize.width,
    height: weapon.projectileSize.height,
    damage: weapon.damage,
    life: 300,
    category: weapon.category,
    color: weapon.projectileColor,
  };
};

/**
 * Update all projectiles, moving them and expiring when life runs out.
 */
export const updateProjectiles = (projectiles: Projectile[]): Projectile[] => {
  return projectiles
    .map((projectile) => ({
      ...projectile,
      x: projectile.x + projectile.vx,
      life: projectile.life - 1,
    }))
    .filter((projectile) => projectile.life > 0);
};

/**
 * Check AABB collision between a projectile and quant in world-space.
 */
export const checkProjectileQuantCollision = (
  projectile: Projectile,
  quant: Quant,
  cameraX: number
): boolean => {
  if (quant.isDead || quant.hp <= 0) {
    return false;
  }

  const _unusedCameraX = cameraX;
  void _unusedCameraX;

  return (
    projectile.x < quant.x + quant.width &&
    projectile.x + projectile.width > quant.x &&
    projectile.y < quant.y + quant.height &&
    projectile.y + projectile.height > quant.y
  );
};

/**
 * Check collisions for all projectiles against visible quants.
 */
export const checkAllProjectileCollisions = (
  projectiles: Projectile[],
  quants: Quant[],
  cameraX: number
): ProjectileHit[] => {
  const hits: ProjectileHit[] = [];

  for (const projectile of projectiles) {
    if (projectile.life <= 0) {
      continue;
    }

    for (const quant of quants) {
      if (quant.isDead || quant.hp <= 0) {
        continue;
      }

      if (quant.x < cameraX - 100 || quant.x > cameraX + 1400) {
        continue;
      }

      if (checkProjectileQuantCollision(projectile, quant, cameraX)) {
        hits.push({
          projectileId: projectile.id,
          quantId: quant.id,
          damage: projectile.damage,
        });

        projectile.life = 0;
        break;
      }
    }
  }

  return hits;
};
