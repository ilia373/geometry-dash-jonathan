export { MILKY_WAY_LEVELS } from './milkyWay';
export { ANDROMEDA_LEVELS } from './andromeda';
export { NEBULA_VORTEX_LEVELS } from './nebulaVortex';
export { QUANTUM_REALM_LEVELS } from './quantumRealm';

import { MILKY_WAY_LEVELS } from './milkyWay';
import { ANDROMEDA_LEVELS } from './andromeda';
import { NEBULA_VORTEX_LEVELS } from './nebulaVortex';
import { QUANTUM_REALM_LEVELS } from './quantumRealm';
import type { Level } from '../../types/game';

export const ALL_LEVELS: Level[] = [
  ...MILKY_WAY_LEVELS,
  ...ANDROMEDA_LEVELS,
  ...NEBULA_VORTEX_LEVELS,
  ...QUANTUM_REALM_LEVELS,
];
