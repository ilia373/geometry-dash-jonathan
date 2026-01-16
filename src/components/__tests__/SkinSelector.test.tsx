import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkinSelector from '../SkinSelector';

// Mock the dependencies
vi.mock('../../utils/skinManager', () => ({
  getSelectedSkinId: vi.fn(() => 1),
  setSelectedSkin: vi.fn(),
  isSkinUnlocked: vi.fn((skinId: number) => skinId <= 6),
  unlockSkin: vi.fn(),
  getSkinPrice: vi.fn((skinId: number) => skinId === 98 ? 469 : 200),
}));

vi.mock('../../utils/walletManager', () => ({
  getTotalCoins: vi.fn(() => 500),
  spendCoins: vi.fn(() => true),
}));

describe('SkinSelector Component', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render skin selector container', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    expect(screen.getByText('🎨 Skin Shop')).toBeInTheDocument();
  });

  it('should display coin balance', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('should render back button', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should display unlocked count', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    // Should show X/102 format
    expect(screen.getByText(/unlocked/i)).toBeInTheDocument();
  });

  it('should render category filter buttons', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    const allButtons = screen.getAllByText(/all/i);
    expect(allButtons.length).toBeGreaterThan(0);
    expect(screen.getByText(/flags/i)).toBeInTheDocument();
    expect(screen.getByText(/games/i)).toBeInTheDocument();
    expect(screen.getByText(/animals/i)).toBeInTheDocument();
  });

  it('should render skin cards', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    // Check for some skin names (may appear multiple times in grid and preview)
    const originalElements = screen.getAllByText('Original');
    expect(originalElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Classic Green')).toBeInTheDocument();
  });

  it('should show preview section', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    const previewSection = document.querySelector('.skin-preview-section');
    expect(previewSection).toBeInTheDocument();
  });

  it('should display current skin name in preview', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    // Default selected skin is Original
    const previewInfo = document.querySelector('.preview-info');
    expect(previewInfo?.textContent).toContain('Original');
  });

  it('should show category in preview', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    expect(screen.getByText('DEFAULT')).toBeInTheDocument();
  });

  it('should render locked indicator for locked skins', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    // Skins above ID 6 should be locked
    const lockedCards = document.querySelectorAll('.skin-card.locked');
    expect(lockedCards.length).toBeGreaterThan(0);
  });

  it('should render buy buttons on locked skins', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    const buyButtons = document.querySelectorAll('.buy-button');
    expect(buyButtons.length).toBeGreaterThan(0);
  });

  it('should show lock overlay on locked skins', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    const lockOverlays = document.querySelectorAll('.lock-overlay');
    expect(lockOverlays.length).toBeGreaterThan(0);
  });

  it('should show equipped badge on selected skin', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    const equippedBadge = document.querySelector('.equipped-badge');
    expect(equippedBadge).toBeInTheDocument();
  });

  it('should filter skins by category when category button is clicked', async () => {
    render(<SkinSelector onBack={mockOnBack} />);
    
    // Click on Flags category
    const flagsButton = screen.getByText(/flags/i);
    fireEvent.click(flagsButton);
    
    // Should show USA skin
    expect(screen.getByText('USA')).toBeInTheDocument();
  });

  it('should render skins grid', () => {
    render(<SkinSelector onBack={mockOnBack} />);
    const skinsGrid = document.querySelector('.skins-grid');
    expect(skinsGrid).toBeInTheDocument();
  });
});
