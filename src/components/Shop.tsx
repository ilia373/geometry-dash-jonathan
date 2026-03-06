import { useState } from 'react';
import SkinSelector from './SkinSelector';
import WeaponSelector from './WeaponSelector';
import './Shop.css';

interface ShopProps {
  onBack: () => void;
}

const Shop: React.FC<ShopProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'skins' | 'weapons'>('skins');

  return (
    <div className="shop-container">
      <div className="shop-tabs">
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
      </div>
      <div className="shop-content">
        {activeTab === 'skins' ? (
          <SkinSelector onBack={onBack} />
        ) : (
          <WeaponSelector onBack={onBack} />
        )}
      </div>
    </div>
  );
};

export default Shop;
