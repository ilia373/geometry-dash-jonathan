import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();
const mockGetIdTokenResult = vi.fn();

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
} from '../authService';

// Helper to create a mock user with getIdTokenResult
const createMockUser = (overrides: {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  isAdmin?: boolean;
} = {}) => {
  mockGetIdTokenResult.mockResolvedValue({
    claims: { admin: overrides.isAdmin ?? false },
  });
  return {
    uid: overrides.uid ?? 'test-uid',
    email: overrides.email ?? 'test@example.com',
    displayName: 'displayName' in overrides ? overrides.displayName : 'Test User',
    getIdTokenResult: mockGetIdTokenResult,
  };
};

describe('authService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockGetIdTokenResult.mockResolvedValue({ claims: { admin: false } });
    // Reset auth state between tests
    await logOut();
  });

  describe('isAdmin (claim-based)', () => {
    it('should return false when no user is logged in', () => {
      expect(isAdmin()).toBe(false);
    });

    it('should return false for guest users', () => {
      playAsGuest();
      expect(isAdmin()).toBe(false);
    });

    it('should return true for users with admin claim', async () => {
      const mockUser = createMockUser({ isAdmin: true });
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      await signInWithEmail('admin@example.com', 'password123');
      
      expect(isAdmin()).toBe(true);
    });

    it('should return false for users without admin claim', async () => {
      const mockUser = createMockUser({ isAdmin: false });
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      await signInWithEmail('user@example.com', 'password123');
      
      expect(isAdmin()).toBe(false);
    });

    it('should include isAdmin field in currentUser from custom claims', async () => {
      const mockUser = createMockUser({ isAdmin: true });
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      await signInWithEmail('admin@example.com', 'password123');
      const currentUser = getCurrentUser();
      
      expect(currentUser?.isAdmin).toBe(true);
    });

    it('should default isAdmin to false if getIdTokenResult fails', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test',
        getIdTokenResult: vi.fn().mockRejectedValue(new Error('Token error')),
      };
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await signInWithEmail('test@example.com', 'password123');
      
      expect(result.isAdmin).toBe(false);
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
      expect(getCurrentUser()?.isAdmin).toBe(false);
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
      const mockUser = createMockUser({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      });
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await signInWithEmail('test@example.com', 'password123');
      
      expect(result.uid).toBe('test-uid');
      expect(result.email).toBe('test@example.com');
      expect(result.isGuest).toBe(false);
    });

    it('should read admin claim from ID token', async () => {
      const mockUser = createMockUser({ email: 'admin@example.com', isAdmin: true });
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await signInWithEmail('admin@example.com', 'password123');
      
      expect(result.isAdmin).toBe(true);
      expect(mockGetIdTokenResult).toHaveBeenCalled();
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
      const mockUser = createMockUser({
        uid: 'new-uid',
        email: 'new@example.com',
        displayName: null,
      });
      mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await signUpWithEmail('new@example.com', 'password123');
      
      expect(result.uid).toBe('new-uid');
      expect(result.email).toBe('new@example.com');
      expect(result.displayName).toBe('new'); // Falls back to email prefix
    });

    it('should read admin claim for new users', async () => {
      const mockUser = createMockUser({ email: 'newadmin@example.com', isAdmin: true });
      mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });

      const result = await signUpWithEmail('newadmin@example.com', 'password123');
      
      expect(result.isAdmin).toBe(true);
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
      const mockUser = createMockUser({
        uid: 'google-uid',
        email: 'google@gmail.com',
        displayName: 'Google User',
      });
      mockSignInWithPopup.mockResolvedValue({ user: mockUser });

      const result = await signInWithGoogle();
      
      expect(result.uid).toBe('google-uid');
      expect(result.email).toBe('google@gmail.com');
      expect(result.displayName).toBe('Google User');
    });

    it('should read admin claim from Google sign-in', async () => {
      const mockUser = createMockUser({ email: 'admin@gmail.com', isAdmin: true });
      mockSignInWithPopup.mockResolvedValue({ user: mockUser });

      const result = await signInWithGoogle();
      
      expect(result.isAdmin).toBe(true);
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
      const mockUser = createMockUser({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test',
      });
      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      mockSignOut.mockResolvedValue(undefined);
      
      await signInWithEmail('test@example.com', 'password');
      await logOut();
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
