export interface UniverseTheme {
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  accentColor: string;
  groundColorOverride: string;
  backgroundColorOverride: string;
}

export interface UniversePosition {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface UniverseConnection {
  from: string; // universe ID
  to: string;   // universe ID
}

export interface Universe {
  id: string;
  name: string;
  emoji: string;
  theme: UniverseTheme;
  levelIds: number[];
  position: UniversePosition;
  connections: string[]; // connected universe IDs
  comingSoon: boolean;
  requiredUniverseId: string | null;
}
