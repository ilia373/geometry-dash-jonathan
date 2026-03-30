import type { Universe, UniverseConnection } from '../types/universe';

// Universe configuration - exactly 5 universes with themes, positions, and connections
export const UNIVERSES: Universe[] = [
  {
    id: 'milky-way',
    name: 'Milky Way',
    emoji: '🌌',
    levelIds: [1, 2, 3, 4, 5, 6, 7],
    comingSoon: false,
    requiredUniverseId: null,
    position: { x: 20, y: 50 },
    connections: ['andromeda'],
    theme: {
      primaryColor: '#5ee8b0',
      secondaryColor: '#3cbf8a',
      glowColor: '#5ee8b0',
      accentColor: '#1a5c40',
      groundColorOverride: '#1e4d38',
      backgroundColorOverride: '#0c1f18',
    },
  },
  {
    id: 'andromeda',
    name: 'Andromeda',
    emoji: '🌀',
    levelIds: [8, 9, 10, 11, 12, 13, 14, 15, 16],
    comingSoon: false,
    requiredUniverseId: 'milky-way',
    position: { x: 45, y: 30 },
    connections: ['nebula-vortex', 'cosmic-abyss'],
    theme: {
      primaryColor: '#9b59b6',
      secondaryColor: '#6c3483',
      glowColor: '#a855f7',
      accentColor: '#3d1a5c',
      groundColorOverride: '#2d1040',
      backgroundColorOverride: '#1a0a2e',
    },
  },
  {
    id: 'nebula-vortex',
    name: 'Nebula Vortex',
    emoji: '💫',
    levelIds: [],
    comingSoon: true,
    requiredUniverseId: 'andromeda',
    position: { x: 70, y: 20 },
    connections: ['quantum-realm'],
    theme: {
      primaryColor: '#ff69b4',
      secondaryColor: '#c2185b',
      glowColor: '#ff1493',
      accentColor: '#5c0a2e',
      groundColorOverride: '#3d1040',
      backgroundColorOverride: '#1e0a1e',
    },
  },
  {
    id: 'cosmic-abyss',
    name: 'Cosmic Abyss',
    emoji: '🕳️',
    levelIds: [],
    comingSoon: true,
    requiredUniverseId: 'andromeda',
    position: { x: 70, y: 60 },
    connections: ['quantum-realm'],
    theme: {
      primaryColor: '#dc143c',
      secondaryColor: '#8b0000',
      glowColor: '#ff2040',
      accentColor: '#4a0010',
      groundColorOverride: '#3d0010',
      backgroundColorOverride: '#1a0008',
    },
  },
  {
    id: 'quantum-realm',
    name: 'Quantum Realm',
    emoji: '⚛️',
    levelIds: [],
    comingSoon: true,
    requiredUniverseId: 'nebula-vortex',
    position: { x: 85, y: 40 },
    connections: [],
    theme: {
      primaryColor: '#00bcd4',
      secondaryColor: '#0097a7',
      glowColor: '#00e5ff',
      accentColor: '#003d4d',
      groundColorOverride: '#003d4d',
      backgroundColorOverride: '#001a1f',
    },
  },
];

// Flatten connections from UNIVERSES into a single array
// Each connection stored once (not bidirectional)
export const UNIVERSE_CONNECTIONS: UniverseConnection[] = UNIVERSES.reduce(
  (connections: UniverseConnection[], universe: Universe) => {
    universe.connections.forEach((connectedId: string) => {
      connections.push({
        from: universe.id,
        to: connectedId,
      });
    });
    return connections;
  },
  []
);

// Helper function to get a universe by ID
export const getUniverseById = (id: string): Universe | undefined =>
  UNIVERSES.find(u => u.id === id);

// Helper function to get the universe containing a specific level
export const getUniverseForLevel = (levelId: number): Universe | undefined =>
  UNIVERSES.find(u => u.levelIds.includes(levelId));

// Helper function to get all universe connections
export const getUniverseConnections = (): UniverseConnection[] =>
  UNIVERSE_CONNECTIONS;
