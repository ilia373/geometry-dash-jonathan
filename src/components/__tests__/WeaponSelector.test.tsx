import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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

import WeaponSelector from '../WeaponSelector';

describe('WeaponSelector Component', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders weapon selector container', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    const container = document.querySelector('.weapon-selector-container');
    expect(container).toBeInTheDocument();
  });

  it('renders the back button with ← text', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    expect(screen.getByText('←')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    fireEvent.click(screen.getByText('←'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('displays coin balance', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    expect(screen.getByText('🪙 500')).toBeInTheDocument();
  });

  it('renders All category filter button', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    expect(screen.getByText('🌟 All')).toBeInTheDocument();
  });

  it('renders category buttons for all 4 categories', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    expect(screen.getByText('🔫 Ballistic')).toBeInTheDocument();
    expect(screen.getByText('🔥 Fire')).toBeInTheDocument();
    expect(screen.getByText('⚡ Laser')).toBeInTheDocument();
    expect(screen.getByText('💣 Explosive')).toBeInTheDocument();
  });

  it('renders weapon cards (all 50 weapons visible by default)', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    const cards = document.querySelectorAll('.weapon-card');
    expect(cards.length).toBe(50);
  });

  it('shows buy button with price on unowned weapons', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    const buyButtons = document.querySelectorAll('.btn-buy');
    expect(buyButtons.length).toBeGreaterThan(0);
    expect(buyButtons[0].textContent).toMatch(/🪙/);
  });

  it('filters to only ballistic weapons when Ballistic category is clicked', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    fireEvent.click(screen.getByText('🔫 Ballistic'));
    const cards = document.querySelectorAll('.weapon-card');
    expect(cards.length).toBe(20);
  });

  it('weapon cards display damage value', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    const damageElements = document.querySelectorAll('.weapon-damage');
    expect(damageElements.length).toBeGreaterThan(0);
    expect(damageElements[0].textContent).toMatch(/⚔️/);
  });

  it('All category button is active by default', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    const allButton = screen.getByText('🌟 All').closest('button');
    expect(allButton).toHaveClass('active');
  });

  it('filters to only fire weapons when Fire category is clicked', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    fireEvent.click(screen.getByText('🔥 Fire'));
    const cards = document.querySelectorAll('.weapon-card');
    expect(cards.length).toBe(10);
  });

  it('filters to only laser weapons when Laser category is clicked', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    fireEvent.click(screen.getByText('⚡ Laser'));
    const cards = document.querySelectorAll('.weapon-card');
    expect(cards.length).toBe(10);
  });

  it('filters to only explosive weapons when Explosive category is clicked', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    fireEvent.click(screen.getByText('💣 Explosive'));
    const cards = document.querySelectorAll('.weapon-card');
    expect(cards.length).toBe(10);
  });

  it('clicking All category restores all 50 weapons after filtering', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    fireEvent.click(screen.getByText('🔫 Ballistic'));
    fireEvent.click(screen.getByText('🌟 All'));
    const cards = document.querySelectorAll('.weapon-card');
    expect(cards.length).toBe(50);
  });

  it('renders Pistol (first ballistic weapon) by name', () => {
    render(<WeaponSelector onBack={mockOnBack} />);
    expect(screen.getByText('Pistol')).toBeInTheDocument();
  });
});
