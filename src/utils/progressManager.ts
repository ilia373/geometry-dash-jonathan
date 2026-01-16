// Progress Manager for tracking level completion

const STORAGE_KEY = 'geometry-dash-progress';

interface ProgressData {
  completedLevels: number[];
}

const getDefaultProgress = (): ProgressData => ({
  completedLevels: [],
});

export const loadProgress = (): ProgressData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load progress:', error);
  }
  return getDefaultProgress();
};

export const saveProgress = (progress: ProgressData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

export const markLevelComplete = (levelId: number): void => {
  const progress = loadProgress();
  if (!progress.completedLevels.includes(levelId)) {
    progress.completedLevels.push(levelId);
    saveProgress(progress);
  }
};

export const isLevelUnlocked = (levelId: number): boolean => {
  // Level 1 is always unlocked
  if (levelId === 1) return true;
  
  // Other levels require the previous level to be completed
  const progress = loadProgress();
  return progress.completedLevels.includes(levelId - 1);
};

export const isLevelCompleted = (levelId: number): boolean => {
  const progress = loadProgress();
  return progress.completedLevels.includes(levelId);
};

export const resetProgress = (): void => {
  saveProgress(getDefaultProgress());
};
