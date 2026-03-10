import { useState, useEffect } from 'react';
import { SKINS, SKIN_CATEGORIES, getSkinById, type SkinCategory } from '../types/skins';
import { getSelectedSkinId, setSelectedSkin, isSkinUnlocked, unlockSkin, getSkinPrice } from '../utils/skinManager';
import { getTotalCoins, spendCoins } from '../utils/walletManager';
import { isGuest } from '../utils/authService';
import './SkinSelector.css';

interface SkinSelectorProps {
  onBack: () => void;
  onCoinsChange?: () => void;
}

const SkinSelector: React.FC<SkinSelectorProps> = ({ onCoinsChange }) => {
  const [selectedSkinId, setSelectedSkinId] = useState<number>(getSelectedSkinId());
  const [activeCategory, setActiveCategory] = useState<SkinCategory | 'all'>('all');
  const [previewRotation, setPreviewRotation] = useState<number>(0);
  const [coins, setCoins] = useState<number>(getTotalCoins());
  const [unlockedSkins, setUnlockedSkins] = useState<number[]>([]);

  // Load unlocked skins on mount
  useEffect(() => {
    const loadUnlockedSkins = () => {
      const unlocked = SKINS.filter(skin => isSkinUnlocked(skin.id)).map(s => s.id);
      setUnlockedSkins(unlocked);
    };
    loadUnlockedSkins();
  }, []);

  // Animation for preview cube
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewRotation(prev => (prev + 2) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleSelectSkin = async (skinId: number) => {
    // Only allow selecting unlocked skins
    if (!isSkinUnlocked(skinId)) return;
    
    setSelectedSkinId(skinId);
    await setSelectedSkin(skinId);
  };

  const handleBuySkin = async (skinId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isGuest()) return;
    
    const price = getSkinPrice(skinId);
    if (coins >= price && !isSkinUnlocked(skinId)) {
      const success = await spendCoins(price);
      if (success) {
        await unlockSkin(skinId);
        setCoins(getTotalCoins());
        setUnlockedSkins(prev => [...prev, skinId]);
        // Auto-select the newly purchased skin
        setSelectedSkinId(skinId);
        await setSelectedSkin(skinId);
        onCoinsChange?.();
      }
    }
  };

  const filteredSkins = activeCategory === 'all' 
    ? SKINS 
    : SKINS.filter(skin => skin.category === activeCategory);

  const currentSkin = getSkinById(selectedSkinId);

  return (
    <div className="skin-selector-container">
      {/* Preview Section */}
      <div className="skin-preview-section">
        <div className="preview-cube-container">
          <div 
            className="preview-cube"
            style={{
              background: `linear-gradient(135deg, ${currentSkin.colors.primary}, ${currentSkin.colors.secondary})`,
              boxShadow: `0 0 30px ${currentSkin.colors.glow}`,
              transform: `rotate(${previewRotation}deg)`,
            }}
          >
            <div 
              className="preview-cube-inner"
              style={{ backgroundColor: currentSkin.colors.accent }}
            />
            {currentSkin.emoji && (
              <span className="preview-emoji">{currentSkin.emoji}</span>
            )}
          </div>
        </div>
        <div className="preview-info">
          <h2>{currentSkin.name}</h2>
          <span className="preview-category">{currentSkin.category.toUpperCase()}</span>
          {currentSkin.emoji && <span className="preview-main-emoji">{currentSkin.emoji}</span>}
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button 
          className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          🌟 All
        </button>
        {SKIN_CATEGORIES.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.emoji} {category.name}
          </button>
        ))}
      </div>

      {/* Skins Grid */}
      <div className="skins-grid">
        {filteredSkins.map(skin => {
          const isUnlocked = unlockedSkins.includes(skin.id);
          const skinPrice = getSkinPrice(skin.id);
          const canAfford = coins >= skinPrice;
          
          return (
            <button
              key={skin.id}
              className={`skin-card ${selectedSkinId === skin.id ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`}
              onClick={() => handleSelectSkin(skin.id)}
              style={{
                borderColor: selectedSkinId === skin.id ? skin.colors.glow : 'transparent',
                boxShadow: selectedSkinId === skin.id ? `0 0 15px ${skin.colors.glow}` : 'none',
              }}
            >
              <div 
                className={`skin-preview-mini ${!isUnlocked ? 'skin-locked-preview' : ''}`}
                style={{
                  background: `linear-gradient(135deg, ${skin.colors.primary}, ${skin.colors.secondary})`,
                  boxShadow: `0 0 10px ${skin.colors.glow}40`,
                }}
              >
                {skin.emoji && <span className="skin-emoji">{skin.emoji}</span>}
                {!isUnlocked && <div className="lock-overlay">🔒</div>}
              </div>
              <span className="skin-name">{skin.name}</span>
              {selectedSkinId === skin.id && isUnlocked && <span className="equipped-badge">✓</span>}
              {!isUnlocked && !isGuest() && ( 
                <button 
                  className={`buy-button ${canAfford ? '' : 'disabled'}`}
                  onClick={(e) => handleBuySkin(skin.id, e)}
                  disabled={!canAfford}
                >
                  <span className="buy-coin-icon">🪙</span> {skinPrice}
                </button>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SkinSelector;
