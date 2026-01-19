import type { Player, Obstacle, GameConfig, Particle, Quant, DroppedCoin } from '../types/game';
import { GAME_CONFIG, QUANT_CONFIG } from '../constants/gameConfig';
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

// ==================== QUANT PHYSICS ====================

// Track jump timing for jumping quants
const quantJumpTimers: Map<number, number> = new Map();

// Update a single quant's physics
export const updateQuantPhysics = (
  quant: Quant,
  cameraX: number
): Quant => {
  if (quant.isDead) return quant;
  
  let newX = quant.x;
  let newY = quant.y;
  let newVy = quant.vy;
  
  switch (quant.type) {
    case 'moving': {
      // Move towards the player (left side of screen)
      // But only when on screen or close to it
      const screenX = quant.x - cameraX;
      if (screenX < GAME_CONFIG.canvasWidth + 200 && screenX > -100) {
        newX = quant.x + quant.vx; // vx is negative, moves left
      }
      break;
    }
      
    case 'jumping': {
      // Initialize jump timer if not set
      if (!quantJumpTimers.has(quant.id)) {
        quantJumpTimers.set(quant.id, 0);
      }
      
      const timer = quantJumpTimers.get(quant.id)!;
      
      // Apply gravity
      newVy = quant.vy + GAME_CONFIG.gravity * 0.7; // Slightly less gravity for quants
      newY = quant.y + newVy;
      
      // Ground collision for jumping quants
      if (newY >= quant.baseY) {
        newY = quant.baseY;
        newVy = 0;
        
        // Jump periodically
        if (timer >= QUANT_CONFIG.jumpInterval) {
          newVy = QUANT_CONFIG.jumpForce;
          quantJumpTimers.set(quant.id, 0);
        } else {
          quantJumpTimers.set(quant.id, timer + 1);
        }
      }
      break;
    }
      
    case 'static':
    default:
      // Static quants don't move
      break;
  }
  
  return {
    ...quant,
    x: newX,
    y: newY,
    vy: newVy,
  };
};

// Update all quants
export const updateAllQuants = (
  quants: Quant[],
  cameraX: number
): Quant[] => {
  return quants.map(q => updateQuantPhysics(q, cameraX));
};

// Collision result for quant interactions
export type QuantCollisionType = 'stomp' | 'death' | null;

export interface QuantCollisionResult {
  type: QuantCollisionType;
  quant: Quant | null;
}

// Check collision between player and a single quant
export const checkQuantCollision = (
  player: Player,
  quant: Quant,
  cameraX: number
): QuantCollisionResult => {
  if (quant.isDead) return { type: null, quant: null };
  
  const quantScreenX = quant.x - cameraX;
  
  // Player hitbox (forgiving)
  const playerHitbox = {
    x: player.x + 8,
    y: player.y + 8,
    width: player.width - 16,
    height: player.height - 16,
  };
  
  // Quant hitbox (smaller for easier stomping)
  const quantHitbox = {
    x: quantScreenX + 5,
    y: quant.y + 5,
    width: quant.width - 10,
    height: quant.height - 10,
  };
  
  // Check AABB collision
  const colliding =
    playerHitbox.x < quantHitbox.x + quantHitbox.width &&
    playerHitbox.x + playerHitbox.width > quantHitbox.x &&
    playerHitbox.y < quantHitbox.y + quantHitbox.height &&
    playerHitbox.y + playerHitbox.height > quantHitbox.y;
  
  if (!colliding) {
    return { type: null, quant: null };
  }
  
  // Determine if it's a stomp (player landing on top of quant)
  // Simple and generous check:
  // 1. Player's bottom half overlaps with quant's top half = stomp
  // 2. Player must be falling (vy >= 0)
  
  const playerBottom = player.y + player.height;
  const playerMidY = player.y + player.height / 2;
  const quantMidY = quant.y + quant.height / 2;
  
  // Player is falling (or at apex of jump)
  const playerFalling = player.vy >= 0;
  
  // Player is mostly above the quant (player's middle is above quant's middle)
  const playerAboveQuant = playerMidY <= quantMidY;
  
  // Extra generous: if player bottom is in upper 70% of quant, count as stomp
  const playerBottomInStompZone = playerBottom <= quant.y + quant.height * 0.7;
  
  // It's a stomp if player is falling AND (above quant center OR in stomp zone)
  const isStomping = playerFalling && (playerAboveQuant || playerBottomInStompZone);
  
  if (isStomping) {
    return { type: 'stomp', quant };
  }
  
  // Side or bottom collision = death
  return { type: 'death', quant };
};

// Check all quant collisions
export const checkAllQuantCollisions = (
  player: Player,
  quants: Quant[],
  cameraX: number
): QuantCollisionResult[] => {
  const results: QuantCollisionResult[] = [];
  
  for (const quant of quants) {
    // Only check quants that are on screen or near
    const quantScreenX = quant.x - cameraX;
    if (quantScreenX > -100 && quantScreenX < GAME_CONFIG.canvasWidth + 100) {
      const result = checkQuantCollision(player, quant, cameraX);
      if (result.type) {
        results.push(result);
      }
    }
  }
  
  return results;
};

