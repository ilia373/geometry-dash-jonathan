// Admin Overrides — session-local toggles for admin testing
// NOT persisted to localStorage or Firestore; resets on page refresh (intended behavior)

let unlockAllOverride = false;

export const getUnlockAllLevels = (): boolean => unlockAllOverride;

export const setUnlockAllLevels = (val: boolean): void => {
  unlockAllOverride = val;
};

export const resetAdminOverrides = (): void => {
  unlockAllOverride = false;
};
