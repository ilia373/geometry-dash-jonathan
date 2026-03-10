import React, { useEffect } from 'react';
import type { UniverseTheme } from '../types/universe';
import './FallInTransition.css';

interface FallInTransitionProps {
  isActive: boolean;
  universeTheme: UniverseTheme | undefined;
  onComplete: () => void;
}

const TUNNEL_RINGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

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

  const borderColor = universeTheme?.primaryColor ?? '#ffffff';
  const whiteoutColor = universeTheme?.glowColor ?? '#1a1a2e';

  return (
    <div className="fall-in-overlay">
      <div className="fall-in-tunnel">
        {TUNNEL_RINGS.map((id) => (
          <div
            key={id}
            className="fall-in-tunnel-ring"
            style={{ borderColor: `${borderColor}33` }}
          />
        ))}
      </div>
      <div className="fall-in-stars" />
      <div className="fall-in-vignette" />
      <div className="fall-in-whiteout" style={{ background: whiteoutColor }} />
    </div>
  );
};

export default FallInTransition;
