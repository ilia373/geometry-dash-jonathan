import { useRef, useEffect, useState, useCallback } from 'react';
import type { Player, Particle, GameState, GameStats, Quant, DroppedCoin } from '../types/game';
import type { CheatState } from '../types/cheats';
import { GAME_CONFIG, getCurrentLevel, resetQuantIdCounter } from '../constants/gameConfig';
import {
  createPlayer,
  updatePlayerPhysics,
  jump,
  isOnGround,
  checkAllCollisions,
  createDeathParticles,
  updateParticles,
  createTrailParticle,
  updateAllQuants,
  checkAllQuantCollisions,
  createQuantDeathParticles,
  createDroppedCoins,
  updateDroppedCoins,
  checkDroppedCoinCollision,
} from '../utils/gamePhysics';
import {
  drawBackground,
  drawGround,
  drawPlayer,
  drawObstacles,
  drawParticles,
  drawProgressBar,
  drawAttempts,
  drawCoins,
  drawQuants,
  drawDroppedCoins,
} from '../utils/gameRenderer';
import { soundManager } from '../utils/soundManager';
import { markLevelComplete } from '../utils/progressManager';
import { addCoins, getTotalCoins } from '../utils/walletManager';
import './Game.css';

interface GameProps {
  levelId: number;
  onBack: () => void;
  cheats: CheatState;
}

