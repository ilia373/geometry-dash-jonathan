import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Menu from '../Menu';

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
});