// Create particles when a quant is killed
export const createQuantDeathParticles = (quant: Quant, cameraX: number): Particle[] => {
  const particles: Particle[] = [];
  const quantScreenX = quant.x - cameraX;
  
  for (let i = 0; i < 15; i++) {
    const angle = (Math.PI * 2 * i) / 15;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x: quantScreenX + quant.width / 2,
      y: quant.y + quant.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Slight upward bias
      size: 4 + Math.random() * 5,
      color: quant.color,
      life: 40,
      maxLife: 40,
    });
  }
  
  return particles;
};

// Create dropped coins when a quant is killed - spread in all directions like Mario!
let droppedCoinIdCounter = 0;
export const createDroppedCoins = (quant: Quant, cameraX: number): DroppedCoin[] => {
  const coins: DroppedCoin[] = [];
  const quantScreenX = quant.x - cameraX;
  const quantCenterX = quantScreenX + quant.width / 2;
  const quantCenterY = quant.y + quant.height / 2;
  
  // Ensure at least 3 coins drop for a nice effect
  const coinCount = Math.max(3, quant.coinDrop);
  
  for (let i = 0; i < coinCount; i++) {
    // Spread coins in a circular pattern like Mario
    const angle = (Math.PI * 2 * i) / coinCount - Math.PI / 2; // Start from top
    const speed = 6 + Math.random() * 4; // Random speed variation
    
    // Add some randomness to the angle for more natural spread
    const randomAngle = angle + (Math.random() - 0.5) * 0.5;
    
    coins.push({
      id: ++droppedCoinIdCounter,
      x: quantCenterX,
      y: quantCenterY,
      vx: Math.cos(randomAngle) * speed,
      vy: Math.sin(randomAngle) * speed - 5, // Extra upward boost
      collected: false,
      life: 360, // 6 seconds - more time for spread then magnet
    });
  }
  
  return coins;
};

// Update dropped coins physics with magnet effect toward player
export const updateDroppedCoins = (
  coins: DroppedCoin[],
  playerX: number,
  playerY: number,
  playerWidth: number,
  playerHeight: number
): DroppedCoin[] => {
  const groundY = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - 15;
  const playerCenterX = playerX + playerWidth / 2;
  const playerCenterY = playerY + playerHeight / 2;
  
  // Coins spread for first 60 frames (~1 second), then magnet kicks in
  const spreadDuration = 60;
  
  return coins
    .map(coin => {
      if (coin.collected) return coin;
      
      // Calculate distance to player
      const dx = playerCenterX - coin.x;
      const dy = playerCenterY - coin.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      let newVx = coin.vx;
      let newVy = coin.vy;
      let newX = coin.x;
      let newY = coin.y;
      
      // Time since coin was created (higher life = newer)
      const age = 360 - coin.life;
      const isSpreading = age < spreadDuration;
      
      if (isSpreading) {
        // Phase 1: Spreading - normal physics with gravity and bounce
        newVy += GAME_CONFIG.gravity * 0.6;
        newVx *= 0.99; // Slight air friction
        
        newX += newVx;
        newY += newVy;
        
        // Ground bounce during spread phase
        if (newY >= groundY) {
          newY = groundY;
          newVy = -newVy * 0.5; // Bouncy!
          newVx *= 0.8; // Friction on bounce
        }
        
        // Wall bounds
        if (newX < 10) {
          newX = 10;
          newVx = Math.abs(newVx) * 0.5;
        }
        if (newX > GAME_CONFIG.canvasWidth - 10) {
          newX = GAME_CONFIG.canvasWidth - 10;
          newVx = -Math.abs(newVx) * 0.5;
        }
      } else {
        // Phase 2: Magnet - coins fly toward player
        const magnetStrength = 0.3 + (age - spreadDuration) * 0.01; // Gets stronger over time
        const maxSpeed = 15;
        
        // Accelerate toward player
        newVx += (dx / Math.max(distance, 1)) * magnetStrength;
        newVy += (dy / Math.max(distance, 1)) * magnetStrength;
        
        // Limit speed
        const currentSpeed = Math.sqrt(newVx * newVx + newVy * newVy);
        if (currentSpeed > maxSpeed) {
          newVx = (newVx / currentSpeed) * maxSpeed;
          newVy = (newVy / currentSpeed) * maxSpeed;
        }
        
        newX += newVx;
        newY += newVy;
      }
      
      return {
        ...coin,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy,
        life: coin.life - 1,
      };
    })
    .filter(coin => coin.life > 0 && !coin.collected);
};

// Check collision between player and dropped coin
export const checkDroppedCoinCollision = (
  player: Player,
  coin: DroppedCoin
): boolean => {
  if (coin.collected) return false;
  
  const playerHitbox = {
    x: player.x + 5,
    y: player.y + 5,
    width: player.width - 10,
    height: player.height - 10,
  };
  
  const coinRadius = 12;
  const coinCenterX = coin.x;
  const coinCenterY = coin.y;
  
  // Simple circle-rectangle collision
  const closestX = Math.max(playerHitbox.x, Math.min(coinCenterX, playerHitbox.x + playerHitbox.width));
  const closestY = Math.max(playerHitbox.y, Math.min(coinCenterY, playerHitbox.y + playerHitbox.height));
  
  const distanceX = coinCenterX - closestX;
  const distanceY = coinCenterY - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;
  
  return distanceSquared < coinRadius * coinRadius;
};