const Game: React.FC<GameProps> = ({ levelId, onBack, cheats }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('playing');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [stats, setStats] = useState<GameStats>({
    attempts: 1,
    progress: 0,
    bestProgress: 0,
    coinsCollected: 0,
  });
  
  // Admin panel state - now received as props
  const cheatsRef = useRef<CheatState>(cheats);
  
  // Track collected coin indices for current run
  const collectedCoinsRef = useRef<Set<number>>(new Set());
  
  // Track progress and coins with refs for real-time updates in game loop
  const progressRef = useRef<number>(0);
  const coinsCollectedRef = useRef<number>(0);
  
  // Game objects (use refs to avoid re-renders during game loop)
  const playerRef = useRef<Player>(createPlayer());
  const cameraXRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const trailFrameRef = useRef<number>(0);
  const jumpOrbActiveRef = useRef<boolean>(false);
  const clickedRef = useRef<boolean>(false);
  
  // Quant-related refs
  const quantsRef = useRef<Quant[]>([]);
  const droppedCoinsRef = useRef<DroppedCoin[]>([]);
  
  // Clone level to avoid mutating original level data
  const levelRef = useRef(JSON.parse(JSON.stringify(getCurrentLevel(levelId))));
  const level = levelRef.current;
  
  // Initialize quants from level data
  useEffect(() => {
    resetQuantIdCounter();
    quantsRef.current = JSON.parse(JSON.stringify(level.quants || []));
  }, [level]);
  
  // Keep cheatsRef in sync with props
  useEffect(() => {
    cheatsRef.current = cheats;
  }, [cheats]);
  
  // Reset all coins' collected state
  const resetCoins = useCallback(() => {
    level.obstacles.forEach((obstacle: { type: string; collected?: boolean }) => {
      if (obstacle.type === 'coin') {
        obstacle.collected = false;
      }
    });
  }, [level]);
  
  // Handle jump input
  const handleJump = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const player = playerRef.current;
    
    // Check for jump orb activation
    if (jumpOrbActiveRef.current && !isOnGround(player, GAME_CONFIG)) {
      playerRef.current = jump(player, GAME_CONFIG, GAME_CONFIG.jumpForce * 1.2);
      jumpOrbActiveRef.current = false;
      clickedRef.current = true;
      soundManager.playSound('jump');
      return;
    }
    
    // Normal ground jump
    if (isOnGround(player, GAME_CONFIG) || player.y >= GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - GAME_CONFIG.playerSize) {
      playerRef.current = jump(player, GAME_CONFIG);
      soundManager.playSound('jump');
    }
  }, [gameState]);
  
  // Reset game
  const resetGame = useCallback(() => {
    playerRef.current = createPlayer();
    cameraXRef.current = 0;
    particlesRef.current = [];
    jumpOrbActiveRef.current = false;
    clickedRef.current = false;
    collectedCoinsRef.current = new Set();
    progressRef.current = 0;
    coinsCollectedRef.current = 0;
    // Reset quants
    resetQuantIdCounter();
    quantsRef.current = JSON.parse(JSON.stringify(level.quants || []));
    droppedCoinsRef.current = [];
    resetCoins();
    setGameState('playing');
    setStats(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      progress: 0,
      coinsCollected: 0,
    }));
    soundManager.playBackgroundMusic();
  }, [resetCoins, level]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  // Start background music on component mount
  useEffect(() => {
    soundManager.playBackgroundMusic();
    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, []);
  
  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const gameLoop = () => {
      timeRef.current++;
      const activeCheat = cheatsRef.current;
      
      if (gameState === 'playing') {
        // Calculate speed modifier from cheats
        let speedMod = 1;
        if (activeCheat.speedBoost) speedMod = 2;
        if (activeCheat.slowMotion) speedMod = 0.5;
        
        // Update camera (move forward)
        cameraXRef.current += GAME_CONFIG.playerSpeed * speedMod;
        
        // Apply float cheat (disable gravity)
        if (activeCheat.float) {
          playerRef.current.vy = 0;
          playerRef.current.y = GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - GAME_CONFIG.playerSize - 50;
        }
        
        // Apply size cheats
        let sizeMultiplier = 1;
        if (activeCheat.bigPlayer) sizeMultiplier = 2;
        if (activeCheat.smallPlayer) sizeMultiplier = 0.5;
        playerRef.current.width = GAME_CONFIG.playerSize * sizeMultiplier;
        playerRef.current.height = GAME_CONFIG.playerSize * sizeMultiplier;
        
        // Update player physics
        playerRef.current = updatePlayerPhysics(
          playerRef.current,
          GAME_CONFIG
        );
        
        // Auto jump cheat
        if (activeCheat.autoJump && isOnGround(playerRef.current, GAME_CONFIG)) {
          playerRef.current = jump(playerRef.current, GAME_CONFIG);
        }
        
        // Update quants
        quantsRef.current = updateAllQuants(
          quantsRef.current,
          cameraXRef.current
        );
        
        // Update dropped coins with magnet effect toward player
        droppedCoinsRef.current = updateDroppedCoins(
          droppedCoinsRef.current,
          playerRef.current.x,
          playerRef.current.y,
          playerRef.current.width,
          playerRef.current.height
        );
        
        // Check dropped coin collection
        for (const coin of droppedCoinsRef.current) {
          if (!coin.collected && checkDroppedCoinCollision(playerRef.current, coin)) {
            coin.collected = true;
            coinsCollectedRef.current += 1;
            soundManager.playSound('coin');
          }
        }
        
        // Check quant collisions
        if (!activeCheat.invincible && !activeCheat.ghostMode) {
          const quantCollisions = checkAllQuantCollisions(
            playerRef.current,
            quantsRef.current,
            cameraXRef.current
          );
          
          for (const collision of quantCollisions) {
            if (collision.type === 'stomp' && collision.quant) {
              // Player stomped on quant - kill the quant
              collision.quant.isDead = true;
              
              // Create death particles for quant
              particlesRef.current = [
                ...particlesRef.current,
                ...createQuantDeathParticles(collision.quant, cameraXRef.current),
              ];
              
              // Drop coins from quant
              droppedCoinsRef.current = [
                ...droppedCoinsRef.current,
                ...createDroppedCoins(collision.quant, cameraXRef.current),
              ];
              
              // Bounce player up after stomp
              playerRef.current = jump(playerRef.current, GAME_CONFIG, GAME_CONFIG.jumpForce * 0.7);
              soundManager.playSound('coin'); // Reuse coin sound for stomp feedback
              
            } else if (collision.type === 'death') {
              // Player died from quant collision
              particlesRef.current = [
                ...particlesRef.current,
                ...createDeathParticles(playerRef.current),
              ];
              playerRef.current.isDead = true;
              setGameState('dead');
              soundManager.playSound('fail');
              break;
            }
          }
        }
        
        // Check collisions
        const collisions = checkAllCollisions(
          playerRef.current,
          level.obstacles,
          cameraXRef.current
        );
        
        // Reset jump orb state each frame
        jumpOrbActiveRef.current = false;
        
        for (const collision of collisions) {
          switch (collision.type) {
            case 'death':
              // Skip death if invincible or ghost mode
              if (activeCheat.invincible || activeCheat.ghostMode) {
                break;
              }
              // Player died - no coins saved
              particlesRef.current = [
                ...particlesRef.current,
                ...createDeathParticles(playerRef.current),
              ];
              playerRef.current.isDead = true;
              setGameState('dead');
              soundManager.playSound('fail');
              break;
              
            case 'coin':
              // Collect coin
              if (collision.obstacle) {
                const coinIndex = level.obstacles.indexOf(collision.obstacle);
                if (!collectedCoinsRef.current.has(coinIndex)) {
                  collectedCoinsRef.current.add(coinIndex);
                  collision.obstacle.collected = true;
                  coinsCollectedRef.current += 1;
                  soundManager.playSound('coin');
                }
              }
              break;
              
            case 'jump-pad':
              // Bounce on jump pad
              playerRef.current = jump(playerRef.current, GAME_CONFIG, GAME_CONFIG.jumpForce * 1.5);
              break;
              
            case 'jump-orb':
              // Activate jump orb (can click to jump in air)
              jumpOrbActiveRef.current = true;
              break;
          }
        }
        
        // Create trail particles
        trailFrameRef.current++;
        if (trailFrameRef.current % 3 === 0) {
          particlesRef.current.push(createTrailParticle(playerRef.current));
        }
        
        // Update progress
        progressRef.current = Math.min(cameraXRef.current / level.length, 1);
        
        // Check win condition
        if (cameraXRef.current >= level.length) {
          // Update stats for the modal display
          setStats(prev => ({
            ...prev,
            coinsCollected: coinsCollectedRef.current,
            progress: 1,
          }));
          setGameState('won');
          soundManager.playSound('success');
          soundManager.stopBackgroundMusic();
          markLevelComplete(levelId);
          // Add collected coins to wallet using ref value
          addCoins(coinsCollectedRef.current);
        }
      }
      
      // Update particles (always, even when dead)
      particlesRef.current = updateParticles(particlesRef.current);
      
      // Render
      ctx.clearRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
      
      // Draw background
      drawBackground(ctx, level, cameraXRef.current, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
      
      // Draw ground
      drawGround(ctx, GAME_CONFIG, level, cameraXRef.current);
      
      // Draw obstacles
      drawObstacles(ctx, level.obstacles, cameraXRef.current, GAME_CONFIG.canvasWidth, timeRef.current);
      
      // Draw quants
      drawQuants(ctx, quantsRef.current, cameraXRef.current, GAME_CONFIG.canvasWidth, timeRef.current);
      
      // Draw dropped coins
      drawDroppedCoins(ctx, droppedCoinsRef.current, timeRef.current);
      
      // Draw particles
      drawParticles(ctx, particlesRef.current);
      
      // Draw player (if not dead)
      if (!playerRef.current.isDead) {
        drawPlayer(ctx, playerRef.current);
      }
      
      // Draw UI
      drawProgressBar(ctx, progressRef.current, GAME_CONFIG.canvasWidth);
      drawAttempts(ctx, stats.attempts);
      drawCoins(ctx, coinsCollectedRef.current, GAME_CONFIG.canvasWidth);
      
      // Jump orb indicator
      if (jumpOrbActiveRef.current) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK TO JUMP!', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight - GAME_CONFIG.groundHeight - 50);
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(gameLoopRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, level]);
  
  // Event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (gameState === 'dead') {
          resetGame();
        } else {
          handleJump();
        }
      }
      if (e.code === 'Escape') {
        onBack();
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      // Only handle clicks on the canvas, not on overlays or buttons
      if (e.target !== canvasRef.current) return;
      
      if (gameState === 'dead') {
        resetGame();
      } else {
        handleJump();
      }
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      // Only handle touches on the canvas, not on overlays or buttons
      if (e.target !== canvasRef.current) return;
      
      e.preventDefault();
      if (gameState === 'dead') {
        resetGame();
      } else {
        handleJump();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [gameState, handleJump, resetGame, onBack]);
  
  return (
    <div className="game-container">
      <div className="top-buttons">
        <button className="top-back-button" onClick={onBack}>
          ← Menu
        </button>
        <button className="mute-button" onClick={toggleMute}>
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.canvasWidth}
        height={GAME_CONFIG.canvasHeight}
        className="game-canvas"
      />
      
      {gameState === 'dead' && (
        <div className="game-overlay">
          <div className="game-over-modal">
            <h2>💀 You Crashed!</h2>
            <p>Progress: {Math.floor(stats.progress * 100)}%</p>
            <p>Best: {Math.floor(stats.bestProgress * 100)}%</p>
            <p className="coins-lost">★ {stats.coinsCollected} coins lost!</p>
            <div className="modal-buttons">
              <button className="retry-button" onClick={(e) => { e.stopPropagation(); resetGame(); }}>
                🔄 Retry
              </button>
              <button className="back-button" onClick={(e) => { e.stopPropagation(); onBack(); }}>
                ← Menu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {gameState === 'won' && (
        <div className="game-overlay won">
          <div className="game-over-modal won">
            <h2>🎉 Level Complete!</h2>
            <p>{level.name}</p>
            <p>Attempts: {stats.attempts}</p>
            <p className="coins-earned">★ {stats.coinsCollected} coins earned!</p>
            <p className="total-coins">Total: ★ {getTotalCoins()}</p>
            <button className="back-button" onClick={onBack}>
              Back to Menu
            </button>
          </div>
        </div>
      )}
      
      <div className="game-controls-hint">
        <span>Space / Click / Tap to Jump</span>
        <span>ESC to go back</span>
      </div>
    </div>
  );
};

export default Game;
