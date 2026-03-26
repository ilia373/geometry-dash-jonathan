import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../config/firebase', () => ({ auth: {}, db: {} }));

const mockGetCurrentUser = vi.fn(() => null);
const mockIsAdmin = vi.fn(() => false);
const mockIsGuest = vi.fn(() => false);
const mockGetDisplayName = vi.fn(() => '');
const mockLogOut = vi.fn();

vi.mock('../../utils/authService', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  onAuthChange: vi.fn((cb: (user: unknown) => void) => { cb(null); return () => {}; }),
  isAdmin: () => mockIsAdmin(),
  isGuest: () => mockIsGuest(),
  logOut: () => mockLogOut(),
  getDisplayName: () => mockGetDisplayName(),
  isSuperAdmin: vi.fn(() => false),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  playAsGuest: vi.fn(),
}));

vi.mock('../../utils/walletManager', () => ({
  getTotalCoins: vi.fn(() => 500),
}));

vi.mock('../../utils/progressManager', () => ({
  isLevelUnlocked: vi.fn((id: number) => id <= 2),
  isLevelCompleted: vi.fn((id: number) => id === 1),
}));

vi.mock('../AdminPanel', () => ({
  default: () => null,
}));

vi.mock('../AuthModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="auth-modal">
      <button type="button" onClick={onClose}>Close</button>
      Welcome back
    </div>
  ),
}));

import UniverseLevelSelector from '../UniverseLevelSelector';

describe('UniverseLevelSelector Component', () => {
  const mockOnStartGame = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnOpenShop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders universe title for milky-way', () => {
    render(
      <UniverseLevelSelector
        universeId="milky-way"
        onStartGame={mockOnStartGame}
        onBack={mockOnBack}
        onOpenShop={mockOnOpenShop}
      />
    );
    expect(screen.getByText('Milky Way')).toBeInTheDocument();
  });

  it('renders all 7 planet cards for milky-way', () => {
    render(
      <UniverseLevelSelector
        universeId="milky-way"
        onStartGame={mockOnStartGame}
        onBack={mockOnBack}
        onOpenShop={mockOnOpenShop}
      />
    );
    expect(document.querySelectorAll('.planet-card')).toHaveLength(7);
  });

  it('back button calls onBack', () => {
    render(
      <UniverseLevelSelector
        universeId="milky-way"
        onStartGame={mockOnStartGame}
        onBack={mockOnBack}
        onOpenShop={mockOnOpenShop}
      />
    );
    const backButton = document.querySelector('.back-button') as HTMLElement;
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('locked levels have disabled attribute', () => {
    render(
      <UniverseLevelSelector
        universeId="milky-way"
        onStartGame={mockOnStartGame}
        onBack={mockOnBack}
        onOpenShop={mockOnOpenShop}
      />
    );
    const level3Card = document.querySelectorAll('.planet-card')[2] as HTMLButtonElement;
    expect(level3Card).toBeDisabled();
  });

  it('completed level shows checkmark badge', () => {
    render(
      <UniverseLevelSelector
        universeId="milky-way"
        onStartGame={mockOnStartGame}
        onBack={mockOnBack}
        onOpenShop={mockOnOpenShop}
      />
    );
    expect(document.querySelector('.badge-icon.completed')).not.toBeNull();
  });

  it('play button is present', () => {
    render(
      <UniverseLevelSelector
        universeId="milky-way"
        onStartGame={mockOnStartGame}
        onBack={mockOnBack}
        onOpenShop={mockOnOpenShop}
      />
    );
    expect(document.querySelector('.universe-play-button')).toBeInTheDocument();
  });

  it('play button calls onStartGame when unlocked level is selected', () => {
    render(
      <UniverseLevelSelector
        universeId="milky-way"
        onStartGame={mockOnStartGame}
        onBack={mockOnBack}
        onOpenShop={mockOnOpenShop}
      />
    );
    const playButton = document.querySelector('.universe-play-button') as HTMLElement;
    fireEvent.click(playButton);
    expect(mockOnStartGame).toHaveBeenCalled();
  });

  it('renders null when universeId is invalid', () => {
    render(
      <UniverseLevelSelector
        universeId="does-not-exist"
        onStartGame={mockOnStartGame}
        onBack={mockOnBack}
        onOpenShop={mockOnOpenShop}
      />
    );
    expect(document.querySelector('.universe-level-selector')).toBeNull();
  });
});
