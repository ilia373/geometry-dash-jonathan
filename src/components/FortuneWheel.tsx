import React, { useState, useCallback, useRef } from 'react';
import { SKINS } from '../types/skins';
import { addCoins } from '../utils/walletManager';
import { unlockSkin, getUnlockedSkinIds } from '../utils/skinManager';
import { soundManager } from '../utils/soundManager';
import {
  WHEEL_PORTIONS,
  getWeightedRandomPortion,
  getSpinsLeft,
  saveSpins,
  type WheelPortion,
} from '../utils/fortuneWheelManager';
import './FortuneWheel.css';

interface FortuneWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onCoinsUpdate: () => void;
  unlimitedSpins?: boolean;
}

// Get a random skin that isn't rainbow (id 98) and isn't already unlocked
const getRandomFreeSkin = (): { id: number; name: string } | null => {
  const unlockedIds = getUnlockedSkinIds();
  // Filter out rainbow (id 98) and already unlocked skins
  const availableSkins = SKINS.filter(
    skin => skin.id !== 98 && !unlockedIds.includes(skin.id)
  );
  
  if (availableSkins.length === 0) {
    return null; // All skins unlocked
  }
  
  const randomIndex = Math.floor(Math.random() * availableSkins.length);
  return { id: availableSkins[randomIndex].id, name: availableSkins[randomIndex].name };
};

const FortuneWheel: React.FC<FortuneWheelProps> = ({ 
  isOpen, 
  onClose, 
  onCoinsUpdate,
  unlimitedSpins = false 
}) => {
  // Initialize spins from localStorage synchronously (not in effect)
  const getInitialSpins = () => unlimitedSpins ? 0 : getSpinsLeft();
  
  const [spinsLeft, setSpinsLeft] = useState<number>(getInitialSpins);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [result, setResult] = useState<{ portion: WheelPortion; skinName?: string } | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const currentRotationRef = useRef<number>(0);

  // Handle spin
  const handleSpin = useCallback(async () => {
    if (isSpinning) return;
    if (!unlimitedSpins && spinsLeft <= 0) return;

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);

    // Get weighted random result
    const winningPortion = getWeightedRandomPortion();
    
    // Calculate which portion index the result is
    const portionIndex = WHEEL_PORTIONS.findIndex(p => p.id === winningPortion.id);
    
    // Each portion takes 45 degrees (360/8)
    // The pointer is at the top, so we need to calculate where to stop
    const portionAngle = 360 / 8;
    const targetAngle = portionIndex * portionAngle + portionAngle / 2;
    
    // Spin multiple full rotations plus the target angle
    // We want the pointer to land on the winning portion
    // Pointer is at top (0 degrees), wheel rotates clockwise
    // So we need to rotate (360 - targetAngle) to bring that portion to top
    const fullRotations = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const finalAngle = fullRotations * 360 + (360 - targetAngle);
    
    const newRotation = currentRotationRef.current + finalAngle;
    currentRotationRef.current = newRotation;
    setRotation(newRotation);

    // Wait for spin animation
    setTimeout(async () => {
      let skinResult: { id: number; name: string } | null = null;
      
      // Apply reward
      if (winningPortion.reward.type === 'coins' && winningPortion.reward.amount) {
        await addCoins(winningPortion.reward.amount);
        // Play coin sound multiple times for big wins
        const coinSoundCount = Math.min(5, Math.ceil(winningPortion.reward.amount / 50));
        for (let i = 0; i < coinSoundCount; i++) {
          setTimeout(() => soundManager.playSound('coin'), i * 100);
        }
        onCoinsUpdate();
      } else if (winningPortion.reward.type === 'skin') {
        skinResult = getRandomFreeSkin();
        if (skinResult) {
          await unlockSkin(skinResult.id);
          soundManager.playSound('success');
        } else {
          // All skins unlocked, give coins instead
          await addCoins(200);
          soundManager.playSound('coin');
          onCoinsUpdate();
        }
      }

      setResult({ portion: winningPortion, skinName: skinResult?.name });
      setShowResult(true);
      setIsSpinning(false);

      // Update spins
      if (!unlimitedSpins) {
        const newSpins = spinsLeft - 1;
        setSpinsLeft(newSpins);
        saveSpins(newSpins);
      }
    }, 4000); // Match CSS animation duration
  }, [isSpinning, spinsLeft, unlimitedSpins, onCoinsUpdate]);

  if (!isOpen) return null;

  return (
    <div className="fortune-wheel-overlay">
      <div className="fortune-wheel-modal">
        {/* Close button */}
        <button className="fortune-wheel-close" onClick={onClose}>
          ✕
        </button>

        {/* Title */}
        <h2 className="fortune-wheel-title">
          <span className="title-emoji">🎰</span>
          Fortune Wheel
          <span className="title-emoji">🎰</span>
        </h2>

        {/* Wheel container */}
        <div className="wheel-container">
          {/* Pointer */}
          <div className="wheel-pointer">▼</div>
          
          {/* Wheel */}
          <div 
            ref={wheelRef}
            className={`wheel ${isSpinning ? 'spinning' : ''}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {WHEEL_PORTIONS.map((portion, index) => {
              const angle = (360 / 8) * index;
              const displayLabel = portion.reward.type === 'coins' 
                ? `${portion.reward.amount}` 
                : 'FREE';
              const bonusType = portion.reward.type === 'coins' ? 'coins' : 'SKIN';
              return (
                <div
                  key={portion.id}
                  className="wheel-portion"
                  style={{
                    '--portion-color': portion.color,
                    '--rotation': `${angle}deg`,
                  } as React.CSSProperties}
                >
                  <div className="portion-content">
                    <span className="portion-emoji">{portion.emoji}</span>
                    <span className="portion-label">{displayLabel}</span>
                    <span className="portion-bonus-type">{bonusType}</span>
                  </div>
                </div>
              );
            })}
            {/* Center circle */}
            <div className="wheel-center">
              <span>🎡</span>
            </div>
          </div>

          {/* Decorative lights */}
          <div className="wheel-lights">
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={i} 
                className="light"
                style={{ 
                  '--light-angle': `${(360 / 16) * i}deg`,
                  animationDelay: `${i * 0.1}s`
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* Result display */}
        {showResult && result && (
          <div className="result-display">
            <div className="result-content">
              <span className="result-emoji">{result.portion.emoji}</span>
              <span className="result-text">
                {result.portion.reward.type === 'coins' 
                  ? `You won ${result.portion.reward.amount} coins!`
                  : result.skinName 
                    ? `You unlocked: ${result.skinName}!`
                    : 'All skins unlocked! +200 coins!'
                }
              </span>
            </div>
          </div>
        )}

        {/* Spin button */}
        <button 
          className={`spin-button ${isSpinning || (!unlimitedSpins && spinsLeft <= 0) ? 'disabled' : ''}`}
          onClick={handleSpin}
          disabled={isSpinning || (!unlimitedSpins && spinsLeft <= 0)}
        >
          <span className="spin-icon">🎲</span>
          <span className="spin-text">
            {isSpinning ? 'Spinning...' : 'SPIN'}
          </span>
          <span className="spins-left">
            {unlimitedSpins ? '∞' : spinsLeft} spins left
          </span>
        </button>
      </div>
    </div>
  );
};

export default FortuneWheel;
