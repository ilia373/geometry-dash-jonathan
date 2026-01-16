import { useState, useEffect } from 'react';
import Menu from './components/Menu';
import Game from './components/Game';
import SkinSelector from './components/SkinSelector';
import { initializeAuth } from './utils/authService';
import { initializeFirestoreSync } from './utils/firestoreService';
import { initAnalytics } from './config/firebase';
import './App.css';

type Screen = 'menu' | 'game' | 'skins';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  // Initialize Firebase auth, Firestore sync, and Analytics
  useEffect(() => {
    initializeAuth();
    initializeFirestoreSync();
    initAnalytics().catch((error) => {
      console.error('Failed to initialize analytics', error);
    });
  }, []);

  const handleStartGame = (levelId: number) => {
    setCurrentLevel(levelId);
    setScreen('game');
  };

  const handleBackToMenu = () => {
    setScreen('menu');
  };

  const handleOpenSkins = () => {
    setScreen('skins');
  };

  return (
    <div className="app">
      {screen === 'menu' && (
        <Menu onStartGame={handleStartGame} onOpenSkins={handleOpenSkins} />
      )}
      {screen === 'game' && (
        <Game levelId={currentLevel} onBack={handleBackToMenu} />
      )}
      {screen === 'skins' && (
        <SkinSelector onBack={handleBackToMenu} />
      )}
    </div>
  );
}

export default App;
