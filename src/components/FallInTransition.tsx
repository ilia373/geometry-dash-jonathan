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
      style={{ backgroundColor }}
    >
      <div
        className="fall-in-ring"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
        }}
      />
      <div
        className="fall-in-ring-inner"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 60%)`,
        }}
      />
      <div className="fall-in-lines" />
      <div
        className="fall-in-flash"
        style={{ background: primaryColor }}
      />
      <div className="fall-in-whiteout" />
    </div>
  );
};

export default FallInTransition;
