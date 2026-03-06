import { useState } from 'react';
import { WEAPONS, WEAPON_CATEGORIES } from '../types/weapons';
import type { Weapon, WeaponCategory } from '../types/weapons';
import { getOwnedWeaponIds, getSelectedWeaponId, unlockWeapon, setSelectedWeapon } from '../utils/weaponManager';
import { getTotalCoins, spendCoins } from '../utils/walletManager';
import './WeaponSelector.css';

interface WeaponSelectorProps {
  onBack: () => void;
}

const WeaponSelector: React.FC<WeaponSelectorProps> = ({ onBack }) => {
  const [selectedId, setSelectedId] = useState<number | null>(getSelectedWeaponId());
  const [activeCategory, setActiveCategory] = useState<WeaponCategory | 'all'>('all');
  const [coins, setCoins] = useState<number>(getTotalCoins());
  const [ownedIds, setOwnedIds] = useState<number[]>(getOwnedWeaponIds());

  const filteredWeapons = activeCategory === 'all'
    ? WEAPONS
    : WEAPONS.filter(w => w.category === activeCategory);

  const handleBuy = async (weapon: Weapon) => {
    if (coins < weapon.price) return;
    const success = await spendCoins(weapon.price);
    if (success) {
      await unlockWeapon(weapon.id);
      await setSelectedWeapon(weapon.id);
      setOwnedIds(getOwnedWeaponIds());
      setSelectedId(weapon.id);
      setCoins(getTotalCoins());
    }
  };

  const handleEquip = async (weaponId: number) => {
    await setSelectedWeapon(weaponId);
    setSelectedId(weaponId);
  };

  const categoryColors: Record<string, string> = {
    ballistic: '#FFD700',
    fire: '#FF4500',
    laser: '#00FFFF',
    explosive: '#FF6600',
  };

  return (
    <div className="weapon-selector-container">
      <div className="weapon-selector-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>🔫 Weapons</h1>
        <div className="coins-display">🪙 {coins}</div>
      </div>

      <div className="category-filters">
        <button
          className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          🌟 All
        </button>
        {WEAPON_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            style={{ borderColor: activeCategory === cat.id ? categoryColors[cat.id] : undefined }}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      <div className="weapons-grid">
        {filteredWeapons.map(weapon => {
          const isOwned = ownedIds.includes(weapon.id);
          const isSelected = selectedId === weapon.id;
          const canAfford = coins >= weapon.price;

          return (
            <div
              key={weapon.id}
              className={`weapon-card ${isOwned ? 'owned' : ''} ${isSelected ? 'selected' : ''}`}
            >
              <div className="weapon-emoji">{weapon.emoji}</div>
              <div className="weapon-name">{weapon.name}</div>
              <div
                className="category-badge"
                style={{ backgroundColor: categoryColors[weapon.category] }}
              >
                {weapon.category}
              </div>
              <div className="weapon-damage">⚔️ {weapon.damage} dmg</div>
              {isSelected ? (
                <div className="btn-equipped">✓ Equipped</div>
              ) : isOwned ? (
                <button className="btn-equip" onClick={() => handleEquip(weapon.id)}>
                  Equip
                </button>
              ) : (
                <button
                  className={`btn-buy ${!canAfford ? 'btn-disabled' : ''}`}
                  onClick={() => handleBuy(weapon)}
                  disabled={!canAfford}
                >
                  🪙 {weapon.price}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeaponSelector;
