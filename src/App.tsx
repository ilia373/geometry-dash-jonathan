import { useState, useEffect } from 'react';
import Game from './components/Game';
import Shop from './components/Shop';
import SpaceMap from './components/SpaceMap';
import UniverseLevelSelector from './components/UniverseLevelSelector';
import FallInTransition from './components/FallInTransition';
import { initializeAuth } from './utils/authService';
import { initializeFirestoreSync } from './utils/firestoreService';
import { syncWeaponsFromCloud } from './utils/weaponManager';
import { syncUniversesFromCloud } from './utils/universeManager';
import { getUniverseById } from './constants/universeConfig';
import { setColorOverride } from './constants/gameConfig';
import { initAnalytics } from './config/firebase';
import type { CheatState } from './types/cheats';
import { defaultCheatState } from './types/cheats';
import './App.css';

type Screen = 'space-map' | 'universe' | 'game' | 'shop';

function App() {
  const [screen, setScreen] = useState<Screen>('space-map');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentCheats, setCurrentCheats] = useState<CheatState>(defaultCheatState);
  const [currentUniverseId, setCurrentUniverseId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  useEffect(() => {
    initializeAuth();
    initializeFirestoreSync();
    syncWeaponsFromCloud().catch(() => {});
    syncUniversesFromCloud().catch(() => {});
    initAnalytics().catch((error) => {
      console.error('Failed to initialize analytics', error);
    });
  }, []);

  const handleSelectUniverse = (id: string) => {
    setCurrentUniverseId(id);
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setScreen('universe');
  };

  const handleStartGame = (levelId: number, cheats: CheatState) => {
    const universe = currentUniverseId ? getUniverseById(currentUniverseId) : undefined;
    if (universe) {
      setColorOverride({
        groundColor: universe.theme.groundColorOverride,
        backgroundColor: universe.theme.backgroundColorOverride,
      });
    }
    setCurrentLevel(levelId);
    setCurrentCheats(cheats);
    setScreen('game');
  };

  const handleBackFromGame = () => {
    setColorOverride(null);
    setScreen('universe');
  };

  const handleBackToMap = () => {
    setColorOverride(null);
    setCurrentUniverseId(null);
    setScreen('space-map');
  };

  const handleOpenShop = () => {
    setScreen('shop');
  };

  const transitionTheme = currentUniverseId
    ? getUniverseById(currentUniverseId)?.theme
    : undefined;

  return (
    <div className="app">
      {screen === 'space-map' && (
        <SpaceMap
          onSelectUniverse={handleSelectUniverse}
          onOpenShop={handleOpenShop}
        />
      )}
      {screen === 'universe' && currentUniverseId && (
        <UniverseLevelSelector
          universeId={currentUniverseId}
          onStartGame={handleStartGame}
          onBack={handleBackToMap}
          onOpenShop={handleOpenShop}
        />
      )}
      {screen === 'game' && (
        <Game
          levelId={currentLevel}
          onBack={handleBackFromGame}
          cheats={currentCheats}
        />
      )}
      {screen === 'shop' && (
        <Shop onBack={handleBackToMap} />
      )}
      <FallInTransition
        isActive={isTransitioning}
        universeTheme={transitionTheme}
        onComplete={handleTransitionComplete}
      />
    </div>
  );
}

export default App;
