import type { Player, Obstacle, GameConfig, Particle } from '../types/game';
import { GAME_CONFIG } from '../constants/gameConfig';
import { getSelectedSkin } from './skinManager';

// Initialize player at starting position
export const createPlayer = (): Player => ({
  x: 100,
  y: GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - GAME_CONFIG.playerSize,
  width: GAME_CONFIG.playerSize,
  height: GAME_CONFIG.playerSize,
  vy: 0,
  rotation: 0,
  isJumping: false,
  isDead: false,
});

// Apply physics to player
export const updatePlayerPhysics = (
  player: Player,
  config: GameConfig
): Player => {
  let newVy = player.vy + config.gravity;
  let newY = player.y + newVy;
  let newRotation = player.rotation;
  let isJumping = player.isJumping;

  // Ground collision
  const groundY = config.canvasHeight - config.groundHeight - config.playerSize;
  if (newY >= groundY) {
    newY = groundY;
    newVy = 0;
    isJumping = false;
    // Snap rotation to nearest 90 degrees when landing
    newRotation = Math.round(newRotation / 90) * 90;
  } else {
    // Rotate while in air
    newRotation += 5;
  }

  // Ceiling collision
  if (newY < 0) {
    newY = 0;
    newVy = 0;
  }

  return {
    ...player,
    y: newY,
    vy: newVy,
    rotation: newRotation,
    isJumping,
  };
};

// Make player jump
export const jump = (player: Player, config: GameConfig, force?: number): Player => {
  const jumpForce = force ?? config.jumpForce;
  return {
    ...player,
    vy: jumpForce,
    isJumping: true,
  };
};

// Check if player is on ground
export const isOnGround = (player: Player, config: GameConfig): boolean => {
  return player.y >= config.canvasHeight - config.groundHeight - config.playerSize;
};

// Collision detection types
type CollisionType = 'death' | 'jump-pad' | 'jump-orb' | 'coin' | null;

interface CollisionResult {
  type: CollisionType;
  obstacle: Obstacle | null;
}

// Check collision between player and obstacle
export const checkCollision = (
  player: Player,
  obstacle: Obstacle,
  cameraX: number
): CollisionResult => {
  const obsX = obstacle.x - cameraX;
  
  // Adjust hitboxes - more forgiving player hitbox (smaller = easier)
  const playerHitbox = {
    x: player.x + 10,
    y: player.y + 10,
    width: player.width - 20,
    height: player.height - 20,
  };

  let obstacleHitbox = {
    x: obsX,
    y: obstacle.y,
    width: obstacle.width,
    height: obstacle.height,
  };

  // Spikes have triangular hitbox (approximate with smaller rectangle)
  if (obstacle.type === 'spike') {
    obstacleHitbox = {
      x: obsX + obstacle.width * 0.25,
      y: obstacle.y + obstacle.height * 0.3,
      width: obstacle.width * 0.5,
      height: obstacle.height * 0.7,
    };
  }

  // Check AABB collision
  const colliding =
    playerHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
    playerHitbox.x + playerHitbox.width > obstacleHitbox.x &&
    playerHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
    playerHitbox.y + playerHitbox.height > obstacleHitbox.y;

  if (!colliding) {
    return { type: null, obstacle: null };
  }

  // Determine collision type based on obstacle
  switch (obstacle.type) {
    case 'spike':
      return { type: 'death', obstacle };
    case 'jump-pad':
      return { type: 'jump-pad', obstacle };
    case 'jump-orb':
      return { type: 'jump-orb', obstacle };
    case 'coin':
      // Only collect if not already collected
      if (!obstacle.collected) {
        return { type: 'coin', obstacle };
      }
      return { type: null, obstacle: null };
    default:
      return { type: null, obstacle: null };
  }
};

// Check all collisions for player
export const checkAllCollisions = (
  player: Player,
  obstacles: Obstacle[],
  cameraX: number
): CollisionResult[] => {
  const results: CollisionResult[] = [];
  
  for (const obstacle of obstacles) {
    // Only check obstacles that are on screen or near
    const obsX = obstacle.x - cameraX;
    if (obsX > -100 && obsX < GAME_CONFIG.canvasWidth + 100) {
      const result = checkCollision(player, obstacle, cameraX);
      if (result.type) {
        results.push(result);
      }
    }
  }
  
  return results;
};

// Create death particles
export const createDeathParticles = (player: Player): Particle[] => {
  const particles: Particle[] = [];
  const colors = ['#00ff88', '#00ffcc', '#ffffff', '#88ff00'];
  
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20;
    const speed = 3 + Math.random() * 5;
    particles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 60,
      maxLife: 60,
    });
  }
  
  return particles;
};

// Update particles
export const updateParticles = (particles: Particle[]): Particle[] => {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.2, // gravity
      life: p.life - 1,
      size: p.size * 0.97,
    }))
    .filter(p => p.life > 0);
};

// Create trail particles with skin color
export const createTrailParticle = (player: Player): Particle => {
  const skin = getSelectedSkin();
  return {
    x: player.x + Math.random() * 10,
    y: player.y + player.height - 5 + Math.random() * 10,
    vx: -2 - Math.random() * 2,
    vy: -0.5 + Math.random(),
    size: 3 + Math.random() * 3,
    color: skin.colors.glow,
    life: 20,
    maxLife: 20,
  };
};
