import type { Player, Obstacle, Particle, GameConfig, Level } from '../types/game';
import { getSelectedSkin } from './skinManager';

// Draw the background with gradient and stars
export const drawBackground = (
  ctx: CanvasRenderingContext2D,
  level: Level,
  cameraX: number,
  width: number,
  height: number
) => {
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, level.backgroundColor);
  gradient.addColorStop(1, level.groundColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw moving stars/particles in background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let i = 0; i < 50; i++) {
    const starX = ((i * 137 + cameraX * 0.1) % (width + 100)) - 50;
    const starY = (i * 73) % (height - 100);
    const size = (i % 3) + 1;
    ctx.beginPath();
    ctx.arc(starX, starY, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw background grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 50;
  const offsetX = -cameraX * 0.3 % gridSize;
  
  for (let x = offsetX; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

// Draw the ground
export const drawGround = (
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
  level: Level,
  cameraX: number
) => {
  const groundY = config.canvasHeight - config.groundHeight;
  
  // Main ground
  const groundGradient = ctx.createLinearGradient(0, groundY, 0, config.canvasHeight);
  groundGradient.addColorStop(0, '#2a2a4a');
  groundGradient.addColorStop(1, level.groundColor);
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, groundY, config.canvasWidth, config.groundHeight);
  
  // Ground line with glow
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(config.canvasWidth, groundY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Ground pattern
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
  ctx.lineWidth = 1;
  const patternOffset = -cameraX % 40;
  for (let x = patternOffset; x < config.canvasWidth; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, groundY + 10);
    ctx.lineTo(x, config.canvasHeight);
    ctx.stroke();
  }
};

// Draw the player (cube) with selected skin
export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  player: Player
) => {
  const skin = getSelectedSkin();
  
  ctx.save();
  
  // Translate to player center for rotation
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  ctx.translate(centerX, centerY);
  ctx.rotate((player.rotation * Math.PI) / 180);
  
  // Draw glow
  ctx.shadowColor = skin.colors.glow;
  ctx.shadowBlur = 20;
  
  // Draw cube body with skin colors
  const gradient = ctx.createLinearGradient(
    -player.width / 2,
    -player.height / 2,
    player.width / 2,
    player.height / 2
  );
  gradient.addColorStop(0, skin.colors.primary);
  gradient.addColorStop(0.5, skin.colors.secondary);
  gradient.addColorStop(1, skin.colors.accent);
  ctx.fillStyle = gradient;
  
  // Apply pattern if defined
  if (skin.pattern === 'stripes-h') {
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    ctx.fillStyle = skin.colors.secondary;
    const stripeHeight = player.height / 3;
    ctx.fillRect(-player.width / 2, -player.height / 2 + stripeHeight, player.width, stripeHeight);
  } else if (skin.pattern === 'stripes-v') {
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    ctx.fillStyle = skin.colors.secondary;
    const stripeWidth = player.width / 3;
    ctx.fillRect(-player.width / 2 + stripeWidth, -player.height / 2, stripeWidth, player.height);
  } else if (skin.pattern === 'checkerboard') {
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    ctx.fillStyle = skin.colors.secondary;
    const size = player.width / 4;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(-player.width / 2 + i * size, -player.height / 2 + j * size, size, size);
        }
      }
    }
  } else if (skin.pattern === 'dots') {
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    ctx.fillStyle = skin.colors.secondary;
    ctx.shadowBlur = 0;
    const dotSize = player.width / 8;
    ctx.beginPath();
    ctx.arc(0, 0, dotSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-player.width / 4, -player.height / 4, dotSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.width / 4, player.height / 4, dotSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
  }
  
  // Draw subtle outline
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-player.width / 2, -player.height / 2, player.width, player.height);
  
  // Draw emoji if skin has one, otherwise draw eye
  if (skin.emoji) {
    ctx.font = `${player.width * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(skin.emoji, 0, 0);
  } else {
    // Draw eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, -8, 12, 12);
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, -4, 6, 6);
  }
  
  ctx.restore();
};

// Draw a spike obstacle
const drawSpike = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  ctx.save();
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = 10;
  
  // Draw spike triangle
  const gradient = ctx.createLinearGradient(x, y + height, x, y);
  gradient.addColorStop(0, '#ff4444');
  gradient.addColorStop(0.5, '#ff6666');
  gradient.addColorStop(1, '#ff8888');
  ctx.fillStyle = gradient;
  
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  ctx.fill();
  
  // Outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();
};

// Draw a jump pad
const drawJumpPad = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  ctx.save();
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 15;
  
  const gradient = ctx.createLinearGradient(x, y + height, x, y);
  gradient.addColorStop(0, '#ff00ff');
  gradient.addColorStop(1, '#ff88ff');
  ctx.fillStyle = gradient;
  
  // Draw pad shape
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x + width * 0.1, y);
  ctx.lineTo(x + width * 0.9, y);
  ctx.lineTo(x + width, y + height);
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore();
};

// Draw a jump orb
const drawJumpOrb = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  time: number
) => {
  ctx.save();
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radius = width / 2;
  const pulse = Math.sin(time * 0.1) * 3;
  
  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur = 20 + pulse;
  
  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, radius
  );
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.3, '#ffff00');
  gradient.addColorStop(1, '#ffaa00');
  ctx.fillStyle = gradient;
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + pulse, 0, Math.PI * 2);
  ctx.fill();
  
  // Ring
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
};

// Draw a coin
const drawCoin = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  time: number,
  collected: boolean
) => {
  if (collected) return; // Don't draw collected coins
  
  ctx.save();
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radius = width / 2;
  const pulse = Math.sin(time * 0.15) * 2;
  const wobble = Math.sin(time * 0.1) * 0.2;
  
  ctx.translate(centerX, centerY);
  ctx.scale(1 + wobble * 0.1, 1);
  ctx.translate(-centerX, -centerY);
  
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 15 + pulse;
  
  // Outer circle
  const gradient = ctx.createRadialGradient(
    centerX - radius * 0.3, centerY - radius * 0.3, 0,
    centerX, centerY, radius
  );
  gradient.addColorStop(0, '#fff9c4');
  gradient.addColorStop(0.4, '#ffd700');
  gradient.addColorStop(1, '#b8860b');
  ctx.fillStyle = gradient;
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + pulse, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner circle
  ctx.strokeStyle = '#daa520';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  
  // Dollar sign or star
  ctx.fillStyle = '#b8860b';
  ctx.font = `bold ${radius}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', centerX, centerY + 1);
  
  ctx.restore();
};

