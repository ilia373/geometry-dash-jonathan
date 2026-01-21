import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FortuneWheel from '../FortuneWheel';

// Mock Firebase config
vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
}));

// Mock fortuneWheelManager
const mockGetSpinsLeft = vi.fn(() => 2);
const mockSaveSpins = vi.fn();
const mockGetWeightedRandomPortion = vi.fn(() => ({
  id: 'A',
  emoji: '💰',
  color: '#FFD700',
  probability: 0.12,
  reward: { type: 'coins' as const, amount: 50 },
}));

vi.mock('../../utils/fortuneWheelManager', () => ({
  WHEEL_PORTIONS: [
    { id: 'A', emoji: '💰', color: '#FFD700', probability: 0.12, reward: { type: 'coins', amount: 50 } },
    { id: 'B', emoji: '💎', color: '#00CED1', probability: 0.08, reward: { type: 'coins', amount: 100 } },
    { id: 'C', emoji: '🌟', color: '#FF69B4', probability: 0.10, reward: { type: 'coins', amount: 120 } },
    { id: 'D', emoji: '🍀', color: '#32CD32', probability: 0.25, reward: { type: 'coins', amount: 1 } },
    { id: 'E', emoji: '🎨', color: '#9370DB', probability: 0.03, reward: { type: 'skin' } },
    { id: 'F', emoji: '🔥', color: '#FF4500', probability: 0.10, reward: { type: 'coins', amount: 140 } },
    { id: 'G', emoji: '⭐', color: '#FFB6C1', probability: 0.30, reward: { type: 'coins', amount: 10 } },
    { id: 'H', emoji: '👑', color: '#8B008B', probability: 0.02, reward: { type: 'coins', amount: 300 } },
  ],
  getWeightedRandomPortion: () => mockGetWeightedRandomPortion(),
  getSpinsLeft: () => mockGetSpinsLeft(),
  saveSpins: (spins: number) => mockSaveSpins(spins),
}));

// Mock walletManager
const mockAddCoins = vi.fn(() => Promise.resolve());
vi.mock('../../utils/walletManager', () => ({
  addCoins: (amount: number) => mockAddCoins(amount),
}));

// Mock skinManager
const mockUnlockSkin = vi.fn(() => Promise.resolve());
const mockGetUnlockedSkinIds = vi.fn(() => [1, 2]);
vi.mock('../../utils/skinManager', () => ({
  unlockSkin: (id: number) => mockUnlockSkin(id),
  getUnlockedSkinIds: () => mockGetUnlockedSkinIds(),
}));

// Mock soundManager
const mockPlaySound = vi.fn();
vi.mock('../../utils/soundManager', () => ({
  soundManager: {
    playSound: (sound: string) => mockPlaySound(sound),
  },
}));

// Mock SKINS from types/skins
vi.mock('../../types/skins', () => ({
  SKINS: [
    { id: 1, name: 'Original', colors: { primary: '#00ff88', secondary: '#00cc66', accent: '#009944', glow: '#00ff88' } },
    { id: 2, name: 'Fire', colors: { primary: '#ff4400', secondary: '#ff6600', accent: '#ff8800', glow: '#ff4400' } },
    { id: 3, name: 'Ice', colors: { primary: '#00ccff', secondary: '#0099cc', accent: '#006699', glow: '#00ccff' } },
    { id: 98, name: 'Rainbow', colors: { primary: '#ff0000', secondary: '#00ff00', accent: '#0000ff', glow: '#ffffff' } },
  ],
}));

