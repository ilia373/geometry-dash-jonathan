import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../utils/skinManager', () => ({
  getSelectedSkinId: vi.fn(() => 1),
  setSelectedSkin: vi.fn(),
  isSkinUnlocked: vi.fn((id: number) => id <= 6),
  unlockSkin: vi.fn(),
  getSkinPrice: vi.fn(() => 200),
}));

vi.mock('../../utils/weaponManager', () => ({
  getOwnedWeaponIds: vi.fn(() => []),
  getSelectedWeaponId: vi.fn(() => null),
  unlockWeapon: vi.fn(() => Promise.resolve()),
  setSelectedWeapon: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../utils/walletManager', () => ({
  getTotalCoins: vi.fn(() => 500),
  spendCoins: vi.fn(() => Promise.resolve(true)),
}));

import Shop from '../Shop';

describe('Shop Component', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders shop container', () => {
    render(<Shop onBack={mockOnBack} />);
    const container = document.querySelector('.shop-container');
    expect(container).toBeInTheDocument();
  });

  it('renders two tab buttons — Skins and Weapons', () => {
    render(<Shop onBack={mockOnBack} />);
    const skinTab = screen.getByRole('button', { name: /🎨 Skins/i });
    const weaponsTab = screen.getByRole('button', { name: /🔫 Weapons/i });
    expect(skinTab).toBeInTheDocument();
    expect(weaponsTab).toBeInTheDocument();
  });

  it('Skins tab is active by default', () => {
    render(<Shop onBack={mockOnBack} />);
    const skinTab = screen.getByRole('button', { name: /🎨 Skins/i });
    expect(skinTab).toHaveClass('active');
  });

  it('renders SkinSelector by default', () => {
    render(<Shop onBack={mockOnBack} />);
    expect(document.querySelector('.skin-selector-container')).toBeInTheDocument();
  });

  it('switches to WeaponSelector when Weapons tab is clicked', () => {
    render(<Shop onBack={mockOnBack} />);
    const weaponsTab = screen.getByRole('button', { name: /🔫 Weapons/i });
    fireEvent.click(weaponsTab);
    expect(document.querySelector('.weapon-selector-container')).toBeInTheDocument();
  });

  it('Weapons tab has active class after clicking it', () => {
    render(<Shop onBack={mockOnBack} />);
    const weaponsTab = screen.getByRole('button', { name: /🔫 Weapons/i });
    fireEvent.click(weaponsTab);
    expect(weaponsTab).toHaveClass('active');
  });

  it('Skins tab no longer active after switching to Weapons', () => {
    render(<Shop onBack={mockOnBack} />);
    const skinTab = screen.getByRole('button', { name: /🎨 Skins/i });
    const weaponsTab = screen.getByRole('button', { name: /🔫 Weapons/i });
    fireEvent.click(weaponsTab);
    expect(skinTab).not.toHaveClass('active');
  });

  it('renders coins display with value 500 on default Skins tab', () => {
    render(<Shop onBack={mockOnBack} />);
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('renders coins display with value 500 on Weapons tab', () => {
    render(<Shop onBack={mockOnBack} />);
    const weaponsTab = screen.getByRole('button', { name: /🔫 Weapons/i });
    fireEvent.click(weaponsTab);
    const coinsDisplay = document.querySelector('.shop-coin-amount');
    expect(coinsDisplay?.textContent).toContain('500');
  });

  it('can switch back to Skins tab from Weapons tab', () => {
    render(<Shop onBack={mockOnBack} />);
    const skinTab = screen.getByRole('button', { name: /🎨 Skins/i });
    const weaponsTab = screen.getByRole('button', { name: /🔫 Weapons/i });

    fireEvent.click(weaponsTab);
    expect(document.querySelector('.weapon-selector-container')).toBeInTheDocument();

    fireEvent.click(skinTab);
    expect(document.querySelector('.skin-selector-container')).toBeInTheDocument();
    expect(skinTab).toHaveClass('active');
  });
});
