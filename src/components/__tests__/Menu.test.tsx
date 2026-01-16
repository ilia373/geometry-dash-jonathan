import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Menu from '../Menu';

// Mock Firebase config to prevent initialization errors
vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
  default: {},
}));

// Create mock functions that can be modified
const mockGetCurrentUser = vi.fn(() => null);
const mockIsAdmin = vi.fn(() => false);
const mockIsGuest = vi.fn(() => false);
const mockGetDisplayName = vi.fn(() => '');
const mockLogOut = vi.fn();

// Mock auth service
vi.mock('../../utils/authService', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  onAuthChange: vi.fn((callback: (user: unknown) => void) => {
    callback(mockGetCurrentUser());
    return () => {};
  }),
  isAdmin: () => mockIsAdmin(),
  logOut: () => mockLogOut(),
  getDisplayName: () => mockGetDisplayName(),
  isGuest: () => mockIsGuest(),
  isSuperAdmin: vi.fn(() => false),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  playAsGuest: vi.fn(),
}));

// Mock the dependencies
vi.mock('../../utils/progressManager', () => ({
  isLevelUnlocked: vi.fn((levelId: number) => levelId <= 2),
  isLevelCompleted: vi.fn((levelId: number) => levelId === 1),
}));

vi.mock('../../utils/walletManager', () => ({
  getTotalCoins: vi.fn(() => 500),
}));

vi.mock('../../utils/skinManager', () => ({
  getSelectedSkin: vi.fn(() => ({
    id: 1,
    name: 'Original',
    colors: { primary: '#00ff88', secondary: '#00cc66', accent: '#009944', glow: '#00ff88' },
  })),
}));

describe('Menu Component', () => {
  const mockOnStartGame = vi.fn();
  const mockOnOpenSkins = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render menu container', () => {
    render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
    const heroTitle = document.querySelector('.hero-title');
    expect(heroTitle).toBeInTheDocument();
  });

  it('should display coin count', () => {
    render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('should render skins button', () => {
    render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
    const skinsButton = screen.getByRole('button', { name: /skins/i });
    expect(skinsButton).toBeInTheDocument();
  });

  it('should call onOpenSkins when skins button is clicked', () => {
    render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
    const skinsButton = screen.getByRole('button', { name: /skins/i });
    fireEvent.click(skinsButton);
    expect(mockOnOpenSkins).toHaveBeenCalledTimes(1);
  });

  it('should render level cards', () => {
    render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
    // Check for level names in the carousel
    expect(screen.getByText('Stereo Madness')).toBeInTheDocument();
  });

  it('should render play button', () => {
    render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
    const playButton = screen.getByText(/play/i);
    expect(playButton).toBeInTheDocument();
  });

  it('should call onStartGame when play button is clicked', () => {
    render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);
    expect(mockOnStartGame).toHaveBeenCalled();
  });

  it('should display controls section', () => {
    render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
    expect(screen.getByText(/space/i)).toBeInTheDocument();
    const jumpElements = screen.getAllByText(/jump/i);
    expect(jumpElements.length).toBeGreaterThan(0);
  });

  it('should show difficulty bar', () => {
    render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
    // Should have difficulty indicator elements
    const difficultyBars = document.querySelectorAll('.difficulty-bar');
    expect(difficultyBars.length).toBeGreaterThan(0);
  });

  it('should render animated background elements', () => {
    render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
    const animatedBg = document.querySelector('.animated-bg');
    expect(animatedBg).toBeInTheDocument();
  });

  it('should render hero cube', () => {
    render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
    const heroCube = document.querySelector('.hero-cube');
    expect(heroCube).toBeInTheDocument();
  });

  describe('when user is logged in', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockReturnValue({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'TestUser',
        isGuest: false,
      });
      mockGetDisplayName.mockReturnValue('TestUser');
      mockIsGuest.mockReturnValue(false);
    });

    it('should display user name', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      expect(screen.getByText('TestUser')).toBeInTheDocument();
    });

    it('should display logout button', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it('should call logOut when logout button is clicked', async () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);
      await waitFor(() => {
        expect(mockLogOut).toHaveBeenCalled();
      });
    });
  });

  describe('when user is admin', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockReturnValue({
        uid: 'admin-uid',
        email: 'ilia209@gmail.com',
        displayName: 'Admin',
        isGuest: false,
      });
      mockGetDisplayName.mockReturnValue('Admin');
      mockIsAdmin.mockReturnValue(true);
      mockIsGuest.mockReturnValue(false);
    });

    it('should show admin crown', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      expect(screen.getByText('👑')).toBeInTheDocument();
    });
  });

  describe('when user is guest', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockReturnValue({
        uid: 'guest',
        email: null,
        displayName: 'Guest',
        isGuest: true,
      });
      mockGetDisplayName.mockReturnValue('Guest');
      mockIsGuest.mockReturnValue(true);
      mockIsAdmin.mockReturnValue(false);
    });

    it('should show guest icon', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      expect(screen.getByText('👤')).toBeInTheDocument();
    });

    it('should display Guest as user name', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      expect(screen.getByText('Guest')).toBeInTheDocument();
    });
  });

  describe('when no user is logged in', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockReturnValue(null);
      mockGetDisplayName.mockReturnValue('');
      mockIsGuest.mockReturnValue(false);
      mockIsAdmin.mockReturnValue(false);
    });

    it('should display login button', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
    });

    it('should open auth modal when login is clicked', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);
      
      // Auth modal should appear
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('should handle arrow right for level selection', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      fireEvent.keyDown(window, { code: 'ArrowRight' });
      // Level 2 should now be selected (since it's unlocked)
      const selectedCard = document.querySelector('.level-card.selected');
      expect(selectedCard).toBeInTheDocument();
    });

    it('should handle enter/space to start game', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      fireEvent.keyDown(window, { code: 'Enter' });
      expect(mockOnStartGame).toHaveBeenCalled();
    });
  });

  describe('level selection', () => {
    it('should allow clicking on unlocked levels', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      const level2Card = screen.getByText('Back on Track').closest('.level-card');
      if (level2Card) {
        fireEvent.click(level2Card);
        expect(level2Card).toHaveClass('selected');
      }
    });

    it('should allow double-click to start level', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      const level1Card = screen.getByText('Stereo Madness').closest('.level-card');
      if (level1Card) {
        fireEvent.doubleClick(level1Card);
        expect(mockOnStartGame).toHaveBeenCalledWith(1);
      }
    });
  });

  describe('hero cube interaction', () => {
    it('should add hovering class on mouse enter', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      const heroCube = document.querySelector('.hero-cube');
      if (heroCube) {
        fireEvent.mouseEnter(heroCube);
        expect(heroCube).toHaveClass('hovering');
      }
    });

    it('should remove hovering class on mouse leave', () => {
      render(<Menu onStartGame={mockOnStartGame} onOpenSkins={mockOnOpenSkins} />);
      const heroCube = document.querySelector('.hero-cube');
      if (heroCube) {
        fireEvent.mouseEnter(heroCube);
        fireEvent.mouseLeave(heroCube);
        expect(heroCube).not.toHaveClass('hovering');
      }
    });
  });
});
