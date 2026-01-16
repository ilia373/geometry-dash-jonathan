import { useState, useEffect } from 'react';
import { LEVELS } from '../constants/gameConfig';
import { isLevelUnlocked, isLevelCompleted } from '../utils/progressManager';
import { getTotalCoins, syncWalletFromCloud } from '../utils/walletManager';
import { getSelectedSkin } from '../utils/skinManager';
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
import './Menu.css';

interface MenuProps {
  onStartGame: (levelId: number, cheats: CheatState) => void;
  onOpenSkins: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartGame, onOpenSkins }) => {
  const [coins, setCoins] = useState<number>(getTotalCoins());
  const currentSkin = getSelectedSkin();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  
  // Admin panel state
  const [cheats, setCheats] = useState<CheatState>(defaultCheatState);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const userIsAdmin = isAdmin();
  
  // Sync wallet from cloud on auth change
  useEffect(() => {
    const syncWallet = async () => {
      await syncWalletFromCloud();
      setCoins(getTotalCoins());
    };
    syncWallet();
  }, [user]);
  
  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
    });
    return unsubscribe;
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
  
  const handleLevelSelect = (levelId: number) => {
    if (isLevelUnlocked(levelId)) {
      setSelectedLevel(levelId);
    }
  };

  const handleStartGame = (levelId: number) => {
    if (isLevelUnlocked(levelId)) {
      onStartGame(levelId, cheats);
    }
  };
  
  // Cheat handlers
  const handleToggleCheat = (cheat: keyof CheatState) => {
    setCheats(prev => ({ ...prev, [cheat]: !prev[cheat] }));
  };
  
  const handleResetCheats = () => {
    setCheats(defaultCheatState);
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      handleStartGame(selectedLevel);
    }
    if (e.code === 'ArrowLeft') {
      const newLevel = Math.max(1, selectedLevel - 1);
      if (isLevelUnlocked(newLevel)) {
        setSelectedLevel(newLevel);
      }
    }
    if (e.code === 'ArrowRight') {
      const newLevel = Math.min(LEVELS.length, selectedLevel + 1);
      if (isLevelUnlocked(newLevel)) {
        setSelectedLevel(newLevel);
      }
    }
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const selectedLevelData = LEVELS.find(l => l.id === selectedLevel);
  
  return (
    <div className="menu-container">
      {/* Animated background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
      </div>

      {/* Grid pattern overlay */}
      <div className="grid-overlay" />

      {/* Floating geometric shapes */}
      <div className="floating-shapes">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className={`floating-shape shape-${i % 3}`}
            style={{
              left: `${(i * 23) % 100}%`,
              top: `${(i * 17) % 100}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${8 + (i % 5) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="top-bar">
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
              <button className="logout-button" onClick={handleLogout}>
                <span className="btn-icon">🚪</span>
                <span className="btn-text">Logout</span>
                <div className="btn-shine" />
              </button>
            </div>
          ) : (
            <button 
              className="login-button" 
              onClick={() => setShowAuthModal(true)}
            >
              <span className="btn-icon">🔐</span>
              <span className="btn-text">Login</span>
              <div className="btn-shine" />
            </button>
          )}
          
          <button className="skins-button" onClick={onOpenSkins}>
            <span className="btn-icon">🎨</span>
            <span className="btn-text">Skins</span>
            <div className="btn-shine" />
          </button>
        </div>
      </div>
      
      {/* Admin Panel - only for admins */}
      {userIsAdmin && (
        <AdminPanel
          cheats={cheats}
          onToggleCheat={handleToggleCheat}
          onReset={handleResetCheats}
          isVisible={showAdminPanel}
          onToggleVisibility={() => setShowAdminPanel(!showAdminPanel)}
        />
      )}
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Main content */}
      <div className="main-content">
        {/* Hero section */}
        <div className="hero-section">
          {/* Animated cube mascot */}
          <div 
            className={`hero-cube ${isHovering ? 'hovering' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              '--cube-primary': currentSkin.colors.primary,
              '--cube-secondary': currentSkin.colors.secondary,
              '--cube-glow': currentSkin.colors.glow,
            } as React.CSSProperties}
          >
            <div className="cube-face front">
              {currentSkin.emoji ? (
                <span className="cube-emoji">{currentSkin.emoji}</span>
              ) : (
                <div className="cube-eye" />
              )}
            </div>
            <div className="cube-shadow" />
          </div>

          {/* Title */}
          <div className="hero-title">
            <h1>
              <span className="title-word geometry">
                {'GEOMETRIC'.split('').map((letter, i) => (
                  <span 
                    key={i} 
                    className="letter"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
              <span className="title-word dash">
                {'DASH'.split('').map((letter, i) => (
                  <span 
                    key={i} 
                    className="letter"
                    style={{ animationDelay: `${(i + 8) * 0.05}s` }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </h1>
            <div className="subtitle-container">
              <div className="subtitle-line" />
              <p className="subtitle">SPECIAL EDITION</p>
              <div className="subtitle-line" />
            </div>
          </div>
        </div>

        {/* Level carousel */}
        <div className="level-carousel">
          <h2 className="section-title">
            <span className="title-accent">◆</span>
            Choose Your Challenge
            <span className="title-accent">◆</span>
          </h2>
          
          <div className="carousel-container">
            <div className="level-cards">
              {LEVELS.map(level => {
                const unlocked = isLevelUnlocked(level.id);
                const completed = isLevelCompleted(level.id);
                const isSelected = selectedLevel === level.id;
                
                return (
                  <div
                    key={level.id}
                    className={`level-card ${isSelected ? 'selected' : ''} ${!unlocked ? 'locked' : ''} ${completed ? 'completed' : ''}`}
                    onClick={() => handleLevelSelect(level.id)}
                    onDoubleClick={() => handleStartGame(level.id)}
                  >
                    <div className="card-glow" style={{ backgroundColor: level.groundColor }} />
                    
                    <div className="card-content">
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
                        <span className="level-name">{unlocked ? level.name : '???'}</span>
                        <div className="difficulty-bar">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`difficulty-dot ${i < level.id ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && <div className="selection-ring" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Play button */}
        <button 
          className={`play-button ${!isLevelUnlocked(selectedLevel) ? 'disabled' : ''}`}
          onClick={() => handleStartGame(selectedLevel)}
          disabled={!isLevelUnlocked(selectedLevel)}
        >
          <div className="play-bg" />
          <div className="play-content">
            <span className="play-icon">▶</span>
            <span className="play-text">
              PLAY {selectedLevelData?.name?.toUpperCase()}
            </span>
          </div>
          <div className="play-shine" />
        </button>

        {/* Controls */}
        <div className="controls-section">
          <div className="control-key">
            <kbd>SPACE</kbd>
            <span>Jump</span>
          </div>
          <div className="control-divider">•</div>
          <div className="control-key">
            <kbd>CLICK</kbd>
            <span>Jump</span>
          </div>
          <div className="control-divider">•</div>
          <div className="control-key">
            <kbd>← →</kbd>
            <span>Navigate</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Avoid the spikes • Reach the end • Become legendary</p>
      </footer>
    </div>
  );
};

export default Menu;
