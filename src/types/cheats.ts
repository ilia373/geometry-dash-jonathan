// Cheat/Admin state management
export interface CheatState {
  infiniteCoins: boolean;   // Unlimited coins - every frame adds coins
  float: boolean;           // Float mode - no gravity
  speedBoost: boolean;      // 2x speed
  slowMotion: boolean;      // 0.5x speed
  autoQuantKiller: boolean; // Touch quants anywhere to kill them
  tenXCoins: boolean;       // 10x coins from ground pickups
  magnetPower: boolean;     // Super magnet pulls all coins instantly
  ghostMode: boolean;       // Pass through spikes
}

export const defaultCheatState: CheatState = {
  infiniteCoins: false,
  float: false,
  speedBoost: false,
  slowMotion: false,
  autoQuantKiller: false,
  tenXCoins: false,
  magnetPower: false,
  ghostMode: false,
};

export const cheatDescriptions: Record<keyof CheatState, { name: string; emoji: string }> = {
  infiniteCoins: { name: 'Infinite Coins', emoji: '💰' },
  float: { name: 'Float Mode', emoji: '🎈' },
  speedBoost: { name: 'Speed Boost', emoji: '⚡' },
  slowMotion: { name: 'Slow Motion', emoji: '🐌' },
  autoQuantKiller: { name: 'Auto Quant Kill', emoji: '☠️' },
  tenXCoins: { name: '10x Coins', emoji: '🌟' },
  magnetPower: { name: 'Super Magnet', emoji: '🧲' },
  ghostMode: { name: 'Ghost Mode', emoji: '👻' },
};
