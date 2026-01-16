import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions for Firestore
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockOnSnapshot = vi.fn();

// Mock Firebase modules before importing the service
vi.mock('../../config/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({ id: 'test-doc' })),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
}));

// Create controllable mock for authService
const mockGetCurrentUser = vi.fn<[], { uid: string; email: string | null; displayName: string | null; isGuest: boolean; isAdmin: boolean } | null>(() => null);
const mockIsGuest = vi.fn(() => true);
const mockOnAuthChange = vi.fn((callback: (user: unknown) => void) => {
  callback(null);
  return () => {};
});

// Mock authService
vi.mock('../authService', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  isGuest: () => mockIsGuest(),
  onAuthChange: (callback: (user: unknown) => void) => mockOnAuthChange(callback),
}));

// Import after mocks
import {
  loadUserData,
  saveUserData,
  subscribeToUserData,
  syncLocalToCloud,
  initializeFirestoreSync,
} from '../firestoreService';

describe('firestoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset to guest mode by default
    mockGetCurrentUser.mockReturnValue(null);
    mockIsGuest.mockReturnValue(true);
  });

  describe('loadUserData (guest)', () => {
    it('should load local data for guest users', async () => {
      localStorage.setItem('geometry-dash-coins', '250');
      const data = await loadUserData();
      expect(data?.coins).toBe(250);
    });

    it('should return default values for empty localStorage', async () => {
      const data = await loadUserData();
      expect(data?.coins).toBe(0);
      expect(data?.completedLevels).toEqual([]);
      expect(data?.selectedSkin).toBe('default');
      expect(data?.ownedSkins).toEqual(['default']);
    });

    it('should parse completed levels from localStorage', async () => {
      localStorage.setItem('geometry-dash-completed-levels', '[1, 2, 3]');
      const data = await loadUserData();
      expect(data?.completedLevels).toEqual([1, 2, 3]);
    });

    it('should parse owned skins from localStorage', async () => {
      localStorage.setItem('geometry-dash-owned-skins', '["default", "fire", "ice"]');
      const data = await loadUserData();
      expect(data?.ownedSkins).toEqual(['default', 'fire', 'ice']);
    });

    it('should parse best progress from localStorage', async () => {
      localStorage.setItem('geometry-dash-best-progress', '{"1": 100, "2": 50}');
      const data = await loadUserData();
      expect(data?.bestProgress).toEqual({ '1': 100, '2': 50 });
    });

    it('should get selected skin from localStorage', async () => {
      localStorage.setItem('geometry-dash-selected-skin', 'rainbow');
      const data = await loadUserData();
      expect(data?.selectedSkin).toBe('rainbow');
    });
  });

  describe('loadUserData (authenticated)', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockReturnValue({ uid: 'test-user-123', email: 'test@example.com', displayName: null, isGuest: false, isAdmin: false });
      mockIsGuest.mockReturnValue(false);
    });

    it('should load data from Firestore for authenticated users', async () => {
      const firestoreData = {
        coins: 1000,
        completedLevels: [1, 2, 3],
        bestProgress: { 1: 100 },
        selectedSkin: 'fire',
        ownedSkins: ['default', 'fire'],
        lastUpdated: Date.now(),
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => firestoreData,
      });

      const data = await loadUserData();
      expect(data?.coins).toBe(1000);
      expect(data?.completedLevels).toEqual([1, 2, 3]);
    });

    it('should create new document if not exists', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });
      mockSetDoc.mockResolvedValue(undefined);
      localStorage.setItem('geometry-dash-coins', '500');

      const data = await loadUserData();
      expect(mockSetDoc).toHaveBeenCalled();
      expect(data?.coins).toBe(500);
    });

    it('should fallback to local data on Firestore error', async () => {
      mockGetDoc.mockRejectedValue(new Error('Network error'));
      localStorage.setItem('geometry-dash-coins', '300');

      const data = await loadUserData();
      expect(data?.coins).toBe(300);
    });
  });

  describe('saveUserData (guest)', () => {
    it('should save coins to localStorage for guests', async () => {
      await saveUserData({ coins: 999 });
      expect(localStorage.getItem('geometry-dash-coins')).toBe('999');
    });

    it('should save completed levels to localStorage', async () => {
      await saveUserData({ completedLevels: [1, 2] });
      expect(localStorage.getItem('geometry-dash-completed-levels')).toBe('[1,2]');
    });

    it('should save selected skin to localStorage', async () => {
      await saveUserData({ selectedSkin: 'fire' });
      expect(localStorage.getItem('geometry-dash-selected-skin')).toBe('fire');
    });

    it('should save owned skins to localStorage', async () => {
      await saveUserData({ ownedSkins: ['default', 'ice'] });
      expect(localStorage.getItem('geometry-dash-owned-skins')).toBe('["default","ice"]');
    });

    it('should save best progress to localStorage', async () => {
      await saveUserData({ bestProgress: { 1: 75, 2: 50 } });
      expect(localStorage.getItem('geometry-dash-best-progress')).toBe('{"1":75,"2":50}');
    });
  });

  describe('saveUserData (authenticated)', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockReturnValue({ uid: 'test-user-123', email: 'test@example.com', displayName: null, isGuest: false, isAdmin: false });
      mockIsGuest.mockReturnValue(false);
    });

    it('should save data to Firestore for authenticated users', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await saveUserData({ coins: 1500 });
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should create document if updateDoc fails', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Document not found'));
      mockSetDoc.mockResolvedValue(undefined);

      await saveUserData({ coins: 1500 });
      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should fallback to localStorage if all Firestore operations fail', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Network error'));
      mockSetDoc.mockRejectedValue(new Error('Network error'));

      await saveUserData({ coins: 1500 });
      expect(localStorage.getItem('geometry-dash-coins')).toBe('1500');
    });
  });

  describe('subscribeToUserData (guest)', () => {
    it('should call callback with local data for guests', () => {
      localStorage.setItem('geometry-dash-coins', '500');
      const callback = vi.fn();
      subscribeToUserData(callback);
      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0].coins).toBe(500);
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToUserData(callback);
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('subscribeToUserData (authenticated)', () => {
    beforeEach(() => {
      mockGetCurrentUser.mockReturnValue({ uid: 'test-user-123', email: 'test@example.com', displayName: null, isGuest: false, isAdmin: false });
      mockIsGuest.mockReturnValue(false);
    });

    it('should set up Firestore snapshot listener', () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const callback = vi.fn();
      subscribeToUserData(callback);
      
      expect(mockOnSnapshot).toHaveBeenCalled();
    });

    it('should return unsubscribe function for Firestore listener', () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const callback = vi.fn();
      const unsubscribe = subscribeToUserData(callback);
      unsubscribe();
      
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('syncLocalToCloud', () => {
    it('should do nothing for guest users', async () => {
      await syncLocalToCloud();
      expect(mockGetDoc).not.toHaveBeenCalled();
    });

    it('should upload local data if no cloud data exists', async () => {
      mockGetCurrentUser.mockReturnValue({ uid: 'test-user-123', email: 'test@example.com', displayName: null, isGuest: false, isAdmin: false });
      mockIsGuest.mockReturnValue(false);
      mockGetDoc.mockResolvedValue({ exists: () => false });
      mockSetDoc.mockResolvedValue(undefined);
      mockUpdateDoc.mockResolvedValue(undefined);

      localStorage.setItem('geometry-dash-coins', '100');
      await syncLocalToCloud();
      
      // Should attempt to save local data to cloud
    });
  });

  describe('initializeFirestoreSync', () => {
    it('should not throw when called', () => {
      expect(() => initializeFirestoreSync()).not.toThrow();
    });

    it('should register auth change listener', () => {
      mockOnAuthChange.mockClear();
      initializeFirestoreSync();
      expect(mockOnAuthChange).toHaveBeenCalled();
    });
  });
});
