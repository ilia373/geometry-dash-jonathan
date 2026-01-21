// Fortune Wheel utility functions for timing and storage management

// Fortune Wheel Storage Keys
const LAST_WHEEL_TIME_KEY = 'geometry-dash-last-wheel-time';
const SPINS_LEFT_KEY = 'geometry-dash-spins-left';

// Wheel constants
export const WHEEL_COOLDOWN_MS = 10 * 60 * 60 * 1000; // 10 hours in milliseconds
export const DEFAULT_SPINS = 2;

// Wheel portion definitions (A-H)
export interface WheelPortion {
  id: string;
  label: string;
  emoji: string;
  color: string;
  reward: { type: 'coins' | 'skin'; amount?: number };
  probability: number; // percentage
}

export const WHEEL_PORTIONS: WheelPortion[] = [
  { id: 'A', label: '50', emoji: '🪙', color: '#FFD700', reward: { type: 'coins', amount: 50 }, probability: 12 },
  { id: 'B', label: '100', emoji: '💰', color: '#FF6B6B', reward: { type: 'coins', amount: 100 }, probability: 8 },
  { id: 'C', label: '120', emoji: '💵', color: '#4ECDC4', reward: { type: 'coins', amount: 120 }, probability: 10 },
  { id: 'D', label: '1', emoji: '🎯', color: '#9B59B6', reward: { type: 'coins', amount: 1 }, probability: 25 },
  { id: 'E', label: 'Skin', emoji: '🎨', color: '#FF69B4', reward: { type: 'skin' }, probability: 3 },
  { id: 'F', label: '140', emoji: '💎', color: '#3498DB', reward: { type: 'coins', amount: 140 }, probability: 10 },
  { id: 'G', label: '10', emoji: '⭐', color: '#2ECC71', reward: { type: 'coins', amount: 10 }, probability: 30 },
  { id: 'H', label: '300', emoji: '👑', color: '#E74C3C', reward: { type: 'coins', amount: 300 }, probability: 2 },
];

// Get a random portion based on probability weights
export const getWeightedRandomPortion = (): WheelPortion => {
  const totalWeight = WHEEL_PORTIONS.reduce((sum, p) => sum + p.probability, 0);
  let random = Math.random() * totalWeight;
  
  for (const portion of WHEEL_PORTIONS) {
    random -= portion.probability;
    if (random <= 0) {
      return portion;
    }
  }
  
  return WHEEL_PORTIONS[0]; // Fallback
};

// Utility functions for wheel timing management
export const getLastWheelTime = (): number => {
  const saved = localStorage.getItem(LAST_WHEEL_TIME_KEY);
  return saved ? parseInt(saved, 10) : 0;
};

export const setLastWheelTime = (time: number): void => {
  localStorage.setItem(LAST_WHEEL_TIME_KEY, time.toString());
};

export const resetSpins = (): void => {
  localStorage.setItem(SPINS_LEFT_KEY, DEFAULT_SPINS.toString());
};

export const getSpinsLeft = (): number => {
  const saved = localStorage.getItem(SPINS_LEFT_KEY);
  return saved !== null ? parseInt(saved, 10) : 0;
};

export const saveSpins = (spins: number): void => {
  localStorage.setItem(SPINS_LEFT_KEY, spins.toString());
};

export const shouldShowWheel = (): boolean => {
  const lastTime = getLastWheelTime();
  const now = Date.now();
  const spins = getSpinsLeft();
  
  // Show wheel if enough time has passed OR if user still has spins
  if (now - lastTime >= WHEEL_COOLDOWN_MS) {
    // Reset spins and update last time
    resetSpins();
    setLastWheelTime(now);
    return true;
  }
  
  return spins > 0;
};

export const initializeWheelForNewUser = (): void => {
  const lastTime = getLastWheelTime();
  if (lastTime === 0) {
    // First time user - give them spins
    resetSpins();
    setLastWheelTime(Date.now());
  }
};
