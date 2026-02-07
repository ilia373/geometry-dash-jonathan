import React, { useState, useCallback, useRef } from 'react';
import { SKINS } from '../types/skins';
import { addCoins } from '../utils/walletManager';
import { unlockSkin, getUnlockedSkinIds, syncSkinsFromCloud } from '../utils/skinManager';
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
// Now async to ensure skin cache is synced from cloud for authenticated users
const getRandomFreeSkin = async (): Promise<{ id: number; name: string } | null> => {
  // Ensure skin cache is synced from cloud before checking available skins
  await syncSkinsFromCloud();
  
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
    
    // Each portion takes (360 / number of portions) degrees
    const portionAngle = 360 / WHEEL_PORTIONS.length;
    
    // Calculate the angle where the center of the winning portion is located
    // Portions are laid out starting from 0° (top-right), going clockwise
    const portionCenterAngle = portionIndex * portionAngle + portionAngle / 2;
    
    // The pointer is at the top (0°/360°). To align a portion's center with the pointer,
    // we need to rotate the wheel so that portion moves to the top.
    // Since CSS rotation is clockwise, we rotate by (360 - portionCenterAngle) to bring
    // that portion to the top position.
    const targetRotation = 360 - portionCenterAngle;
    
    // Calculate how many full rotations we've already done
    const currentFullRotations = Math.floor(currentRotationRef.current / 360);
    
    // Add 5-7 more full rotations for visual effect
    const additionalRotations = 5 + Math.floor(Math.random() * 3);
    const totalFullRotations = currentFullRotations + additionalRotations + 1;
    
    // Final rotation: full rotations + target angle to land on winning portion
    const newRotation = totalFullRotations * 360 + targetRotation;
    
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
        skinResult = await getRandomFreeSkin();
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
              const angle = (360 / WHEEL_PORTIONS.length) * index;
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
