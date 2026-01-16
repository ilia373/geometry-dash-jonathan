// Authentication service with Firebase
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';

// Super admin email addresses - these users have full admin access
export const SUPER_ADMIN_EMAILS = [
  'ilia209@gmail.com',
  'Jonathan.aronov.140417@gmail.com',
];

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isGuest: boolean;
}

// Current auth state
let currentUser: AuthUser | null = null;
let isGuestMode = false;
let authListeners: ((user: AuthUser | null) => void)[] = [];

// Check if email is a super admin
export const isSuperAdmin = (email: string | null): boolean => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase() === email.toLowerCase()
  );
};

// Check if current user is admin (either super admin or guest is never admin)
export const isAdmin = (): boolean => {
  if (isGuestMode) return false;
  if (!currentUser) return false;
  return isSuperAdmin(currentUser.email);
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
  return currentUser;
};

// Check if in guest mode
export const isGuest = (): boolean => {
  return isGuestMode;
};

// Subscribe to auth state changes
export const onAuthChange = (callback: (user: AuthUser | null) => void): (() => void) => {
  authListeners.push(callback);
  // Call immediately with current state
  callback(currentUser);
  
  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter((cb) => cb !== callback);
  };
};

// Notify all listeners
const notifyListeners = () => {
  authListeners.forEach((callback) => callback(currentUser));
};

// Convert Firebase user to AuthUser
const convertUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName || user.email?.split('@')[0] || 'User',
  isGuest: false,
});

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    isGuestMode = false;
    const result = await signInWithEmailAndPassword(auth, email, password);
    currentUser = convertUser(result.user);
    notifyListeners();
    return currentUser;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Sign in error:', firebaseError);
    throw new Error(getErrorMessage(firebaseError.code));
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    isGuestMode = false;
    const result = await createUserWithEmailAndPassword(auth, email, password);
    currentUser = convertUser(result.user);
    notifyListeners();
    return currentUser;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Sign up error:', firebaseError);
    throw new Error(getErrorMessage(firebaseError.code));
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    isGuestMode = false;
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    currentUser = convertUser(result.user);
    notifyListeners();
    return currentUser;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Google sign in error:', firebaseError);
    throw new Error(getErrorMessage(firebaseError.code));
  }
};

// Play as guest (no account)
export const playAsGuest = (): void => {
  isGuestMode = true;
  currentUser = {
    uid: 'guest',
    email: null,
    displayName: 'Guest',
    isGuest: true,
  };
  notifyListeners();
};

// Sign out
export const logOut = async (): Promise<void> => {
  try {
    if (!isGuestMode) {
      await signOut(auth);
    }
    currentUser = null;
    isGuestMode = false;
    notifyListeners();
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

// Initialize auth state listener
export const initializeAuth = (): void => {
  onAuthStateChanged(auth, (user) => {
    if (user && !isGuestMode) {
      currentUser = convertUser(user);
      notifyListeners();
    } else if (!isGuestMode) {
      currentUser = null;
      notifyListeners();
    }
  });
};

// Get user-friendly error messages
const getErrorMessage = (code?: string): string => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/popup-closed-by-user':
      return 'Sign in cancelled';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please allow popups for this site.';
    default:
      return 'An error occurred. Please try again.';
  }
};

// Get display name for UI
export const getDisplayName = (): string => {
  if (!currentUser) return '';
  if (currentUser.isGuest) return 'Guest';
  return currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
};
