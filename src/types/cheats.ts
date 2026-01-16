// Cheat/Admin state management
export interface CheatState {
  invincible: boolean;      // Infinity health - can't die
  float: boolean;           // Float mode - no gravity
  speedBoost: boolean;      // 2x speed
  slowMotion: boolean;      // 0.5x speed
  autoJump: boolean;        // Auto jump on obstacles
  bigPlayer: boolean;       // 2x player size
  smallPlayer: boolean;     // 0.5x player size
  ghostMode: boolean;       // Pass through spikes
}

export const defaultCheatState: CheatState = {
  invincible: false,
  float: false,
  speedBoost: false,
  slowMotion: false,
  autoJump: false,
  bigPlayer: false,
  smallPlayer: false,
  ghostMode: false,
};

export const cheatDescriptions: Record<keyof CheatState, { name: string; emoji: string }> = {
  invincible: { name: 'Infinity Health', emoji: '💖' },
  float: { name: 'Float Mode', emoji: '🎈' },
  speedBoost: { name: 'Speed Boost', emoji: '⚡' },
  slowMotion: { name: 'Slow Motion', emoji: '🐌' },
  autoJump: { name: 'Auto Jump', emoji: '🤖' },
  bigPlayer: { name: 'Big Player', emoji: '🦣' },
  smallPlayer: { name: 'Small Player', emoji: '🐜' },
  ghostMode: { name: 'Ghost Mode', emoji: '👻' },
};
