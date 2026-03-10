import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GuestWarning from '../GuestWarning';

describe('GuestWarning', () => {
  it('should render warning title', () => {
    render(<GuestWarning onLogin={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText('Your Progress Will Be Lost!')).toBeInTheDocument();
  });

  it('should render login and dismiss buttons', () => {
    render(<GuestWarning onLogin={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText(/Log In to Save Progress/)).toBeInTheDocument();
    expect(screen.getByText('Continue Without Saving')).toBeInTheDocument();
  });

  it('should call onLogin when login button is clicked', () => {
    const onLogin = vi.fn();
    render(<GuestWarning onLogin={onLogin} onDismiss={vi.fn()} />);
    fireEvent.click(screen.getByText(/Log In to Save Progress/));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<GuestWarning onLogin={vi.fn()} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText('Continue Without Saving'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should call onDismiss when overlay is clicked', () => {
    const onDismiss = vi.fn();
    const { container } = render(<GuestWarning onLogin={vi.fn()} onDismiss={onDismiss} />);
    const overlay = container.querySelector('.guest-warning-overlay');
    fireEvent.click(overlay!);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should not call onDismiss when modal content is clicked', () => {
    const onDismiss = vi.fn();
    const { container } = render(<GuestWarning onLogin={vi.fn()} onDismiss={onDismiss} />);
    const modal = container.querySelector('.guest-warning-modal');
    fireEvent.click(modal!);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('should render the note about keeping progress after login', () => {
    render(<GuestWarning onLogin={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText(/keep playing right where you left off/)).toBeInTheDocument();
  });
});
