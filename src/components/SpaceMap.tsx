import { useState, useEffect, useCallback } from 'react';
import { UNIVERSES, UNIVERSE_CONNECTIONS } from '../constants/universeConfig';
import { isUniverseUnlocked, getUniverseCompletion, syncUniversesFromCloud } from '../utils/universeManager';
import { getTotalCoins, syncWalletFromCloud } from '../utils/walletManager';
import { syncSkinsFromCloud } from '../utils/skinManager';
import { syncProgressFromCloud } from '../utils/progressManager';
import {
  getCurrentUser,
  onAuthChange,
  isAdmin,
  logOut,
  getDisplayName,
  isGuest,
} from '../utils/authService';
import type { AuthUser } from '../utils/authService';
import type { CheatState } from '../types/cheats';
import { defaultCheatState } from '../types/cheats';
import AuthModal from './AuthModal';
import AdminPanel from './AdminPanel';
import FortuneWheel from './FortuneWheel';
import {
  shouldShowWheel,
  initializeWheelForNewUser,
} from '../utils/fortuneWheelManager';
import './SpaceMap.css';

interface SpaceMapProps {
  onSelectUniverse: (id: string) => void;
  onOpenShop: () => void;
}

const WORLD_WIDTH = 1800;
const WORLD_HEIGHT = 1000;
const PAN_CLAMP_X = 600;
const PAN_CLAMP_Y = 400;

