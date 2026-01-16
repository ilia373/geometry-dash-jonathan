import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthModal from '../AuthModal';

// Mock Firebase config
vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
}));

// Mock auth service
const mockSignInWithEmail = vi.fn();
const mockSignUpWithEmail = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockPlayAsGuest = vi.fn();

vi.mock('../../utils/authService', () => ({
  signInWithEmail: (...args: unknown[]) => mockSignInWithEmail(...args),
  signUpWithEmail: (...args: unknown[]) => mockSignUpWithEmail(...args),
  signInWithGoogle: () => mockSignInWithGoogle(),
  playAsGuest: () => mockPlayAsGuest(),
  isSuperAdmin: (email: string) => email === 'ilia209@gmail.com',
}));

describe('AuthModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form by default', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText('🎮 Welcome Back!')).toBeInTheDocument();
    expect(screen.getByText('Sign in to save your progress')).toBeInTheDocument();
  });

  it('should render email and password inputs', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay clicked', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const overlay = document.querySelector('.auth-modal-overlay');
    fireEvent.click(overlay!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when modal content clicked', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const modal = document.querySelector('.auth-modal');
    fireEvent.click(modal!);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should switch to signup mode', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const signUpLink = screen.getByText('Sign up');
    fireEvent.click(signUpLink);
    expect(screen.getByText('🎮 Join the Game!')).toBeInTheDocument();
  });

  it('should switch back to login mode', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    // First switch to signup
    fireEvent.click(screen.getByText('Sign up'));
    // Then switch back to login
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('🎮 Welcome Back!')).toBeInTheDocument();
  });

  it('should show admin badge for super admin email', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'ilia209@gmail.com' } });
    expect(screen.getByText('👑 Super Admin')).toBeInTheDocument();
  });

  it('should not show admin badge for regular email', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'regular@email.com' } });
    expect(screen.queryByText('👑 Super Admin')).not.toBeInTheDocument();
  });

  it('should call playAsGuest and onSuccess when guest button clicked', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const guestButton = screen.getByText('👤 Play as Guest');
    fireEvent.click(guestButton);
    expect(mockPlayAsGuest).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('should render Google sign-in button', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('should call signInWithGoogle when Google button clicked', async () => {
    mockSignInWithGoogle.mockResolvedValue({});
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const googleButton = screen.getByText('Continue with Google');
    fireEvent.click(googleButton);
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  it('should show warning about guest progress', () => {
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText("⚠️ Guest progress won't be saved")).toBeInTheDocument();
  });

  it('should call signInWithEmail on login form submit', async () => {
    mockSignInWithEmail.mockResolvedValue({});
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('🔓 Sign In');
    
    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('test@email.com', 'password123');
    });
  });

  it('should call signUpWithEmail on signup form submit', async () => {
    mockSignUpWithEmail.mockResolvedValue({});
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    // Switch to signup mode
    fireEvent.click(screen.getByText('Sign up'));
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('✨ Create Account');
    
    fireEvent.change(emailInput, { target: { value: 'new@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSignUpWithEmail).toHaveBeenCalledWith('new@email.com', 'password123');
    });
  });

  it('should show error message on auth failure', async () => {
    mockSignInWithEmail.mockRejectedValue(new Error('Invalid credentials'));
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('🔓 Sign In');
    
    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show error message on Google sign-in failure', async () => {
    mockSignInWithGoogle.mockRejectedValue(new Error('Popup closed'));
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const googleButton = screen.getByText('Continue with Google');
    fireEvent.click(googleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Popup closed')).toBeInTheDocument();
    });
  });

  it('should show generic error for non-Error Google failures', async () => {
    mockSignInWithGoogle.mockRejectedValue('unknown error');
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const googleButton = screen.getByText('Continue with Google');
    fireEvent.click(googleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Google sign in failed')).toBeInTheDocument();
    });
  });

  it('should show generic error for non-Error email auth failures', async () => {
    mockSignInWithEmail.mockRejectedValue('unknown error');
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('🔓 Sign In');
    
    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    });
  });

  it('should call onSuccess after successful Google sign-in', async () => {
    mockSignInWithGoogle.mockResolvedValue({});
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const googleButton = screen.getByText('Continue with Google');
    fireEvent.click(googleButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should call onSuccess after successful email sign-in', async () => {
    mockSignInWithEmail.mockResolvedValue({});
    render(<AuthModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('🔓 Sign In');
    
    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
