import type { Level } from '../types/game';
import { MILKY_WAY_LEVELS } from './levels/milkyWay';
import { ANDROMEDA_LEVELS } from './levels/andromeda';
import { NEBULA_VORTEX_LEVELS } from './levels/nebulaVortex';
import { QUANTUM_REALM_LEVELS } from './levels/quantumRealm';

export { GAME_CONFIG, QUANT_CONFIG, QUANT_HP_CONFIG } from './physicsConfig';

export { getNextQuantId, resetQuantIdCounter } from './levelFactories';

export const LEVELS: Level[] = [
  ...MILKY_WAY_LEVELS,

  ...ANDROMEDA_LEVELS,

  ...NEBULA_VORTEX_LEVELS,

  ...QUANTUM_REALM_LEVELS,
];

export { setColorOverride, getColorOverride, getCurrentLevel } from './levelAccessors';
