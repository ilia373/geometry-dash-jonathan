// User management for admin features
const STORAGE_KEY = 'geometry-dash-username';
const ADMIN_USER = 'InfinityCats';

export const getUsername = (): string => {
  return localStorage.getItem(STORAGE_KEY) || '';
};

export const setUsername = (username: string): void => {
  localStorage.setItem(STORAGE_KEY, username);
};

export const isAdmin = (): boolean => {
  return getUsername() === ADMIN_USER;
};

export const ADMIN_USERNAME = ADMIN_USER;