describe('FortuneWheel Component', () => {
  const mockOnClose = vi.fn();
  const mockOnCoinsUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSpinsLeft.mockReturnValue(2);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when isOpen is false', () => {
    render(
      <FortuneWheel 
        isOpen={false} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    expect(screen.queryByText('Fortune Wheel')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    expect(screen.getByText('Fortune Wheel')).toBeInTheDocument();
  });

  it('should render close button', () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const closeButton = screen.getByText('✕');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render spin button', () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const spinButton = screen.getByRole('button', { name: /spin/i });
    expect(spinButton).toBeInTheDocument();
  });

  it('should display spins left', () => {
    mockGetSpinsLeft.mockReturnValue(2);
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    expect(screen.getByText(/2 spins left/i)).toBeInTheDocument();
  });

  it('should display unlimited spins when unlimitedSpins is true', () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate}
        unlimitedSpins={true}
      />
    );
    
    expect(screen.getByText(/∞ spins left/i)).toBeInTheDocument();
  });

  it('should render all 8 wheel portions', () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    // Check for emojis from each portion
    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('💎')).toBeInTheDocument();
    expect(screen.getByText('🌟')).toBeInTheDocument();
    expect(screen.getByText('🍀')).toBeInTheDocument();
    expect(screen.getByText('🎨')).toBeInTheDocument();
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();
    expect(screen.getByText('👑')).toBeInTheDocument();
  });

  it('should render bonus type labels on portions', () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    // 7 portions have coins, 1 has skin
    const coinLabels = screen.getAllByText('coins');
    const skinLabel = screen.getByText('SKIN');
    
    expect(coinLabels.length).toBe(7);
    expect(skinLabel).toBeInTheDocument();
  });

  it('should disable spin button when no spins left', () => {
    mockGetSpinsLeft.mockReturnValue(0);
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const spinButton = screen.getByRole('button', { name: /spin/i });
    expect(spinButton).toBeDisabled();
  });

  it('should not disable spin button when unlimitedSpins is true', () => {
    mockGetSpinsLeft.mockReturnValue(0);
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate}
        unlimitedSpins={true}
      />
    );
    
    const spinButton = screen.getByRole('button', { name: /spin/i });
    expect(spinButton).not.toBeDisabled();
  });

  it('should spin and award coins', async () => {
    mockGetWeightedRandomPortion.mockReturnValue({
      id: 'A',
      emoji: '💰',
      color: '#FFD700',
      probability: 0.12,
      reward: { type: 'coins', amount: 50 },
    });

    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const spinButton = screen.getByRole('button', { name: /spin/i });
    
    await act(async () => {
      fireEvent.click(spinButton);
    });

    // Advance timers past the spin animation (4000ms) and sound delays
    await act(async () => {
      vi.advanceTimersByTime(4500);
    });

    expect(mockAddCoins).toHaveBeenCalledWith(50);
    expect(mockOnCoinsUpdate).toHaveBeenCalled();
    // Sound is called via setTimeout, so just verify coins were added
  });

  it('should show result after spin completes', async () => {
    mockGetWeightedRandomPortion.mockReturnValue({
      id: 'A',
      emoji: '💰',
      color: '#FFD700',
      probability: 0.12,
      reward: { type: 'coins', amount: 50 },
    });

    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const spinButton = screen.getByRole('button', { name: /spin/i });
    
    await act(async () => {
      fireEvent.click(spinButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(4100);
    });

    expect(screen.getByText(/You won 50 coins!/i)).toBeInTheDocument();
  });

  it('should decrease spins after spin in normal mode', async () => {
    mockGetSpinsLeft.mockReturnValue(2);

    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const spinButton = screen.getByRole('button', { name: /spin/i });
    
    await act(async () => {
      fireEvent.click(spinButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(4100);
    });

    expect(mockSaveSpins).toHaveBeenCalledWith(1);
  });

  it('should not decrease spins in unlimited mode', async () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate}
        unlimitedSpins={true}
      />
    );
    
    const spinButton = screen.getByRole('button', { name: /spin/i });
    
    await act(async () => {
      fireEvent.click(spinButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(4100);
    });

    expect(mockSaveSpins).not.toHaveBeenCalled();
  });

  it('should unlock skin when skin reward is won', async () => {
    mockGetWeightedRandomPortion.mockReturnValue({
      id: 'E',
      emoji: '🎨',
      color: '#9370DB',
      probability: 0.03,
      reward: { type: 'skin' },
    });
    // Only 2 skins unlocked, skin 3 (Ice) is available
    mockGetUnlockedSkinIds.mockReturnValue([1, 2]);

    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const spinButton = screen.getByRole('button', { name: /spin/i });
    
    await act(async () => {
      fireEvent.click(spinButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(4100);
    });

    expect(mockUnlockSkin).toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('success');
  });

  it('should give coins instead when all skins unlocked', async () => {
    mockGetWeightedRandomPortion.mockReturnValue({
      id: 'E',
      emoji: '🎨',
      color: '#9370DB',
      probability: 0.03,
      reward: { type: 'skin' },
    });
    // All non-rainbow skins unlocked
    mockGetUnlockedSkinIds.mockReturnValue([1, 2, 3]);

    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const spinButton = screen.getByRole('button', { name: /spin/i });
    
    await act(async () => {
      fireEvent.click(spinButton);
    });

    await act(async () => {
      vi.advanceTimersByTime(4100);
    });

    expect(mockAddCoins).toHaveBeenCalledWith(200);
  });

  it('should show text while spinning', async () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const spinButton = screen.getByRole('button', { name: /spin/i });
    
    await act(async () => {
      fireEvent.click(spinButton);
    });

    // During spin animation
    expect(screen.getByText('Spinning...')).toBeInTheDocument();
  });

  it('should disable spin button while spinning', async () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const spinButton = screen.getByRole('button', { name: /spin/i });
    
    await act(async () => {
      fireEvent.click(spinButton);
    });

    // During spin animation
    expect(spinButton).toBeDisabled();
  });

  it('should render wheel center', () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    expect(screen.getByText('🎡')).toBeInTheDocument();
  });

  it('should render wheel pointer', () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('should render decorative lights', () => {
    render(
      <FortuneWheel 
        isOpen={true} 
        onClose={mockOnClose} 
        onCoinsUpdate={mockOnCoinsUpdate} 
      />
    );
    
    const lights = document.querySelectorAll('.light');
    expect(lights.length).toBe(16);
  });
});
