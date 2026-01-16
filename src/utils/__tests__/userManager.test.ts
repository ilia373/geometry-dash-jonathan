import { describe, it, expect, beforeEach } from 'vitest';
import { getUsername, setUsername, isAdmin, ADMIN_USERNAME } from '../userManager';

describe('userManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('ADMIN_USERNAME', () => {
    it('should be InfinityCats', () => {
      expect(ADMIN_USERNAME).toBe('InfinityCats');
    });
  });

  describe('getUsername', () => {
    it('should return empty string when no username is set', () => {
      expect(getUsername()).toBe('');
    });

    it('should return stored username', () => {
      localStorage.setItem('geometry-dash-username', 'TestUser');
      expect(getUsername()).toBe('TestUser');
    });
  });

  describe('setUsername', () => {
    it('should store username in localStorage', () => {
      setUsername('NewUser');
      expect(localStorage.getItem('geometry-dash-username')).toBe('NewUser');
    });

    it('should overwrite existing username', () => {
      setUsername('FirstUser');
      setUsername('SecondUser');
      expect(localStorage.getItem('geometry-dash-username')).toBe('SecondUser');
    });
  });

  describe('isAdmin', () => {
    it('should return false when no username is set', () => {
      expect(isAdmin()).toBe(false);
    });

    it('should return false for non-admin users', () => {
      setUsername('RegularUser');
      expect(isAdmin()).toBe(false);
    });

    it('should return true for admin user', () => {
      setUsername('InfinityCats');
      expect(isAdmin()).toBe(true);
    });

    it('should be case-sensitive', () => {
      setUsername('infinitycats');
      expect(isAdmin()).toBe(false);
    });
  });
});
