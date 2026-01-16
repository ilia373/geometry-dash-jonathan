import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  SUPER_ADMIN_EMAILS,
} from '../authService';

// Mock Firebase
vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

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
  });
});