const SpaceMap: React.FC<SpaceMapProps> = ({ onSelectUniverse, onOpenShop }) => {
  const [coins, setCoins] = useState<number>(getTotalCoins());
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  const [, setRefreshKey] = useState<number>(0);

  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panAtDragStart, setPanAtDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const [cheats, setCheats] = useState<CheatState>(defaultCheatState);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const userIsAdmin = isAdmin();

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [showFortuneWheel, setShowFortuneWheel] = useState(false);
  const [unlimitedSpins, setUnlimitedSpins] = useState(false);

  useEffect(() => {
    const syncData = async () => {
      await syncWalletFromCloud();
      await syncProgressFromCloud();
      await syncSkinsFromCloud();
      await syncUniversesFromCloud();
      setCoins(getTotalCoins());
      setRefreshKey(prev => prev + 1);
    };
    syncData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    initializeWheelForNewUser();
    if (shouldShowWheel()) {
      const timer = setTimeout(() => {
        setShowFortuneWheel(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const syncData = async () => {
      await syncWalletFromCloud();
      await syncProgressFromCloud();
      await syncSkinsFromCloud();
      await syncUniversesFromCloud();
      setCoins(getTotalCoins());
      setRefreshKey(prev => prev + 1);
    };
    syncData();
  }, [user]);

  const handleCoinsUpdate = useCallback(() => {
    setCoins(getTotalCoins());
  }, []);

  const handleOpenFortuneWheelAdmin = useCallback(() => {
    setUnlimitedSpins(true);
    setShowFortuneWheel(true);
  }, []);

  const handleCloseFortuneWheel = useCallback(() => {
    setShowFortuneWheel(false);
    setUnlimitedSpins(false);
    setCoins(getTotalCoins());
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleToggleCheat = (cheat: keyof CheatState) => {
    setCheats(prev => ({ ...prev, [cheat]: !prev[cheat] }));
  };

  const handleResetCheats = () => {
    setCheats(defaultCheatState);
  };

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.universe-node, .space-map-top-bar')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanAtDragStart({ ...panOffset });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPanOffset({
      x: clamp(panAtDragStart.x + dx, -PAN_CLAMP_X, PAN_CLAMP_X),
      y: clamp(panAtDragStart.y + dy, -PAN_CLAMP_Y, PAN_CLAMP_Y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.universe-node, .space-map-top-bar')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setPanAtDragStart({ ...panOffset });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.x;
    const dy = touch.clientY - dragStart.y;
    setPanOffset({
      x: clamp(panAtDragStart.x + dx, -PAN_CLAMP_X, PAN_CLAMP_X),
      y: clamp(panAtDragStart.y + dy, -PAN_CLAMP_Y, PAN_CLAMP_Y),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleUniverseClick = (universeId: string, comingSoon: boolean) => {
    if (comingSoon || isTransitioning) return;
    if (!isUniverseUnlocked(universeId)) return;
    setIsTransitioning(true);
    onSelectUniverse(universeId);
  };

  const getWorldCoords = (x: number, y: number) => ({
    wx: (x / 100) * WORLD_WIDTH,
    wy: (y / 100) * WORLD_HEIGHT,
  });

  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: `star-${i}`,
    left: `${(i * 37 + 13) % 100}%`,
    top: `${(i * 53 + 7) % 100}%`,
    delay: `${(i * 0.31) % 4}s`,
    duration: `${2 + (i % 3)}s`,
    size: i % 5 === 0 ? '3px' : '2px',
    opacity: 0.4 + (i % 5) * 0.1,
  }));

  return (
    <div
      className={`space-map-container ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
            animationDuration: star.duration,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}

      <div className="space-map-top-bar">
        <div className="coin-display">
          <div className="coin-icon">
            <span>★</span>
          </div>
          <span className="coin-amount">{coins.toLocaleString()}</span>
        </div>

        <div className="top-bar-right">
          {user ? (
            <div className="user-section">
              <span className={`user-info ${isAdmin() ? 'is-admin' : ''}`}>
                {isAdmin() && <span className="admin-crown">👑</span>}
                {isGuest() && <span className="guest-icon">👤</span>}
                <span className="user-name">{getDisplayName()}</span>
              </span>
              <button type="button" className="logout-button" onClick={handleLogout}>
                <span className="btn-icon">🚪</span>
                <span className="btn-text">Logout</span>
                <div className="btn-shine" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="login-button"
              onClick={() => setShowAuthModal(true)}
            >
              <span className="btn-icon">🔐</span>
              <span className="btn-text">Login</span>
              <div className="btn-shine" />
            </button>
          )}

          <button type="button" className="shop-button" onClick={onOpenShop}>
            <span className="btn-icon">🛒</span>
            <span className="btn-text">Shop</span>
            <div className="btn-shine" />
          </button>
        </div>
      </div>

      <div
        className="space-map-world"
        style={{ transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px))` }}
      >
        <svg
          className="connection-svg"
          viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Universe connection paths"
        >
          <defs>
            {UNIVERSE_CONNECTIONS.map((conn) => {
              const fromUniverse = UNIVERSES.find(u => u.id === conn.from);
              const toUniverse = UNIVERSES.find(u => u.id === conn.to);
              if (!fromUniverse || !toUniverse) return null;
              const gradId = `conn-grad-${conn.from}-${conn.to}`;
              return (
                <linearGradient
                  key={gradId}
                  id={gradId}
                  gradientUnits="userSpaceOnUse"
                  x1={getWorldCoords(fromUniverse.position.x, fromUniverse.position.y).wx}
                  y1={getWorldCoords(fromUniverse.position.x, fromUniverse.position.y).wy}
                  x2={getWorldCoords(toUniverse.position.x, toUniverse.position.y).wx}
                  y2={getWorldCoords(toUniverse.position.x, toUniverse.position.y).wy}
                >
                  <stop offset="0%" stopColor={fromUniverse.theme.primaryColor} stopOpacity="0.7" />
                  <stop offset="100%" stopColor={toUniverse.theme.primaryColor} stopOpacity="0.7" />
                </linearGradient>
              );
            })}
          </defs>

          {UNIVERSE_CONNECTIONS.map((conn) => {
            const fromUniverse = UNIVERSES.find(u => u.id === conn.from);
            const toUniverse = UNIVERSES.find(u => u.id === conn.to);
            if (!fromUniverse || !toUniverse) return null;
            const from = getWorldCoords(fromUniverse.position.x, fromUniverse.position.y);
            const to = getWorldCoords(toUniverse.position.x, toUniverse.position.y);
            const lineKey = `conn-${conn.from}-${conn.to}`;
            const gradId = `conn-grad-${conn.from}-${conn.to}`;
            return (
              <g key={lineKey}>
                <line
                  x1={from.wx} y1={from.wy}
                  x2={to.wx} y2={to.wy}
                  stroke={`url(#${gradId})`}
                  strokeWidth="6"
                  strokeOpacity="0.2"
                  strokeLinecap="round"
                />
                <line
                  x1={from.wx} y1={from.wy}
                  x2={to.wx} y2={to.wy}
                  stroke={`url(#${gradId})`}
                  strokeWidth="2"
                  strokeOpacity="0.8"
                  strokeLinecap="round"
                  strokeDasharray="8 4"
                />
              </g>
            );
          })}
        </svg>

        {UNIVERSES.map(universe => {
          const unlocked = isUniverseUnlocked(universe.id);
          const completion = getUniverseCompletion(universe.id);
          const isCompleted = completion.total > 0 && completion.completed === completion.total;

          return (
            <button
              key={universe.id}
              type="button"
              className={`universe-node ${unlocked ? 'unlocked' : 'locked'} ${universe.comingSoon ? 'coming-soon' : ''} ${isCompleted ? 'completed' : ''}`}
              style={{
                left: `${universe.position.x}%`,
                top: `${universe.position.y}%`,
                '--node-primary': universe.theme.primaryColor,
                '--node-glow': universe.theme.glowColor,
                '--node-secondary': universe.theme.secondaryColor,
              } as React.CSSProperties}
              onClick={() => handleUniverseClick(universe.id, universe.comingSoon)}
              aria-label={universe.comingSoon ? `${universe.name} — Coming Soon` : universe.name}
              disabled={universe.comingSoon}
            >
              {unlocked && !universe.comingSoon && (
                <div className="node-glow-ring" />
              )}

              <div className="node-content">
                <span className="node-emoji">{universe.emoji}</span>
                <span className="node-name">{universe.name}</span>
                {universe.comingSoon ? (
                  <span className="node-badge coming-soon-badge">Coming Soon</span>
                ) : isCompleted ? (
                  <span className="node-badge completed-badge">✓ Complete</span>
                ) : completion.total > 0 ? (
                  <span className="node-badge progress-badge">{completion.completed}/{completion.total}</span>
                ) : null}
              </div>

              {universe.comingSoon && (
                <div className="node-lock-overlay">
                  <span className="lock-icon">🔒</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {userIsAdmin && (
        <AdminPanel
          cheats={cheats}
          onToggleCheat={handleToggleCheat}
          onReset={handleResetCheats}
          isVisible={showAdminPanel}
          onToggleVisibility={() => setShowAdminPanel(!showAdminPanel)}
          onOpenFortuneWheel={handleOpenFortuneWheelAdmin}
        />
      )}

      <FortuneWheel
        isOpen={showFortuneWheel}
        onClose={handleCloseFortuneWheel}
        onCoinsUpdate={handleCoinsUpdate}
        unlimitedSpins={unlimitedSpins}
      />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default SpaceMap;
