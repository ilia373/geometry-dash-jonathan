import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../config/firebase', () => ({ auth: {}, db: {} }));

const mockGetCurrentUser = vi.fn(() => null);
const mockIsAdmin = vi.fn(() => false);
const mockIsGuest = vi.fn(() => false);
const mockGetDisplayName = vi.fn(() => '');
const mockLogOut = vi.fn();
const mockOnAuthChange = vi.fn((cb: (user: unknown) => void) => { cb(null); return () => {}; });

vi.mock('../../utils/authService', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  onAuthChange: (cb: (user: unknown) => void) => mockOnAuthChange(cb),
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
  getTotalCoins: vi.fn(() => 1234),
  syncWalletFromCloud: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../utils/skinManager', () => ({
  syncSkinsFromCloud: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../utils/progressManager', () => ({
  syncProgressFromCloud: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../utils/universeManager', () => ({
  isUniverseUnlocked: vi.fn((id: string) => id === 'milky-way'),
  getUniverseCompletion: vi.fn(() => ({ completed: 0, total: 6 })),
  syncUniversesFromCloud: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../utils/fortuneWheelManager', () => ({
  shouldShowWheel: vi.fn(() => false),
  initializeWheelForNewUser: vi.fn(),
}));

vi.mock('../../utils/adminOverrides', () => ({
  getUnlockAllLevels: vi.fn(() => false),
  setUnlockAllLevels: vi.fn(),
}));

vi.mock('../AdminPanel', () => ({
  default: () => null,
}));

vi.mock('../FortuneWheel', () => ({
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

import SpaceMap from '../SpaceMap';

describe('SpaceMap Component', () => {
  const mockOnSelectUniverse = vi.fn();
  const mockOnOpenShop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders space-map-container', () => {
    render(<SpaceMap onSelectUniverse={mockOnSelectUniverse} onOpenShop={mockOnOpenShop} />);
    expect(document.querySelector('.space-map-container')).toBeInTheDocument();
  });

  it('renders all 5 universe nodes', () => {
    render(<SpaceMap onSelectUniverse={mockOnSelectUniverse} onOpenShop={mockOnOpenShop} />);
    expect(document.querySelectorAll('.universe-node')).toHaveLength(5);
  });

  it('milky-way node is not disabled', () => {
    render(<SpaceMap onSelectUniverse={mockOnSelectUniverse} onOpenShop={mockOnOpenShop} />);
    const milkyWayButton = screen.getByRole('button', { name: 'Milky Way' });
    expect(milkyWayButton).not.toBeDisabled();
  });

  it('coming-soon nodes are disabled', () => {
    render(<SpaceMap onSelectUniverse={mockOnSelectUniverse} onOpenShop={mockOnOpenShop} />);
    const cosmicButton = screen.getByRole('button', { name: 'Cosmic Abyss — Coming Soon' });
    expect(cosmicButton).toBeDisabled();
  });

  it('calls onSelectUniverse when milky-way is clicked', () => {
    render(<SpaceMap onSelectUniverse={mockOnSelectUniverse} onOpenShop={mockOnOpenShop} />);
    const milkyWayButton = screen.getByRole('button', { name: 'Milky Way' });
    fireEvent.click(milkyWayButton);
    expect(mockOnSelectUniverse).toHaveBeenCalledWith('milky-way');
  });

  it('renders coin display', () => {
    render(<SpaceMap onSelectUniverse={mockOnSelectUniverse} onOpenShop={mockOnOpenShop} />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders shop button', () => {
    render(<SpaceMap onSelectUniverse={mockOnSelectUniverse} onOpenShop={mockOnOpenShop} />);
    expect(screen.getByRole('button', { name: /shop/i })).toBeInTheDocument();
  });

  it('does not call onSelectUniverse when a disabled node is clicked', () => {
    render(<SpaceMap onSelectUniverse={mockOnSelectUniverse} onOpenShop={mockOnOpenShop} />);
    const cosmicButton = screen.getByRole('button', { name: 'Cosmic Abyss — Coming Soon' });
    fireEvent.click(cosmicButton);
    expect(mockOnSelectUniverse).not.toHaveBeenCalled();
  });
});
