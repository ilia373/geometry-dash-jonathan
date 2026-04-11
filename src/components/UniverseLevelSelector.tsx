import { useState, useEffect, useCallback } from 'react';
import { LEVELS } from '../constants/gameConfig';
import { getUniverseById } from '../constants/universeConfig';
import { isLevelUnlocked, isLevelCompleted } from '../utils/progressManager';
import { isAdmin, getCurrentUser, onAuthChange, logOut, getDisplayName, isGuest } from '../utils/authService';
import { getSelectedWeapon } from '../utils/weaponManager';
import type { AuthUser } from '../utils/authService';
import { getTotalCoins } from '../utils/walletManager';
import { getUnlockAllLevels, setUnlockAllLevels } from '../utils/adminOverrides';
import AuthModal from './AuthModal';
import AdminPanel from './AdminPanel';
import type { CheatState } from '../types/cheats';
import { defaultCheatState } from '../types/cheats';
import './UniverseLevelSelector.css';

interface UniverseLevelSelectorProps {
  universeId: string;
  onStartGame: (levelId: number, cheats: CheatState) => void;
  onBack: () => void;
  onOpenShop: () => void;
}

const UniverseLevelSelector: React.FC<UniverseLevelSelectorProps> = ({
  universeId,
  onStartGame,
  onBack,
  onOpenShop,
}) => {
  const universe = getUniverseById(universeId);
  const universeLevels = universe
    ? LEVELS.filter(l => universe.levelIds.includes(l.id))
    : [];

  const [selectedLevel, setSelectedLevel] = useState<number>(
    universeLevels.find(l => isLevelUnlocked(l.id))?.id ?? (universeLevels[0]?.id ?? 1)
  );
  const [cheats, setCheats] = useState<CheatState>(defaultCheatState);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWeaponWarning, setShowWeaponWarning] = useState<boolean>(false);
  const [coins, setCoins] = useState<number>(getTotalCoins());
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  const [, setRefreshKey] = useState<number>(0);
  const [unlockAllActive, setUnlockAllActive] = useState(getUnlockAllLevels());

  const userIsAdmin = isAdmin();

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setCoins(getTotalCoins());
      setRefreshKey(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const handleLevelSelect = (levelId: number) => {
    if (unlockAllActive || isLevelUnlocked(levelId)) {
      setSelectedLevel(levelId);
    }
  };

  const handleStartGame = () => {
    if (!unlockAllActive && !isLevelUnlocked(selectedLevel)) return;
    const levelData = LEVELS.find(l => l.id === selectedLevel);
    if (levelData?.levelType === 'boss' && getSelectedWeapon() === null) {
      setShowWeaponWarning(true);
      return;
    }
    setShowWeaponWarning(false);
    onStartGame(selectedLevel, cheats);
  };

  const handleToggleCheat = (cheat: keyof CheatState) => {
    setCheats(prev => ({ ...prev, [cheat]: !prev[cheat] }));
  };

  const handleResetCheats = () => {
    setCheats(defaultCheatState);
  };

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

  const handleToggleUnlockAll = useCallback(() => {
    const next = !unlockAllActive;
    setUnlockAllLevels(next);
    setUnlockAllActive(next);
    setRefreshKey(prev => prev + 1);
  }, [unlockAllActive]);

  if (!universe) {
    return null;
  }

  const theme = universe.theme;
  const selectedLevelData = LEVELS.find(l => l.id === selectedLevel);
  const canPlay = unlockAllActive || isLevelUnlocked(selectedLevel);

  return (
    <div
      className="universe-level-selector"
      style={{
        '--universe-primary': theme.primaryColor,
        '--universe-secondary': theme.secondaryColor,
        '--universe-glow': theme.glowColor,
        '--universe-accent': theme.accentColor,
        '--universe-bg': theme.backgroundColorOverride,
      } as React.CSSProperties}
    >
      <div className="universe-bg-overlay" />

      <div className="universe-top-bar">
        <button type="button" className="back-button" onClick={onBack}>
          <span>←</span>
          <span>Map</span>
        </button>

        <div className="top-bar-right">
          {!isGuest() && (
            <div className="coin-display">
              <div className="coin-icon">
                <span>🪙</span>
              </div>
              <span className="coin-amount">{coins.toLocaleString()}</span>
            </div>
          )}

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

      <div className="universe-main-content">
        <div className="universe-header">
          <span className="universe-emoji-large">{universe.emoji}</span>
          <h1 className="universe-title">{universe.name}</h1>
          <p className="universe-subtitle">Choose your planet</p>
        </div>

        <div className="planet-level-cards">
          {universeLevels.map(level => {
            const unlocked = unlockAllActive || isLevelUnlocked(level.id);
            const completed = isLevelCompleted(level.id);
            const isSelected = selectedLevel === level.id;

            return (
              <button
                key={level.id}
                type="button"
                className={`planet-card ${isSelected ? 'selected' : ''} ${!unlocked ? 'locked' : ''} ${completed ? 'completed' : ''}`}
                onClick={() => handleLevelSelect(level.id)}
                disabled={!unlocked}
              >
                <div className="planet-card-glow" />

                <div className="planet-card-content">
                  <div className="level-badge">
                    {completed ? (
                      <span className="badge-icon completed">✓</span>
                    ) : !unlocked ? (
                      <span className="badge-icon locked">🔒</span>
                    ) : (
                      <span className="badge-number">{level.id}</span>
                    )}
                  </div>

                  <div className="level-info">
                    <span className="planet-name">
                      🪐 {level.planetName ?? level.name}
                    </span>
                    <span className="level-name-sub">{level.name}</span>
                    <div className="difficulty-bar">
                      {([1, 2, 3, 4, 5] as const).map((dotNum) => (
                        <div
                          key={`dot-${level.id}-${dotNum}`}
                          className={`difficulty-dot ${dotNum <= level.id ? 'active' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {isSelected && <div className="selection-ring" />}
              </button>
            );
          })}
        </div>

        {showWeaponWarning && (
          <div className="weapon-warning">
            ⚔️ A weapon is required to fight the boss! Visit the Shop to equip one.
          </div>
        )}

        <button
          type="button"
          className={`universe-play-button ${!canPlay ? 'disabled' : ''}`}
          onClick={handleStartGame}
          disabled={!canPlay}
        >
          <div className="play-bg" />
          <div className="play-content">
            <span className="play-icon">▶</span>
            <span className="play-text">
              PLAY {selectedLevelData?.planetName?.toUpperCase() ?? selectedLevelData?.name?.toUpperCase()}
            </span>
          </div>
          <div className="play-shine" />
        </button>
      </div>

      {userIsAdmin && (
        <AdminPanel
          cheats={cheats}
          onToggleCheat={handleToggleCheat}
          onReset={handleResetCheats}
          isVisible={showAdminPanel}
          onToggleVisibility={() => setShowAdminPanel(!showAdminPanel)}
          onOpenFortuneWheel={() => {}}
          unlockAllActive={unlockAllActive}
          onToggleUnlockAll={handleToggleUnlockAll}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default UniverseLevelSelector;
