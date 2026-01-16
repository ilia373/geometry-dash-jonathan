// Wallet Manager for tracking coins

const STORAGE_KEY = 'geometry-dash-wallet';

interface WalletData {
  totalCoins: number;
}

const getDefaultWallet = (): WalletData => ({
  totalCoins: 0,
});

export const loadWallet = (): WalletData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load wallet:', error);
  }
  return getDefaultWallet();
};

export const saveWallet = (wallet: WalletData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  } catch (error) {
    console.error('Failed to save wallet:', error);
  }
};

export const addCoins = (amount: number): void => {
  const wallet = loadWallet();
  wallet.totalCoins += amount;
  saveWallet(wallet);
};

export const getTotalCoins = (): number => {
  return loadWallet().totalCoins;
};

export const spendCoins = (amount: number): boolean => {
  const wallet = loadWallet();
  if (wallet.totalCoins >= amount) {
    wallet.totalCoins -= amount;
    saveWallet(wallet);
    return true;
  }
  return false;
};

export const resetWallet = (): void => {
  saveWallet(getDefaultWallet());
};
