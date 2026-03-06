import type { Projectile } from '../types/game';

/**
 * Draw all projectiles on the canvas with category-specific visual styles
 * @param ctx Canvas rendering context
 * @param projectiles Array of projectiles to render
 * @param cameraX Current camera X position (for world-to-screen conversion)
 * @param time Current animation time (for time-based effects)
 */
export const drawProjectiles = (
  ctx: CanvasRenderingContext2D,
  projectiles: Projectile[],
  cameraX: number,
  time: number
): void => {
  projectiles.forEach((projectile) => {
    const screenX = projectile.x - cameraX;

    if (screenX < -100 || screenX > 1400) {
      return;
    }

    const alpha = Math.min(1, projectile.life / 20);

    ctx.save();
    ctx.globalAlpha = alpha;

    switch (projectile.category) {
      case 'ballistic':
        drawBallisticProjectile(ctx, projectile, screenX);
        break;
      case 'fire':
        drawFireProjectile(ctx, projectile, screenX, time);
        break;
      case 'laser':
        drawLaserProjectile(ctx, projectile, screenX, time);
        break;
      case 'explosive':
        drawExplosiveProjectile(ctx, projectile, screenX);
        break;
      default:
        drawDefaultProjectile(ctx, projectile, screenX);
    }

    ctx.restore();
  });
};

/**
 * Draw ballistic projectile: small yellow dot with trailing line
 */
const drawBallisticProjectile = (
  ctx: CanvasRenderingContext2D,
  projectile: Projectile,
  screenX: number
): void => {
  const centerY = projectile.y + projectile.height / 2;

  ctx.fillStyle = projectile.color;
  ctx.beginPath();
  ctx.arc(screenX, centerY, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = projectile.color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(screenX - 8, centerY);
  ctx.lineTo(screenX, centerY);
  ctx.stroke();
};

/**
 * Draw fire projectile: radial gradient flame with glow and time-animated flicker
 */
const drawFireProjectile = (
  ctx: CanvasRenderingContext2D,
  projectile: Projectile,
  screenX: number,
  time: number
): void => {
  const centerY = projectile.y + projectile.height / 2;

  const flicker = Math.sin(time * 0.3 + projectile.id) * 1.5;
  const radius = 5 + flicker;

  const grad = ctx.createRadialGradient(screenX, centerY, 0, screenX, centerY, radius + 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, '#ff6600');
  grad.addColorStop(1, 'rgba(255,0,0,0)');

  ctx.shadowColor = '#ff4500';
  ctx.shadowBlur = 12;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(screenX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
};

/**
 * Draw laser projectile: thin bright cyan rectangle with pulsing glow
 */
const drawLaserProjectile = (
  ctx: CanvasRenderingContext2D,
  projectile: Projectile,
  screenX: number,
  time: number
): void => {
  const centerY = projectile.y + projectile.height / 2;

  const pulse = Math.sin(time * 0.2 + projectile.id) * 2;

  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 8 + pulse;
  ctx.fillStyle = '#00ffff';
  ctx.fillRect(screenX - projectile.width, centerY - 1, projectile.width, 2);

  ctx.shadowBlur = 3;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(screenX - projectile.width + 2, centerY - 0.5, projectile.width - 4, 1);
};

/**
 * Draw explosive projectile: larger sphere with spark trail
 */
const drawExplosiveProjectile = (
  ctx: CanvasRenderingContext2D,
  projectile: Projectile,
  screenX: number
): void => {
  const centerY = projectile.y + projectile.height / 2;
  const alpha = Math.min(1, projectile.life / 20);

  ctx.shadowColor = projectile.color;
  ctx.shadowBlur = 15;
  ctx.fillStyle = projectile.color;
  ctx.beginPath();
  ctx.arc(screenX, centerY, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.arc(screenX, centerY, 3, 0, Math.PI * 2);
  ctx.fill();

  const sparkOffsets = [-8, -14, -20];
  sparkOffsets.forEach((offset, i) => {
    ctx.globalAlpha = alpha * (0.6 - i * 0.15);
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(screenX + offset, centerY + (i % 2 === 0 ? 2 : -2), 2, 0, Math.PI * 2);
    ctx.fill();
  });
};

/**
 * Draw default projectile: simple circle fallback
 */
const drawDefaultProjectile = (
  ctx: CanvasRenderingContext2D,
  projectile: Projectile,
  screenX: number
): void => {
  const centerY = projectile.y + projectile.height / 2;

  ctx.fillStyle = projectile.color;
  ctx.beginPath();
  ctx.arc(screenX, centerY, 4, 0, Math.PI * 2);
  ctx.fill();
};
