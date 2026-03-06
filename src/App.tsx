import { useState, useEffect } from 'react';
import Menu from './components/Menu';
import Game from './components/Game';
import Shop from './components/Shop';
import { initializeAuth } from './utils/authService';
import { initializeFirestoreSync } from './utils/firestoreService';
import { syncWeaponsFromCloud } from './utils/weaponManager';
import { initAnalytics } from './config/firebase';
import type { CheatState } from './types/cheats';
import { defaultCheatState } from './types/cheats';
import './App.css';

type Screen = 'menu' | 'game' | 'shop';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentCheats, setCurrentCheats] = useState<CheatState>(defaultCheatState);

  // Initialize Firebase auth, Firestore sync, and Analytics
  useEffect(() => {
    initializeAuth();
    initializeFirestoreSync();
    syncWeaponsFromCloud().catch(() => {});
    initAnalytics().catch((error) => {
      console.error('Failed to initialize analytics', error);
    });
  }, []);

  const handleStartGame = (levelId: number, cheats: CheatState) => {
    setCurrentLevel(levelId);
    setCurrentCheats(cheats);
    setScreen('game');
  };

  const handleBackToMenu = () => {
    setScreen('menu');
  };

  const handleOpenShop = () => {
    setScreen('shop');
  };

  return (
    <div className="app">
      {screen === 'menu' && (
        <Menu onStartGame={handleStartGame} onOpenShop={handleOpenShop} />
      )}
      {screen === 'game' && (
        <Game levelId={currentLevel} onBack={handleBackToMenu} cheats={currentCheats} />
      )}
      {screen === 'shop' && (
        <Shop onBack={handleBackToMenu} />
      )}
    </div>
  );
}

export default App;
