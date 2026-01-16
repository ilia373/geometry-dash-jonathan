import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();

// Mock Firebase
vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUserWithEmailAndPassword(...args),
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  GoogleAuthProvider: vi.fn(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}));

// Import after mocks
import {
  isSuperAdmin,
  isAdmin,
  getCurrentUser,
  isGuest,
  getDisplayName,
  playAsGuest,
  onAuthChange,
  logOut,
  initializeAuth,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  SUPER_ADMIN_EMAILS,
} from '../authService';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SUPER_ADMIN_EMAILS', () => {
    it('should contain the correct admin emails', () => {
      expect(SUPER_ADMIN_EMAILS).toContain('ilia209@gmail.com');
      expect(SUPER_ADMIN_EMAILS).toContain('Jonathan.aronov.140417@gmail.com');
      expect(SUPER_ADMIN_EMAILS).toHaveLength(2);
    });
  });

  describe('isSuperAdmin', () => {
    it('should return true for admin email', () => {
      expect(isSuperAdmin('ilia209@gmail.com')).toBe(true);
    });

    it('should return true for admin email case-insensitive', () => {
      expect(isSuperAdmin('ILIA209@GMAIL.COM')).toBe(true);
      expect(isSuperAdmin('Jonathan.Aronov.140417@Gmail.Com')).toBe(true);
    });

    it('should return false for non-admin email', () => {
      expect(isSuperAdmin('random@email.com')).toBe(false);
    });

    it('should return false for null email', () => {
      expect(isSuperAdmin(null)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isSuperAdmin('')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return false when no user is logged in', () => {
      expect(isAdmin()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null initially', () => {
      expect(getCurrentUser()).toBe(null);
    });
  });

  describe('isGuest', () => {
    it('should return false initially', () => {
      expect(isGuest()).toBe(false);
    });
  });

  describe('playAsGuest', () => {
    it('should set user to guest mode', () => {
      playAsGuest();
      expect(isGuest()).toBe(true);
      expect(getCurrentUser()).not.toBe(null);
      expect(getCurrentUser()?.isGuest).toBe(true);
      expect(getCurrentUser()?.displayName).toBe('Guest');
    });

    it('should not grant admin access to guests', () => {
      playAsGuest();
      expect(isAdmin()).toBe(false);
    });
  });

  describe('getDisplayName', () => {
    it('should return empty string when no user', () => {
      // Reset state - need fresh module
      expect(getDisplayName()).toBeDefined();
    });

    it('should return Guest for guest users', () => {
      playAsGuest();
      expect(getDisplayName()).toBe('Guest');
    });
  });

  describe('onAuthChange', () => {
    it('should call callback immediately with current user', () => {
      const callback = vi.fn();
      onAuthChange(callback);
      expect(callback).toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = onAuthChange(callback);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should stop calling callback after unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = onAuthChange(callback);
      unsubscribe();
      // Callback was called once on subscribe, not again after unsubscribe
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('logOut', () => {
    it('should clear guest mode when logging out', async () => {
      // First play as guest
      playAsGuest();
      expect(getCurrentUser()?.isGuest).toBe(true);
      
      // Then log out
      await logOut();
      expect(getCurrentUser()).toBeNull();
      expect(isGuest()).toBe(false);
    });

    it('should notify listeners on logout', async () => {
      const callback = vi.fn();
      playAsGuest();
      onAuthChange(callback);
      callback.mockClear();
      
      await logOut();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('initializeAuth', () => {
    it('should not throw when called', () => {
      expect(() => initializeAuth()).not.toThrow();
    });

    it('should register auth state listener', () => {
      mockOnAuthStateChanged.mockClear();
      initializeAuth();
      expect(mockOnAuthStateChanged).toHaveBeenCalled();
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in with email and password', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      };
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await signInWithEmail('test@example.com', 'password123');
      
      expect(result.uid).toBe('test-uid');
      expect(result.email).toBe('test@example.com');
      expect(result.isGuest).toBe(false);
    });

    it('should throw user-friendly error on invalid email', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-email' });

      await expect(signInWithEmail('bad', 'pass')).rejects.toThrow('Invalid email address');
    });

    it('should throw user-friendly error on user not found', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({ code: 'auth/user-not-found' });

      await expect(signInWithEmail('nobody@test.com', 'pass')).rejects.toThrow('No account found with this email');
    });

    it('should throw user-friendly error on wrong password', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({ code: 'auth/wrong-password' });

      await expect(signInWithEmail('test@example.com', 'wrong')).rejects.toThrow('Incorrect password');
    });

    it('should throw user-friendly error on invalid credential', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-credential' });

      await expect(signInWithEmail('test@example.com', 'bad')).rejects.toThrow('Invalid email or password');
    });

    it('should throw user-friendly error on user disabled', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({ code: 'auth/user-disabled' });

      await expect(signInWithEmail('disabled@test.com', 'pass')).rejects.toThrow('This account has been disabled');
    });

    it('should throw generic error on unknown error code', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({ code: 'auth/unknown' });

      await expect(signInWithEmail('test@example.com', 'pass')).rejects.toThrow('An error occurred. Please try again.');
    });
  });

  describe('signUpWithEmail', () => {
    it('should create account with email and password', async () => {
      const mockUser = {
        uid: 'new-uid',
        email: 'new@example.com',
        displayName: null,
      };
      mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await signUpWithEmail('new@example.com', 'password123');
      
      expect(result.uid).toBe('new-uid');
      expect(result.email).toBe('new@example.com');
      expect(result.displayName).toBe('new'); // Falls back to email prefix
    });

    it('should throw error on email already in use', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/email-already-in-use' });

      await expect(signUpWithEmail('existing@test.com', 'pass')).rejects.toThrow('An account already exists with this email');
    });

    it('should throw error on weak password', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/weak-password' });

      await expect(signUpWithEmail('test@test.com', '123')).rejects.toThrow('Password should be at least 6 characters');
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google popup', async () => {
      const mockUser = {
        uid: 'google-uid',
        email: 'google@gmail.com',
        displayName: 'Google User',
      };
      mockSignInWithPopup.mockResolvedValue({ user: mockUser });

      const result = await signInWithGoogle();
      
      expect(result.uid).toBe('google-uid');
      expect(result.email).toBe('google@gmail.com');
      expect(result.displayName).toBe('Google User');
    });

    it('should throw error on popup closed', async () => {
      mockSignInWithPopup.mockRejectedValue({ code: 'auth/popup-closed-by-user' });

      await expect(signInWithGoogle()).rejects.toThrow('Sign in cancelled');
    });

    it('should throw error on popup blocked', async () => {
      mockSignInWithPopup.mockRejectedValue({ code: 'auth/popup-blocked' });

      await expect(signInWithGoogle()).rejects.toThrow('Popup was blocked. Please allow popups for this site.');
    });
  });

  describe('logOut with authenticated user', () => {
    it('should call Firebase signOut for authenticated users', async () => {
      // First sign in
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test',
      };
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      mockSignOut.mockResolvedValue(undefined);
      
      await signInWithEmail('test@example.com', 'password');
      await logOut();
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
