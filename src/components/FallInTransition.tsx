import React, { useEffect } from 'react';
import type { UniverseTheme } from '../types/universe';
import './FallInTransition.css';

interface FallInTransitionProps {
  isActive: boolean;
  universeTheme: UniverseTheme | undefined;
  onComplete: () => void;
}

const FallInTransition: React.FC<FallInTransitionProps> = ({
  isActive,
  universeTheme,
  onComplete,
}) => {
  useEffect(() => {
    if (!isActive) return;

    const timeoutId = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const primaryColor = universeTheme?.primaryColor ?? '#00ff88';
  const backgroundColor = universeTheme?.backgroundColorOverride ?? '#0a0a0f';

  return (
    <div
      className="fall-in-overlay"
      style={{
        backgroundImage: `radial-gradient(circle at center, ${primaryColor} 0%, ${backgroundColor} 100%)`,
      }}
    />
  );
};

export default FallInTransition;
