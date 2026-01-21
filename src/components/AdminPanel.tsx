import React from 'react';
import type { CheatState } from '../types/cheats';
import { cheatDescriptions, defaultCheatState } from '../types/cheats';
import './AdminPanel.css';

interface AdminPanelProps {
  cheats: CheatState;
  onToggleCheat: (cheat: keyof CheatState) => void;
  onReset: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onOpenFortuneWheel?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  cheats,
  onToggleCheat,
  onReset,
  isVisible,
  onToggleVisibility,
  onOpenFortuneWheel,
}) => {
  const cheatKeys = Object.keys(defaultCheatState) as (keyof CheatState)[];
  const activeCount = cheatKeys.filter(key => cheats[key]).length;

  return (
    <>
      {/* Toggle Button */}
      <button 
        className={`admin-toggle ${activeCount > 0 ? 'has-active' : ''}`}
        onClick={onToggleVisibility}
        title="Admin Panel (InfinityCats Only)"
      >
        👑 {activeCount > 0 && <span className="active-count">{activeCount}</span>}
      </button>

      {/* Admin Panel */}
      {isVisible && (
        <div className="admin-panel">
          <div className="admin-header">
            <h3>👑 Admin Panel</h3>
            <span className="admin-user">InfinityCats</span>
          </div>
          
          <div className="admin-cheats">
            {cheatKeys.map((key) => {
              const { name, emoji } = cheatDescriptions[key];
              const isActive = cheats[key];
              
              return (
                <button
                  key={key}
                  className={`cheat-button ${isActive ? 'active' : ''}`}
                  onClick={() => onToggleCheat(key)}
                >
                  <span className="cheat-emoji">{emoji}</span>
                  <span className="cheat-name">{name}</span>
                  <span className={`cheat-status ${isActive ? 'on' : 'off'}`}>
                    {isActive ? 'ON' : 'OFF'}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="admin-actions">
            <button className="reset-button" onClick={onReset}>
              🔄 Reset All Cheats
            </button>
            
            {onOpenFortuneWheel && (
              <button className="fortune-wheel-button" onClick={onOpenFortuneWheel}>
                🎰 Fortune Wheel (∞ Spins)
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;
