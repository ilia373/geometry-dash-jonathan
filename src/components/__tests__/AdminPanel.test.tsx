import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPanel from '../AdminPanel';
import { defaultCheatState } from '../../types/cheats';
import type { CheatState } from '../../types/cheats';

describe('AdminPanel', () => {
  const mockOnToggleCheat = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnToggleVisibility = vi.fn();

  const defaultProps = {
    cheats: defaultCheatState,
    onToggleCheat: mockOnToggleCheat,
    onReset: mockOnReset,
    isVisible: true,
    onToggleVisibility: mockOnToggleVisibility,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render toggle button', () => {
    render(<AdminPanel {...defaultProps} isVisible={false} />);
    const toggleButton = screen.getByRole('button', { name: /👑/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should show admin panel when visible', () => {
    render(<AdminPanel {...defaultProps} />);
    expect(screen.getByText('👑 Admin Panel')).toBeInTheDocument();
  });

  it('should hide admin panel when not visible', () => {
    render(<AdminPanel {...defaultProps} isVisible={false} />);
    expect(screen.queryByText('👑 Admin Panel')).not.toBeInTheDocument();
  });

  it('should call onToggleVisibility when toggle button clicked', () => {
    render(<AdminPanel {...defaultProps} />);
    const toggleButton = screen.getByTitle('Admin Panel (InfinityCats Only)');
    fireEvent.click(toggleButton);
    expect(mockOnToggleVisibility).toHaveBeenCalledTimes(1);
  });

  it('should render all cheat buttons', () => {
    render(<AdminPanel {...defaultProps} />);
    expect(screen.getByText('Infinite Coins')).toBeInTheDocument();
    expect(screen.getByText('Float Mode')).toBeInTheDocument();
    expect(screen.getByText('Speed Boost')).toBeInTheDocument();
    expect(screen.getByText('Slow Motion')).toBeInTheDocument();
    expect(screen.getByText('Auto Quant Kill')).toBeInTheDocument();
    expect(screen.getByText('10x Coins')).toBeInTheDocument();
    expect(screen.getByText('Super Magnet')).toBeInTheDocument();
    expect(screen.getByText('Ghost Mode')).toBeInTheDocument();
  });

  it('should call onToggleCheat when cheat button clicked', () => {
    render(<AdminPanel {...defaultProps} />);
    const infiniteCoinsButton = screen.getByText('Infinite Coins').closest('button');
    fireEvent.click(infiniteCoinsButton!);
    expect(mockOnToggleCheat).toHaveBeenCalledWith('infiniteCoins');
  });

  it('should show active state for enabled cheats', () => {
    const cheatsWithInfiniteCoins: CheatState = {
      ...defaultCheatState,
      infiniteCoins: true,
    };
    render(<AdminPanel {...defaultProps} cheats={cheatsWithInfiniteCoins} />);
    
    // Find the ON status for infiniteCoins
    const infiniteCoinsButton = screen.getByText('Infinite Coins').closest('button');
    expect(infiniteCoinsButton).toHaveClass('active');
  });

  it('should render reset button', () => {
    render(<AdminPanel {...defaultProps} />);
    expect(screen.getByText('🔄 Reset All Cheats')).toBeInTheDocument();
  });

  it('should call onReset when reset button clicked', () => {
    render(<AdminPanel {...defaultProps} />);
    const resetButton = screen.getByText('🔄 Reset All Cheats');
    fireEvent.click(resetButton);
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should show active count when cheats are enabled', () => {
    const cheatsWithTwo: CheatState = {
      ...defaultCheatState,
      infiniteCoins: true,
      float: true,
    };
    render(<AdminPanel {...defaultProps} cheats={cheatsWithTwo} isVisible={false} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should not show active count when no cheats enabled', () => {
    render(<AdminPanel {...defaultProps} isVisible={false} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  describe('Unlock All toggle', () => {
    const mockOnToggleUnlockAll = vi.fn();

    it('should render unlock-all button when onToggleUnlockAll is provided', () => {
      render(
        <AdminPanel
          {...defaultProps}
          unlockAllActive={false}
          onToggleUnlockAll={mockOnToggleUnlockAll}
        />
      );
      expect(screen.getByText('🔒 Unlock All: OFF')).toBeInTheDocument();
    });

    it('should show ON state when unlockAllActive is true', () => {
      render(
        <AdminPanel
          {...defaultProps}
          unlockAllActive={true}
          onToggleUnlockAll={mockOnToggleUnlockAll}
        />
      );
      expect(screen.getByText('🔓 Unlock All: ON')).toBeInTheDocument();
    });

    it('should call onToggleUnlockAll when button is clicked', () => {
      render(
        <AdminPanel
          {...defaultProps}
          unlockAllActive={false}
          onToggleUnlockAll={mockOnToggleUnlockAll}
        />
      );
      const unlockButton = screen.getByText('🔒 Unlock All: OFF');
      fireEvent.click(unlockButton);
      expect(mockOnToggleUnlockAll).toHaveBeenCalledTimes(1);
    });

    it('should not render unlock-all button when onToggleUnlockAll is not provided', () => {
      render(<AdminPanel {...defaultProps} />);
      expect(screen.queryByText(/Unlock All/)).not.toBeInTheDocument();
    });
  });
});
