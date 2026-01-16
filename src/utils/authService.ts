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

/**
 * List of super admin emails
 * These users get admin custom claims set by the Cloud Function
 */
const SUPER_ADMIN_EMAILS = [
  'ilia209@gmail.com',
];

/**
 * Check if an email is a super admin
 * Used for UI hints only - actual admin verification is done server-side
 */
export const isSuperAdmin = (email: string | undefined): boolean => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * SECURITY NOTE: Admin privileges are managed server-side via Firebase Custom Claims.
 * 
 * The admin claim is set by a Cloud Function (functions/src/index.ts) that runs
 * on every sign-in. The claim is cryptographically signed in the JWT token and
 * verified by Firestore security rules.
 * 
 * Client-side admin check is ONLY for UI purposes (showing/hiding admin panel).
 * Actual security is enforced by Firestore rules checking `request.auth.token.admin`.
 */

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isGuest: boolean;
  isAdmin: boolean; // From custom claims - for UI only
}

// Current auth state
let currentUser: AuthUser | null = null;
let isGuestMode = false;
let authListeners: ((user: AuthUser | null) => void)[] = [];

/**
 * Check if current user is admin
 * 
 * SECURITY: This is for UI purposes only (showing admin panel).
 * Server-side security is enforced via Firestore rules checking the custom claim.
 * The claim is set by a Cloud Function and cannot be forged client-side.
 */
export const isAdmin = (): boolean => {
  if (isGuestMode) return false;
  if (!currentUser) return false;
  return currentUser.isAdmin;
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

/**
 * Convert Firebase user to AuthUser, including admin claim check
 * 
 * The admin claim is set by a blocking Cloud Function on sign-in.
 * We read it from the ID token result.
 */
const convertUser = async (user: User): Promise<AuthUser> => {
  // Get ID token result to access custom claims
  let isAdminUser = false;
  try {
    const idTokenResult = await user.getIdTokenResult();
    isAdminUser = idTokenResult.claims.admin === true;
  } catch (error) {
    console.error('Error getting ID token claims:', error);
  }
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    isGuest: false,
    isAdmin: isAdminUser,
  };
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    isGuestMode = false;
    const result = await signInWithEmailAndPassword(auth, email, password);
    currentUser = await convertUser(result.user);
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
    currentUser = await convertUser(result.user);
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
    currentUser = await convertUser(result.user);
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
    isAdmin: false, // Guests are never admins
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
  onAuthStateChanged(auth, async (user) => {
    if (user && !isGuestMode) {
      currentUser = await convertUser(user);
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
