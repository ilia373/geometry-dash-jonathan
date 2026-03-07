import { useState } from 'react';
import SkinSelector from './SkinSelector';
import WeaponSelector from './WeaponSelector';
import { getTotalCoins } from '../utils/walletManager';
import './Shop.css';

interface ShopProps {
  onBack: () => void;
}

const Shop: React.FC<ShopProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'skins' | 'weapons'>('skins');
  const [coins, setCoins] = useState<number>(getTotalCoins());

  const refreshCoins = () => {
    setCoins(getTotalCoins());
  };

  return (
    <div className="shop-container">
      <div className="shop-header">
        <button className="shop-back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="shop-tab-switcher">
          <button
            className={`shop-tab ${activeTab === 'skins' ? 'active' : ''}`}
            onClick={() => setActiveTab('skins')}
          >
            🎨 Skins
          </button>
          <button
            className={`shop-tab ${activeTab === 'weapons' ? 'active' : ''}`}
            onClick={() => setActiveTab('weapons')}
          >
            🔫 Weapons
          </button>
          <div
            className="shop-tab-indicator"
            style={{ transform: activeTab === 'weapons' ? 'translateX(100%)' : 'translateX(0)' }}
          />
        </div>
        <div className="shop-coins">
          <span className="shop-coin-icon">🪙</span>
          <span className="shop-coin-amount">{coins}</span>
        </div>
      </div>
      <div className="shop-content">
        {activeTab === 'skins' ? (
          <SkinSelector onBack={onBack} onCoinsChange={refreshCoins} />
        ) : (
          <WeaponSelector onBack={onBack} onCoinsChange={refreshCoins} />
        )}
      </div>
    </div>
  );
};

export default Shop;