// Draw all obstacles
export const drawObstacles = (
  ctx: CanvasRenderingContext2D,
  obstacles: Obstacle[],
  cameraX: number,
  canvasWidth: number,
  time: number
) => {
  for (const obstacle of obstacles) {
    const screenX = obstacle.x - cameraX;
    
    // Only draw if on screen
    if (screenX > -obstacle.width && screenX < canvasWidth + obstacle.width) {
      switch (obstacle.type) {
        case 'spike':
          drawSpike(ctx, screenX, obstacle.y, obstacle.width, obstacle.height);
          break;
        case 'jump-pad':
          drawJumpPad(ctx, screenX, obstacle.y, obstacle.width, obstacle.height);
          break;
        case 'jump-orb':
          drawJumpOrb(ctx, screenX, obstacle.y, obstacle.width, obstacle.height, time);
          break;
        case 'coin':
          drawCoin(ctx, screenX, obstacle.y, obstacle.width, obstacle.height, time, obstacle.collected ?? false);
          break;
      }
    }
  }
};

// Draw particles
export const drawParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
) => {
  for (const particle of particles) {
    ctx.save();
    ctx.globalAlpha = particle.life / particle.maxLife;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

// Draw progress bar
export const drawProgressBar = (
  ctx: CanvasRenderingContext2D,
  progress: number,
  width: number
) => {
  const barWidth = 200;
  const barHeight = 8;
  const x = (width - barWidth) / 2;
  const y = 15;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x, y, barWidth, barHeight);
  
  // Progress fill
  const gradient = ctx.createLinearGradient(x, y, x + barWidth * progress, y);
  gradient.addColorStop(0, '#00ff88');
  gradient.addColorStop(1, '#00ffcc');
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, barWidth * progress, barHeight);
  
  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, barWidth, barHeight);
  
  // Percentage text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.floor(progress * 100)}%`, width / 2, y + barHeight + 15);
};

// Draw attempt counter
export const drawAttempts = (
  ctx: CanvasRenderingContext2D,
  attempts: number
) => {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Attempt ${attempts}`, 15, 25);
};

// Draw coins collected in current run
export const drawCoins = (
  ctx: CanvasRenderingContext2D,
  coins: number,
  width: number
) => {
  ctx.save();
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'right';
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 5;
  ctx.fillText(`★ ${coins}`, width - 15, 25);
  ctx.restore();
};
