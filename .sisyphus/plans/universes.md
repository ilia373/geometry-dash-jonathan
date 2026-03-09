# Universes System — Space Map & Universe Progression

## TL;DR

> **Quick Summary**: Add a Universes system where the new home screen is a 2D pannable space map showing 5 universe nodes connected by glowing paths. Users explore the map, select an unlocked universe (Milky Way), "fall into" it via a quick animation, and then select levels (planets) within it. Universe completion is persisted via localStorage/Firestore. The existing 6 levels become planets in the Milky Way universe; universes 2-5 display as "Coming Soon".
> 
> **Deliverables**:
> - Universe type definitions and configuration (5 universes with themes, colors, positions, connections)
> - SpaceMap component — 2D pannable HTML/CSS star map (home screen)
> - UniverseLevelSelector component — level selection within universe context with dual planet/level naming
> - Universe manager — persistence layer following existing manager cache pattern
> - Fall-in CSS animation (1-2s transition when entering a universe)
> - Universe color palette system overriding level colors during gameplay
> - Full Firestore/localStorage integration for universe unlock tracking
> - Tests for all new modules
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves + final verification
> **Critical Path**: Types → Config + Manager → SpaceMap + LevelSelector → App Integration → Verification

---

## Context

### Original Request
Add a "Universes" system to the Geometry Dash clone. Each universe is a collection of 6-10 levels (planets). The UI should be a pathway/tree layout with branching. Selecting a universe triggers a "falling into" animation before showing levels. Completion must persist across sessions. The existing 6 levels become part of the first universe (Milky Way).

### Interview Summary
**Key Discussions**:
- **Universe structure**: 5 universes — Milky Way (playable, 6 existing levels), Andromeda, Nebula Vortex, Cosmic Abyss, Quantum Realm (all "Coming Soon")
- **Map style**: 2D free-explore space map (not pathway/tree). User pans around to discover universes.
- **Connections**: Visible glowing paths between connected universe nodes
- **Entry animation**: Quick 1-2s fall-in transition (zoom + fade)
- **Branching**: User picks one path (can return to explore other branches later)
- **Naming**: Dual naming — "Mars — Stereo Madness" (planet name + level name)
- **Color override**: Each universe defines a color palette that overrides level groundColor/backgroundColor during gameplay
- **Home screen**: Space map replaces the current Menu as the entry point
- **Content scope**: Framework only — no new level content for universes 2-5
- **Tests**: After implementation (vitest exists with good coverage)

**Research Findings**:
- 6 levels exist: Stereo Madness (id:1), Back on Track (id:2), Polargeist (id:3), Dry Out (id:4), Base After Base (id:5), Cant Let Go (id:6)
- Levels defined as flat `LEVELS[]` array in `src/constants/gameConfig.ts` with id, name, groundColor, backgroundColor, length, obstacles[], quants[]
- Progress tracked as `completedLevels: number[]` in `src/utils/progressManager.ts` — localStorage for guests, Firestore for auth users
- `UserData` in `src/utils/firestoreService.ts` — dual storage with merge on login
- App.tsx uses `Screen = 'menu' | 'game' | 'shop'` state routing, no React Router
- UI: neon glass-morphism with CSS keyframe animations, dark backgrounds, gradient orbs
- Manager pattern: module-level cache → localStorage → optional Firestore (wallet/progress/skin all identical)
- Game.tsx deep-clones level on mount: `JSON.parse(JSON.stringify(getCurrentLevel(levelId)))` (line 93)
- `getCurrentLevel(levelId)` returns `LEVELS.find(l => l.id === levelId)` (lines 489-491)

### Metis Review
**Identified Gaps** (addressed):
- **SpaceMap implementation**: Recommended HTML/CSS (not Canvas) for consistency with codebase. Adopted.
- **Navigation stack**: Need to track screen history for proper back-navigation. Adopted via `previousScreen` state.
- **Top bar elements**: Auth, coins, shop button need to appear on SpaceMap too. Adopted — SpaceMap includes top bar.
- **Game color override approach**: Cannot modify Game.tsx. Override applied via modified `getCurrentLevel()` that accepts optional color overrides. Adopted.
- **Migration safety**: `unlockedUniverses` field defaults to `['milky-way']` when missing from existing data. Adopted.
- **Animation race condition**: Disable universe clicks during fall-in transition via `isTransitioning` state. Adopted.
- **Firestore merge**: `unlockedUniverses` uses union-of-arrays merge (same as `completedLevels`). Adopted.

---

## Work Objectives

### Core Objective
Transform the game's navigation architecture from a flat menu into a universe-based exploration system, where a 2D space map is the home screen and levels are organized into themed universes with persistent progression.

### Concrete Deliverables
- `src/types/universe.ts` — Universe, UniverseTheme, UniverseConnection interfaces
- `src/constants/universeConfig.ts` — 5 universe definitions with themes, positions, connections
- `src/components/SpaceMap.tsx` + `SpaceMap.css` — Pannable star map (home screen)
- `src/components/UniverseLevelSelector.tsx` + `UniverseLevelSelector.css` — Level selector within universe
- `src/utils/universeManager.ts` — Universe unlock persistence (cache + localStorage + Firestore)
- Modified `src/App.tsx` — New screen routing with universe flow
- Modified `src/utils/firestoreService.ts` — `unlockedUniverses` in UserData
- Modified `src/constants/gameConfig.ts` — `planetName` on levels, `getCurrentLevel` override support
- Modified `src/types/game.ts` — `planetName` field on Level interface
- Tests for all new files

### Definition of Done
- [ ] `npm run build` exits 0 (no TypeScript errors)
- [ ] `npm run test:run` exits 0 (all tests pass including existing)
- [ ] `npm run lint` exits 0 (no lint errors)
- [ ] App starts on SpaceMap screen showing 5 universe nodes
- [ ] Milky Way is clickable, triggers fall-in animation, shows 6 levels with planet names
- [ ] Coming Soon universes show locked state, are not clickable
- [ ] Level completion in Milky Way persists across page reloads
- [ ] Universe unlock state persists via localStorage (guest) and Firestore (auth)
- [ ] Universe color palette overrides gameplay background colors

### Must Have
- SpaceMap as home screen with all 5 universe nodes visible
- Glowing connection paths between universe nodes
- Fall-in animation (1-2s) when entering a universe
- Dual naming (planet + level) on level cards
- Universe color palette override during gameplay
- Persistence of unlocked universes (localStorage + Firestore)
- Back navigation: Game → Level Selector → SpaceMap
- Coming Soon state for universes 2-5
- Top bar (coins, auth, shop) accessible from SpaceMap
- Touch support for map panning (basic, no pinch-zoom)

### Must NOT Have (Guardrails)
- **No Canvas for SpaceMap** — Use HTML/CSS with CSS transform panning only
- **No React Router or Context API** — Keep existing `useState<Screen>` pattern
- **No modifications to Game.tsx** — Color override applied before Game receives level data
- **No modifications to gameRenderer.ts or gamePhysics.ts** — Gameplay engine untouched
- **No new level content** — Universes 2-5 have no obstacles/quants, only metadata
- **No zoom on SpaceMap** — Pan only (no pinch-to-zoom complexity)
- **No new sound effects or audio assets**
- **No changes to existing level IDs** — Levels 1-6 keep their IDs
- **No changes to `completedLevels: number[]` format** — Universe membership is config lookup
- **No momentum/inertia on map panning** — Simple drag-to-pan only
- **No particle effects on SpaceMap** — CSS keyframe animations for stars only
- **No orbital planet animations** — Static node positions with glow/pulse CSS
- **No achievement/rating system** — Just unlock tracking
- **No over-abstraction** — Direct, simple implementations. No "UniverseProviderContext" or similar

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (vitest + React Testing Library)
- **Automated tests**: YES (tests-after)
- **Framework**: vitest
- **Coverage targets**: 85% lines, 85% statements, 85% branches, 70% functions (matching project thresholds)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **Utility modules**: Use Bash (vitest) — Run tests, verify coverage
- **Build verification**: Use Bash — `npm run build`, `npm run lint`, `npm run test:run`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — types foundation):
├── Task 1: Universe type definitions [quick]
└── Task 2: Add planetName to Level interface [quick]

Wave 2 (After Wave 1 — config + manager + components, MAX PARALLEL):
├── Task 3: Universe configuration data [quick]
├── Task 4: Universe manager + persistence [unspecified-high]
├── Task 5: Firestore integration for universes [quick]

Wave 3 (After Wave 2 — UI components, PARALLEL):
├── Task 6: SpaceMap component + CSS [visual-engineering]
├── Task 7: Universe Level Selector component + CSS [visual-engineering]
├── Task 8: Fall-in animation component [quick]

Wave 4 (After Wave 3 — integration):
├── Task 9: App.tsx routing integration [deep]
├── Task 10: Universe color override system [unspecified-high]

Wave 5 (After Wave 4 — tests):
├── Task 11: Tests for universeManager [unspecified-high]
├── Task 12: Tests for SpaceMap component [unspecified-high]
├── Task 13: Tests for UniverseLevelSelector [unspecified-high]

Wave FINAL (After ALL tasks — independent review, 4 parallel):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review [unspecified-high]
├── Task F3: Real QA via Playwright [unspecified-high]
└── Task F4: Scope fidelity check [deep]

Critical Path: Task 1 → Task 3 → Task 6 → Task 9 → Task 11 → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 3 (Waves 2, 3, 5)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 3, 4, 5, 6, 7 | 1 |
| 2 | — | 7, 9, 10 | 1 |
| 3 | 1 | 4, 6, 7, 9, 10 | 2 |
| 4 | 1, 3 | 9 | 2 |
| 5 | 1 | 4, 9 | 2 |
| 6 | 1, 3 | 9 | 3 |
| 7 | 1, 2, 3 | 9 | 3 |
| 8 | — | 9 | 3 |
| 9 | 4, 5, 6, 7, 8 | 10, 11, 12, 13 | 4 |
| 10 | 2, 3, 9 | 11 | 4 |
| 11 | 4, 9 | F1-F4 | 5 |
| 12 | 6, 9 | F1-F4 | 5 |
| 13 | 7, 9 | F1-F4 | 5 |

### Agent Dispatch Summary

- **Wave 1**: **2 tasks** — T1 → `quick`, T2 → `quick`
- **Wave 2**: **3 tasks** — T3 → `quick`, T4 → `unspecified-high`, T5 → `quick`
- **Wave 3**: **3 tasks** — T6 → `visual-engineering` + `frontend-ui-ux`, T7 → `visual-engineering` + `frontend-ui-ux`, T8 → `quick`
- **Wave 4**: **2 tasks** — T9 → `deep`, T10 → `unspecified-high`
- **Wave 5**: **3 tasks** — T11 → `unspecified-high`, T12 → `unspecified-high`, T13 → `unspecified-high`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` + `playwright`, F4 → `deep`

---

## TODOs

- [ ] 1. Create Universe Type Definitions

  **What to do**:
  - Create `src/types/universe.ts` with the following interfaces:
    - `UniverseTheme`: `{ primaryColor: string, secondaryColor: string, glowColor: string, accentColor: string, groundColorOverride: string, backgroundColorOverride: string }`
    - `UniversePosition`: `{ x: number, y: number }` (percentage-based positioning on map, 0-100)
    - `UniverseConnection`: `{ from: string, to: string }` (universe IDs)
    - `Universe`: `{ id: string, name: string, emoji: string, theme: UniverseTheme, levelIds: number[], position: UniversePosition, connections: string[], comingSoon: boolean, requiredUniverseId: string | null }`
  - Export all interfaces

  **Must NOT do**:
  - Do not add any runtime logic, only type definitions
  - Do not import from other modules (pure types file)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, pure type definitions, very straightforward
  - **Skills**: []
    - No special skills needed for type definitions
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No visual work involved

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5, 6, 7
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `src/types/game.ts:1-43` — Existing type definition patterns (Position, Dimensions, Level, Obstacle interfaces). Follow the same style: interface with JSDoc-style inline comments, explicit field types, no utility types.
  - `src/types/skins.ts:1-30` — How theme colors are structured (primary, secondary, accent, glow fields). Reuse same color property naming.
  - `src/types/cheats.ts` — Simple interface + default export pattern.

  **API/Type References**:
  - `src/types/game.ts:35-43` — The `Level` interface that Universe.levelIds references. Level IDs are numbers (1-6 currently).

  **Acceptance Criteria**:

  - [ ] File exists at `src/types/universe.ts`
  - [ ] `npm run build` passes with no TypeScript errors
  - [ ] All 4 interfaces exported: Universe, UniverseTheme, UniversePosition, UniverseConnection

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Type file compiles and exports correctly
    Tool: Bash
    Preconditions: Project builds currently
    Steps:
      1. Run `npm run build`
      2. Verify exit code is 0
      3. Run `grep -c "export interface" src/types/universe.ts`
    Expected Result: Build succeeds. grep returns 4 (four exported interfaces).
    Failure Indicators: Build fails with TS errors, or fewer than 4 interfaces exported.
    Evidence: .sisyphus/evidence/task-1-type-compilation.txt

  Scenario: Interfaces have correct required fields
    Tool: Bash
    Preconditions: File created
    Steps:
      1. Run `grep "id: string" src/types/universe.ts`
      2. Run `grep "primaryColor: string" src/types/universe.ts`
      3. Run `grep "levelIds: number" src/types/universe.ts`
      4. Run `grep "comingSoon: boolean" src/types/universe.ts`
    Expected Result: All 4 grep commands find matches.
    Failure Indicators: Any grep returns empty (missing field).
    Evidence: .sisyphus/evidence/task-1-interface-fields.txt
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `feat(types): add Universe type definitions and planetName to Level interface`
  - Files: `src/types/universe.ts`, `src/types/game.ts`
  - Pre-commit: `npm run build`

---

- [ ] 2. Add planetName Field to Level Interface

  **What to do**:
  - In `src/types/game.ts`, add `planetName?: string` field to the `Level` interface (optional so existing code doesn't break)
  - In `src/constants/gameConfig.ts`, add `planetName` to each of the 6 level definitions:
    - Level 1 (Stereo Madness): `planetName: 'Mercury'`
    - Level 2 (Back on Track): `planetName: 'Venus'`
    - Level 3 (Polargeist): `planetName: 'Earth'`
    - Level 4 (Dry Out): `planetName: 'Mars'`
    - Level 5 (Base After Base): `planetName: 'Jupiter'`
    - Level 6 (Cant Let Go): `planetName: 'Saturn'`
  - Modify `getCurrentLevel` function signature to accept optional color overrides:
    ```typescript
    export const getCurrentLevel = (
      levelId: number,
      colorOverride?: { groundColor?: string; backgroundColor?: string }
    ): Level | undefined => {
      const level = LEVELS.find(l => l.id === levelId);
      if (level && colorOverride) {
        return {
          ...level,
          groundColor: colorOverride.groundColor ?? level.groundColor,
          backgroundColor: colorOverride.backgroundColor ?? level.backgroundColor,
        };
      }
      return level;
    };
    ```

  **Must NOT do**:
  - Do not change level IDs, names, obstacles, or quants
  - Do not make planetName required (would break existing tests)
  - Do not modify Game.tsx
  - Do not change the return type of getCurrentLevel

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small modifications to two existing files, straightforward additions
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No visual work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 7, 9, 10
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/types/game.ts:35-43` — Current Level interface definition. Add `planetName?: string` after the `name` field.
  - `src/constants/gameConfig.ts:121-165` — Level 1 definition showing where to add planetName (after `name` field, line ~124).
  - `src/constants/gameConfig.ts:489-491` — Current `getCurrentLevel` function to modify.

  **API/Type References**:
  - `src/components/Game.tsx:93` — Where `getCurrentLevel(levelId)` is called. The optional override parameter means this call still works unchanged.

  **Test References**:
  - `src/utils/__tests__/progressManager.test.ts` — Existing tests that reference levels. Must still pass.

  **Acceptance Criteria**:

  - [ ] `Level` interface in `src/types/game.ts` has `planetName?: string` field
  - [ ] All 6 levels in `src/constants/gameConfig.ts` have `planetName` set
  - [ ] `getCurrentLevel` accepts optional `colorOverride` parameter
  - [ ] `getCurrentLevel(1)` still returns the same Level (backward compatible)
  - [ ] `getCurrentLevel(1, { groundColor: '#ff0000' })` returns level with overridden groundColor
  - [ ] `npm run build` passes
  - [ ] `npm run test:run` passes (existing tests unbroken)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Backward compatibility — existing getCurrentLevel usage works
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Run `npm run build`
      2. Run `npm run test:run`
    Expected Result: Both commands exit 0. No test failures.
    Failure Indicators: Build fails or any existing test fails.
    Evidence: .sisyphus/evidence/task-2-backward-compat.txt

  Scenario: Planet names are correctly assigned
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Run `grep "planetName:" src/constants/gameConfig.ts | wc -l`
      2. Run `grep "Mercury" src/constants/gameConfig.ts`
      3. Run `grep "Saturn" src/constants/gameConfig.ts`
    Expected Result: 6 planetName entries found. Mercury and Saturn present.
    Failure Indicators: Fewer than 6 planetName entries or missing names.
    Evidence: .sisyphus/evidence/task-2-planet-names.txt

  Scenario: Color override works in getCurrentLevel
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Create a quick inline test: `npx tsx -e "import { getCurrentLevel } from './src/constants/gameConfig'; const l = getCurrentLevel(1, { groundColor: '#ff0000' }); console.log(l?.groundColor === '#ff0000' ? 'PASS' : 'FAIL');"`
      2. If tsx not available, verify via build success and grep for colorOverride in the function
    Expected Result: Color override applied correctly. PASS output.
    Failure Indicators: FAIL output or function doesn't accept override.
    Evidence: .sisyphus/evidence/task-2-color-override.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `feat(types): add Universe type definitions and planetName to Level interface`
  - Files: `src/types/game.ts`, `src/constants/gameConfig.ts`
  - Pre-commit: `npm run build && npm run test:run`

---

- [ ] 3. Create Universe Configuration Data

  **What to do**:
  - Create `src/constants/universeConfig.ts` with:
    - `UNIVERSES: Universe[]` array containing 5 universe definitions:
      1. **Milky Way**: `id: 'milky-way'`, `emoji: '🌌'`, `levelIds: [1,2,3,4,5,6]`, `comingSoon: false`, `requiredUniverseId: null`, `position: { x: 20, y: 50 }`, connections to `['andromeda']`, theme: deep blue/green (#00ff88 green glow, #0f0f1a bg)
      2. **Andromeda**: `id: 'andromeda'`, `emoji: '🌀'`, `levelIds: []`, `comingSoon: true`, `requiredUniverseId: 'milky-way'`, `position: { x: 45, y: 30 }`, connections to `['nebula-vortex', 'cosmic-abyss']`, theme: purple/violet
      3. **Nebula Vortex**: `id: 'nebula-vortex'`, `emoji: '💫'`, `levelIds: []`, `comingSoon: true`, `requiredUniverseId: 'andromeda'`, `position: { x: 70, y: 20 }`, theme: pink/magenta
      4. **Cosmic Abyss**: `id: 'cosmic-abyss'`, `emoji: '🕳️'`, `levelIds: []`, `comingSoon: true`, `requiredUniverseId: 'andromeda'`, `position: { x: 70, y: 60 }`, theme: dark red/crimson
      5. **Quantum Realm**: `id: 'quantum-realm'`, `emoji: '⚛️'`, `levelIds: []`, `comingSoon: true`, `requiredUniverseId: 'nebula-vortex'`, `position: { x: 85, y: 40 }`, theme: cyan/electric blue
    - `UNIVERSE_CONNECTIONS: UniverseConnection[]` — derived from universe connection fields for easy rendering
    - Helper functions:
      - `getUniverseById(id: string): Universe | undefined`
      - `getUniverseForLevel(levelId: number): Universe | undefined`
      - `getUniverseConnections(): UniverseConnection[]`

  **Must NOT do**:
  - Do not create level content (obstacles/quants) for Coming Soon universes
  - Do not modify existing LEVELS array structure
  - Do not add more than 5 universes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration data file, no complex logic
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No visual work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 4, 6, 7, 9, 10
  - **Blocked By**: Task 1 (needs Universe type)

  **References**:

  **Pattern References**:
  - `src/constants/gameConfig.ts:121-491` — How LEVELS array is structured (static array of typed objects with helper functions). Follow same pattern for UNIVERSES.
  - `src/constants/gameConfig.ts:489-491` — `getCurrentLevel` helper pattern to follow for `getUniverseById`.

  **API/Type References**:
  - `src/types/universe.ts` (from Task 1) — Universe, UniverseTheme, UniversePosition, UniverseConnection interfaces to implement

  **Acceptance Criteria**:

  - [ ] File exists at `src/constants/universeConfig.ts`
  - [ ] `UNIVERSES.length === 5`
  - [ ] Milky Way has `levelIds: [1,2,3,4,5,6]` and `comingSoon: false`
  - [ ] All other universes have `comingSoon: true` and empty `levelIds`
  - [ ] `getUniverseById('milky-way')` returns Milky Way
  - [ ] `getUniverseForLevel(1)` returns Milky Way
  - [ ] Branching: Andromeda connects to both Nebula Vortex and Cosmic Abyss
  - [ ] `npm run build` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Universe config compiles and has correct data
    Tool: Bash
    Preconditions: Task 1 complete
    Steps:
      1. Run `npm run build`
      2. Run `grep -c "comingSoon: true" src/constants/universeConfig.ts`
      3. Run `grep -c "comingSoon: false" src/constants/universeConfig.ts`
    Expected Result: Build succeeds. 4 Coming Soon universes, 1 not Coming Soon.
    Failure Indicators: Build fails or wrong counts.
    Evidence: .sisyphus/evidence/task-3-config-data.txt

  Scenario: Branching structure is correct
    Tool: Bash
    Preconditions: Config file created
    Steps:
      1. Run `grep "nebula-vortex" src/constants/universeConfig.ts`
      2. Run `grep "cosmic-abyss" src/constants/universeConfig.ts`
      3. Verify Andromeda's connections include both
    Expected Result: Andromeda connects to Nebula Vortex and Cosmic Abyss (branch point).
    Failure Indicators: Missing connections or wrong universe IDs.
    Evidence: .sisyphus/evidence/task-3-branching.txt
  ```

  **Commit**: YES (groups with Tasks 4, 5)
  - Message: `feat(universe): add universe config, manager, and Firestore integration`
  - Files: `src/constants/universeConfig.ts`
  - Pre-commit: `npm run build`

---

- [ ] 4. Create Universe Manager (Persistence Layer)

  **What to do**:
  - Create `src/utils/universeManager.ts` following the **exact** manager cache pattern from `progressManager.ts`:
    - Module-level cache: `let cachedUnlockedUniverses: string[] = []`, `let cacheInitialized: boolean = false`
    - `STORAGE_KEY = 'geometry-dash-unlocked-universes'`
    - `syncUniversesFromCloud()`: Load from Firestore (auth) or localStorage (guest). Default to `['milky-way']` if empty/missing.
    - `getUnlockedUniverses(): string[]`: Return cached array (lazy-init from localStorage if not initialized)
    - `unlockUniverse(id: string)`: Add to cache, persist to localStorage/Firestore
    - `isUniverseUnlocked(id: string): boolean`: Check if ID is in cached array
    - `isUniverseCompleted(universeId: string): boolean`: Check if ALL levelIds for that universe are in `completedLevels` from progressManager
    - `getUniverseCompletion(universeId: string): { completed: number, total: number }`: Count completed levels / total levels
    - `setUnlockedUniverses(ids: string[])`: Direct setter (used by firestoreService during sync)
    - `resetUniverseCache()`: Clear cache (for testing and sign-out)
  - Import from: `firestoreService` (saveUserData, loadUserData), `authService` (getCurrentUser, isGuest), `progressManager` (getCompletedLevels), `universeConfig` (UNIVERSES, getUniverseById)

  **Must NOT do**:
  - Do not deviate from the existing manager cache pattern
  - Do not add complex universe unlock logic beyond "previous universe completed"
  - Do not modify progressManager.ts

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Persistence logic with multiple functions, cache pattern, Firestore integration
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Backend/utility module

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 1, 3 (needs types and universe config for levelIds lookup)

  **References**:

  **Pattern References**:
  - `src/utils/progressManager.ts:1-119` — **PRIMARY PATTERN**. Follow this file's exact structure: STORAGE_KEY, module-level cache vars, sync function, get/set/check functions, reset. Copy the cache initialization pattern (lazy-init in getters if not initialized).
  - `src/utils/walletManager.ts:1-64` — Second reference for the same manager pattern. Shows addCoins (similar to unlockUniverse) and syncWalletFromCloud pattern.
  - `src/utils/AGENTS.md` — Documents the manager cache pattern explicitly: "cache → null initially → get*() reads localStorage → set*() updates cache + localStorage + Firestore → sync*() on auth change → reset*() on sign-out"

  **API/Type References**:
  - `src/utils/firestoreService.ts:95-119` — `saveUserData(data: Partial<UserData>)` function to call for persistence
  - `src/utils/firestoreService.ts:58-92` — `loadUserData()` function to call for loading
  - `src/utils/authService.ts` — `getCurrentUser()` and `isGuest()` imports
  - `src/utils/progressManager.ts:84-95` — `getCompletedLevels()` to check level completion

  **Acceptance Criteria**:

  - [ ] File exists at `src/utils/universeManager.ts`
  - [ ] All functions exported: syncUniversesFromCloud, getUnlockedUniverses, unlockUniverse, isUniverseUnlocked, isUniverseCompleted, getUniverseCompletion, setUnlockedUniverses, resetUniverseCache
  - [ ] Default unlocked universe is `['milky-way']` when cache is empty
  - [ ] Follows same pattern as progressManager (module-level cache, lazy-init, localStorage + Firestore)
  - [ ] `npm run build` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Manager compiles and exports all functions
    Tool: Bash
    Preconditions: Tasks 1, 3 complete
    Steps:
      1. Run `npm run build`
      2. Run `grep -c "export const" src/utils/universeManager.ts`
    Expected Result: Build succeeds. At least 8 exported functions.
    Failure Indicators: Build fails or fewer exports.
    Evidence: .sisyphus/evidence/task-4-manager-exports.txt

  Scenario: Default state includes milky-way
    Tool: Bash
    Preconditions: Manager created
    Steps:
      1. Run `grep "milky-way" src/utils/universeManager.ts`
    Expected Result: 'milky-way' appears as default value.
    Failure Indicators: Missing default.
    Evidence: .sisyphus/evidence/task-4-default-state.txt
  ```

  **Commit**: YES (groups with Tasks 3, 5)
  - Message: `feat(universe): add universe config, manager, and Firestore integration`
  - Files: `src/utils/universeManager.ts`
  - Pre-commit: `npm run build`

---

- [ ] 5. Integrate Universe Persistence into Firestore Service

  **What to do**:
  - In `src/utils/firestoreService.ts`:
    - Add `unlockedUniverses: string[]` to `UserData` interface (after `ownedWeapons`)
    - Add default value `unlockedUniverses: ['milky-way']` to `defaultUserData`
    - Add `unlockedUniverses: 'geometry-dash-unlocked-universes'` to `LOCAL_KEYS` object
    - In `loadUserData()`: add `unlockedUniverses: data.unlockedUniverses ?? ['milky-way']` to return object
    - In `loadLocalData()`: add localStorage reading for `unlockedUniverses` key with `['milky-way']` default
    - In `saveLocalData()`: add localStorage writing for `unlockedUniverses` key
    - In `syncLocalToCloud()`: add merge logic for `unlockedUniverses` using array union (same pattern as `completedLevels` and `ownedSkins`)
    - In `subscribeToUserData()` callback: add `setUnlockedUniverses` call (import from universeManager) to sync cache on Firestore updates

  **Must NOT do**:
  - Do not restructure `completedLevels` format
  - Do not change existing field defaults
  - Do not add universe-specific Firestore collections (keep flat user document)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Adding a new field to an existing, well-patterned file. Copy existing patterns.
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Backend service module

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Tasks 4, 9
  - **Blocked By**: Task 1 (needs types)

  **References**:

  **Pattern References**:
  - `src/utils/firestoreService.ts:28-49` — `defaultUserData` and `LOCAL_KEYS` objects. Add `unlockedUniverses` following the same pattern as `ownedWeapons`/`ownedSkins`.
  - `src/utils/firestoreService.ts:58-92` — `loadUserData()` function. Add `unlockedUniverses: data.unlockedUniverses ?? ['milky-way']` following pattern of other array fields.
  - `src/utils/firestoreService.ts:163-222` — `loadLocalData()` and `saveLocalData()` functions for localStorage. Add the new key.
  - `src/utils/firestoreService.ts:238-275` — `syncLocalToCloud()` merge logic. Add union merge for `unlockedUniverses` following same pattern as `completedLevels` merge.

  **API/Type References**:
  - `src/utils/universeManager.ts` (from Task 4) — `setUnlockedUniverses()` function to call in subscribeToUserData callback

  **Acceptance Criteria**:

  - [ ] `UserData` interface has `unlockedUniverses: string[]`
  - [ ] `defaultUserData` has `unlockedUniverses: ['milky-way']`
  - [ ] `LOCAL_KEYS` has `unlockedUniverses` entry
  - [ ] `loadUserData` returns `unlockedUniverses` with `['milky-way']` default
  - [ ] `syncLocalToCloud` merges `unlockedUniverses` via array union
  - [ ] `npm run build` passes
  - [ ] `npm run test:run` passes (existing firestoreService tests still work)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Firestore integration compiles with new field
    Tool: Bash
    Preconditions: Task 1 complete
    Steps:
      1. Run `npm run build`
      2. Run `npm run test:run`
      3. Run `grep "unlockedUniverses" src/utils/firestoreService.ts | wc -l`
    Expected Result: Build and tests pass. At least 5 occurrences of unlockedUniverses in file.
    Failure Indicators: Build fails, tests fail, or field missing from key locations.
    Evidence: .sisyphus/evidence/task-5-firestore-integration.txt

  Scenario: Default value is milky-way array
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Run `grep "milky-way" src/utils/firestoreService.ts`
    Expected Result: 'milky-way' appears in defaultUserData and/or loadUserData default.
    Failure Indicators: Missing default or wrong default value.
    Evidence: .sisyphus/evidence/task-5-default-value.txt
  ```

  **Commit**: YES (groups with Tasks 3, 4)
  - Message: `feat(universe): add universe config, manager, and Firestore integration`
  - Files: `src/utils/firestoreService.ts`
  - Pre-commit: `npm run build && npm run test:run`

---

- [ ] 6. Build SpaceMap Component (HTML/CSS)

  **What to do**:
  - Create `src/components/SpaceMap.tsx` — the new home screen:
    - Props interface: `{ onSelectUniverse: (id: string) => void, onOpenShop: () => void }`
    - State: `isPanning`, `panOffset: {x, y}`, `dragStart: {x, y}`, `isTransitioning: boolean`
    - Render a dark space-themed background with:
      - CSS-animated twinkling stars (small dots with random opacity animation)
      - A large pannable container using CSS `transform: translate(${panOffset.x}px, ${panOffset.y}px)`
      - 5 universe nodes positioned absolutely using percentage-based positions from `UNIVERSES` config
      - Glowing connection paths between connected universes (SVG lines or CSS-positioned divs with gradient backgrounds)
    - Each universe node renders:
      - Universe emoji (large, centered)
      - Universe name
      - Completion badge (if completed) or "Coming Soon" label (if comingSoon)
      - Lock icon overlay for locked/Coming Soon universes
      - Pulsing glow animation for unlocked universe (CSS keyframes)
      - Muted/desaturated appearance for Coming Soon
    - Pan interaction:
      - Mouse: onMouseDown → start drag, onMouseMove → update panOffset, onMouseUp → stop drag
      - Touch: onTouchStart/Move/End with same logic
      - Clamp pan bounds so map doesn't scroll infinitely
    - Click handling:
      - Clicking an unlocked universe (not Coming Soon): calls `onSelectUniverse(universe.id)` if `!isTransitioning`
      - Clicking a Coming Soon universe: no action (visual feedback only — subtle shake or nothing)
    - Top bar (moved from Menu.tsx pattern):
      - Coin display (use `getTotalCoins()` from walletManager)
      - Auth section (current user display, login/logout)
      - Shop button (calls `onOpenShop`)
      - Admin panel toggle (if admin)
    - Import and render `AdminPanel` and `FortuneWheel` components (same as Menu.tsx does)
    - Auth state handling: use `onAuthChange` callback (same pattern as Menu.tsx)
  - Create `src/components/SpaceMap.css`:
    - Dark space background (#0a0a0f base with subtle radial gradient)
    - Star field using CSS pseudo-elements or small div elements with `@keyframes starTwinkle` (opacity pulse, random delays)
    - Universe node styling: circular, glass-morphism card (backdrop-filter: blur), border with glow matching universe theme color
    - Unlocked node: vibrant colors, pulsing glow animation (`@keyframes universePulse`)
    - Coming Soon node: grayscale filter, reduced opacity, lock icon overlay
    - Connection paths: thin lines with gradient matching source→destination theme colors, subtle glow
    - Pan container: `will-change: transform` for GPU acceleration
    - Top bar: fixed position, glass-morphism, consistent with Menu.tsx top bar styling
    - Responsive: works on common viewport sizes (no mobile-specific optimizations needed)

  **Must NOT do**:
  - Do NOT use HTML Canvas for the map — use HTML elements + CSS only
  - Do NOT add zoom/pinch functionality
  - Do NOT add momentum/inertia to panning
  - Do NOT add particle effects (CSS animations only)
  - Do NOT create orbital/rotating planet animations
  - Do NOT add new sound effects
  - Do NOT over-abstract — single component file, not a framework of sub-components

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI component with CSS animations, glass-morphism, interactive panning, visual design
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for designing the space map visual treatment, star field, glow effects, glass-morphism nodes
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed during implementation (used in Final QA)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 1, 3 (needs Universe types and config data)

  **References**:

  **Pattern References**:
  - `src/components/Menu.tsx:1-50` — Import ordering pattern, auth state handling with `onAuthChange`, `useState` for coins/user
  - `src/components/Menu.tsx:49-60` — Auth state effect pattern (useEffect with onAuthChange callback, syncing coins on auth change)
  - `src/components/Menu.tsx:160-196` — Top bar structure (coin display, auth section, buttons) — replicate this pattern on SpaceMap
  - `src/components/Menu.tsx:173-186` — Floating shapes / animated background pattern to reference for star field
  - `src/components/Menu.css:1-100` — Glass-morphism patterns (backdrop-filter, semi-transparent backgrounds, border glow), orbFloat animation, gradient orb styling

  **API/Type References**:
  - `src/types/universe.ts` (from Task 1) — Universe, UniversePosition interfaces for node rendering
  - `src/constants/universeConfig.ts` (from Task 3) — UNIVERSES array and helper functions
  - `src/utils/universeManager.ts` (from Task 4) — `isUniverseUnlocked()`, `getUniverseCompletion()` for node states
  - `src/utils/walletManager.ts` — `getTotalCoins()` for coin display
  - `src/utils/authService.ts` — `getCurrentUser()`, `onAuthChange()` for auth section

  **External References**:
  - None — all patterns available in existing codebase

  **Acceptance Criteria**:

  - [ ] Files exist: `src/components/SpaceMap.tsx`, `src/components/SpaceMap.css`
  - [ ] Component renders 5 universe nodes with correct names
  - [ ] Milky Way node is visually distinct (unlocked appearance)
  - [ ] Coming Soon nodes show muted/locked appearance with label
  - [ ] Panning works via mouse drag (translate updates on mousemove)
  - [ ] Clicking Milky Way fires `onSelectUniverse('milky-way')`
  - [ ] Clicking Coming Soon universe does NOT fire onSelectUniverse
  - [ ] Top bar shows coins, auth, shop button
  - [ ] Connection paths visible between connected universes
  - [ ] `npm run build` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: SpaceMap renders all universe nodes
    Tool: Bash
    Preconditions: Tasks 1, 3 complete, component created
    Steps:
      1. Run `npm run build`
      2. Run `grep "Milky Way" src/components/SpaceMap.tsx`
      3. Run `grep "Coming Soon" src/components/SpaceMap.tsx`
      4. Run `grep "onSelectUniverse" src/components/SpaceMap.tsx`
    Expected Result: Build passes. All strings found in component.
    Failure Indicators: Build fails or missing universe references.
    Evidence: .sisyphus/evidence/task-6-spacemap-render.txt

  Scenario: No Canvas used in SpaceMap (guardrail check)
    Tool: Bash
    Preconditions: Component created
    Steps:
      1. Run `grep -i "canvas" src/components/SpaceMap.tsx`
      2. Run `grep -i "canvas" src/components/SpaceMap.css`
    Expected Result: No matches (no Canvas usage).
    Failure Indicators: Canvas-related code found.
    Evidence: .sisyphus/evidence/task-6-no-canvas.txt

  Scenario: Pan interaction is implemented
    Tool: Bash
    Preconditions: Component created
    Steps:
      1. Run `grep "onMouseDown\|onMouseMove\|onMouseUp\|onTouchStart\|onTouchMove\|onTouchEnd" src/components/SpaceMap.tsx`
    Expected Result: At least 4 event handlers found (mouse + touch).
    Failure Indicators: Missing event handlers.
    Evidence: .sisyphus/evidence/task-6-pan-events.txt
  ```

  **Commit**: YES (groups with Tasks 7, 8)
  - Message: `feat(ui): add SpaceMap, UniverseLevelSelector, and fall-in animation`
  - Files: `src/components/SpaceMap.tsx`, `src/components/SpaceMap.css`
  - Pre-commit: `npm run build`

---

- [ ] 7. Build Universe Level Selector Component

  **What to do**:
  - Create `src/components/UniverseLevelSelector.tsx`:
    - Props interface: `{ universeId: string, onStartGame: (levelId: number, cheats: CheatState) => void, onBack: () => void }`
    - Fetch universe data from `getUniverseById(universeId)` and levels from `LEVELS` filtered by `universe.levelIds`
    - Display universe header: emoji + name + theme color accent
    - Level cards (adapted from Menu.tsx level carousel pattern):
      - Each card shows: planet emoji, planet name, "—", level name (e.g., "🪐 Mars — Stereo Madness")
      - Locked/unlocked/completed states using `isLevelUnlocked()`/`isLevelCompleted()` from progressManager
      - Difficulty indicators (reuse Menu.tsx level card styling)
    - Apply universe theme colors as CSS custom properties on the container:
      - `--universe-primary`, `--universe-secondary`, `--universe-glow`, `--universe-accent`
    - Back button calling `onBack` prop
    - Cheat state handling (reuse AdminPanel integration pattern from Menu.tsx):
      - Import `CheatState`, `defaultCheatState` from types/cheats
      - State: `cheats: CheatState`, `selectedLevel: number | null`
      - handleStartGame: call `onStartGame(selectedLevel, cheats)`
    - Play button to start selected level
    - Import and render AdminPanel (same as Menu.tsx) for cheat access
  - Create `src/components/UniverseLevelSelector.css`:
    - Universe-themed background using CSS custom properties
    - Level card grid or carousel
    - Glass-morphism cards matching Menu.tsx level card style
    - Universe name header with glow effect
    - Back button styling (consistent with existing UI)
    - Completed level: checkmark badge, green glow
    - Locked level: grayscale, lock icon, reduced opacity
    - Selected level: highlighted border matching universe theme

  **Must NOT do**:
  - Do not duplicate the entire Menu component — extract only the level selection pattern
  - Do not add Fortune Wheel here (it stays on SpaceMap/Menu)
  - Do not modify Menu.tsx — create a new component
  - Do not add universe-specific game mechanics

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with themed styling, level cards, interactive selection
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for designing themed level cards, visual states, universe header
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed during implementation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 1, 2, 3 (needs types, planetName on levels, universe config)

  **References**:

  **Pattern References**:
  - `src/components/Menu.tsx:317-369` — Level carousel/card rendering. This is the PRIMARY pattern to adapt. Shows how level cards are rendered with locked/unlocked/completed states, difficulty indicators, and click handlers.
  - `src/components/Menu.tsx:114-124` — `handleLevelSelect` and `handleStartGame` logic to replicate.
  - `src/components/Menu.tsx:120-124` — How cheats are passed to `onStartGame(levelId, cheats)`.
  - `src/components/Menu.css` — Level card CSS styles (`.level-card`, `.level-card.locked`, `.level-card.completed`, etc.)
  - `src/components/Shop.tsx:1-40` — Component structure pattern with back button and header

  **API/Type References**:
  - `src/constants/universeConfig.ts` (from Task 3) — `getUniverseById()` to fetch universe data
  - `src/constants/gameConfig.ts:121-491` — `LEVELS` array with `planetName` field (from Task 2)
  - `src/utils/progressManager.ts:53-69` — `isLevelUnlocked()` and `isLevelCompleted()` for level states
  - `src/types/cheats.ts` — `CheatState` type and `defaultCheatState` for cheat handling
  - `src/types/universe.ts` (from Task 1) — Universe type for theming

  **Acceptance Criteria**:

  - [ ] Files exist: `src/components/UniverseLevelSelector.tsx`, `src/components/UniverseLevelSelector.css`
  - [ ] Component renders universe name and emoji in header
  - [ ] All 6 Milky Way levels render with dual naming (planet + level name)
  - [ ] Locked/unlocked/completed visual states work
  - [ ] Back button calls `onBack` prop
  - [ ] Play button calls `onStartGame(levelId, cheats)`
  - [ ] Universe theme colors applied via CSS custom properties
  - [ ] `npm run build` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Level selector renders with dual naming
    Tool: Bash
    Preconditions: Tasks 1, 2, 3 complete
    Steps:
      1. Run `npm run build`
      2. Run `grep "planetName" src/components/UniverseLevelSelector.tsx`
      3. Run `grep "onStartGame" src/components/UniverseLevelSelector.tsx`
      4. Run `grep "onBack" src/components/UniverseLevelSelector.tsx`
    Expected Result: Build passes. planetName used in rendering, both callback props referenced.
    Failure Indicators: Build fails or missing references.
    Evidence: .sisyphus/evidence/task-7-level-selector.txt

  Scenario: Universe theme CSS custom properties used
    Tool: Bash
    Preconditions: Component created
    Steps:
      1. Run `grep "universe-primary\|universe-secondary\|universe-glow" src/components/UniverseLevelSelector.css`
    Expected Result: CSS custom properties found in stylesheet.
    Failure Indicators: No custom property usage.
    Evidence: .sisyphus/evidence/task-7-theme-vars.txt
  ```

  **Commit**: YES (groups with Tasks 6, 8)
  - Message: `feat(ui): add SpaceMap, UniverseLevelSelector, and fall-in animation`
  - Files: `src/components/UniverseLevelSelector.tsx`, `src/components/UniverseLevelSelector.css`
  - Pre-commit: `npm run build`

---

- [ ] 8. Create Fall-in Transition Animation

  **What to do**:
  - Create `src/components/FallInTransition.tsx`:
    - Props: `{ isActive: boolean, universeTheme: UniverseTheme, onComplete: () => void }`
    - When `isActive` becomes true:
      - Render a full-screen overlay div with the universe's theme colors
      - Animation sequence (CSS keyframes, ~1.5s total):
        1. Screen starts normal
        2. Center point zooms in (scale + radial wipe/fade effect)
        3. Colors shift to universe theme (background color transition)
        4. Ends with full-screen universe-colored overlay
      - After animation completes, call `onComplete()` via `animationend` event or `setTimeout(1500)`
    - When `isActive` is false, render nothing (return null)
  - Create `src/components/FallInTransition.css`:
    - `@keyframes fallIn`: scale(1) opacity(0) → scale(3) opacity(1) over 1.5s with ease-in timing
    - Full-screen fixed overlay (z-index above SpaceMap)
    - Radial gradient centered on click point (or center) expanding outward
    - Universe theme colors applied dynamically via CSS custom properties or inline styles

  **Must NOT do**:
  - Do not use Canvas for the animation — CSS only
  - Do not make the animation longer than 2 seconds
  - Do not add sound effects
  - Do not make it skippable (1.5s is short enough)
  - Do not over-engineer — simple scale + fade is sufficient

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small component with a single CSS animation, straightforward
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Animation is simple enough without specialized skill

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7)
  - **Blocks**: Task 9
  - **Blocked By**: None (only needs UniverseTheme type from Task 1, but can hard-code for now)

  **References**:

  **Pattern References**:
  - `src/components/FortuneWheel.css` — `@keyframes modalSlideIn` and `@keyframes fadeIn` — existing modal animation patterns to follow for timing and easing
  - `src/components/Game.css` — `@keyframes scaleIn` — scale animation pattern
  - `src/components/AuthModal.css` — Full-screen overlay pattern with backdrop-filter

  **API/Type References**:
  - `src/types/universe.ts` (from Task 1) — `UniverseTheme` for color props

  **Acceptance Criteria**:

  - [ ] Files exist: `src/components/FallInTransition.tsx`, `src/components/FallInTransition.css`
  - [ ] Component renders overlay when `isActive=true`, nothing when `false`
  - [ ] Animation completes in ~1.5 seconds
  - [ ] `onComplete` callback fires after animation
  - [ ] `npm run build` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Transition component compiles and has animation
    Tool: Bash
    Preconditions: Task 1 complete
    Steps:
      1. Run `npm run build`
      2. Run `grep "@keyframes fallIn\|@keyframes fall-in" src/components/FallInTransition.css`
      3. Run `grep "onComplete" src/components/FallInTransition.tsx`
    Expected Result: Build passes. CSS keyframe animation defined. onComplete prop used.
    Failure Indicators: Build fails, missing animation, or missing callback.
    Evidence: .sisyphus/evidence/task-8-fall-in.txt

  Scenario: No Canvas used (guardrail check)
    Tool: Bash
    Preconditions: Component created
    Steps:
      1. Run `grep -i "canvas" src/components/FallInTransition.tsx src/components/FallInTransition.css`
    Expected Result: No matches.
    Failure Indicators: Canvas-related code found.
    Evidence: .sisyphus/evidence/task-8-no-canvas.txt
  ```

  **Commit**: YES (groups with Tasks 6, 7)
  - Message: `feat(ui): add SpaceMap, UniverseLevelSelector, and fall-in animation`
  - Files: `src/components/FallInTransition.tsx`, `src/components/FallInTransition.css`
  - Pre-commit: `npm run build`

---

- [ ] 9. Integrate Everything in App.tsx (Navigation Flow)

  **What to do**:
  - Modify `src/App.tsx`:
    - Expand Screen type: `type Screen = 'space-map' | 'universe' | 'game' | 'shop'`
    - Remove `'menu'` from Screen type (SpaceMap replaces Menu as entry point, UniverseLevelSelector replaces level selection)
    - Change initial state: `useState<Screen>('space-map')` (was `'menu'`)
    - Add state: `const [currentUniverseId, setCurrentUniverseId] = useState<string | null>(null)`
    - Add state: `const [isTransitioning, setIsTransitioning] = useState(false)`
    - Add `syncUniversesFromCloud()` to the initialization useEffect (alongside existing syncs)
    - Handler: `handleSelectUniverse(id: string)`:
      1. Set `isTransitioning = true`
      2. Set `currentUniverseId = id`
      3. FallInTransition renders (its `onComplete` callback does step 4)
      4. On animation complete: set `screen = 'universe'`, `isTransitioning = false`
    - Handler: `handleBackToMap()`: set `screen = 'space-map'`, `currentUniverseId = null`
    - Handler: `handleBackFromGame()`: set `screen = 'universe'` (back to level selector, not map)
    - Handler: `handleStartGame(levelId, cheats)`: same logic as current, but also applies universe color override:
      1. Get universe theme from `getUniverseById(currentUniverseId)`
      2. Store level ID and cheats (existing pattern)
      3. Set screen to 'game'
    - Render logic:
      ```tsx
      {screen === 'space-map' && <SpaceMap onSelectUniverse={handleSelectUniverse} onOpenShop={handleOpenShop} />}
      {screen === 'universe' && currentUniverseId && <UniverseLevelSelector universeId={currentUniverseId} onStartGame={handleStartGame} onBack={handleBackToMap} />}
      {screen === 'game' && <Game levelId={currentLevel} onBack={handleBackFromGame} cheats={currentCheats} />}
      {screen === 'shop' && <Shop onBack={handleBackToMap} />}
      <FallInTransition isActive={isTransitioning} universeTheme={currentUniverse?.theme} onComplete={handleTransitionComplete} />
      ```
    - Import new components: SpaceMap, UniverseLevelSelector, FallInTransition
    - Import universe utils: getUniverseById, syncUniversesFromCloud
    - Note: Menu.tsx is no longer rendered by App.tsx directly. The UniverseLevelSelector replaces its role.

  **Must NOT do**:
  - Do NOT modify Game.tsx
  - Do NOT introduce React Router or Context
  - Do NOT delete Menu.tsx file (it may be reused or referenced by tests, just stop rendering it in App)
  - Do NOT change how Game receives props (levelId, cheats, onBack)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Central integration point touching multiple components, navigation state machine, complex interaction flow
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for coordinating the visual flow between screens and animation timing
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed during implementation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (with Task 10)
  - **Blocks**: Tasks 10, 11, 12, 13
  - **Blocked By**: Tasks 4, 5, 6, 7, 8 (needs all components and managers)

  **References**:

  **Pattern References**:
  - `src/App.tsx:1-59` — **PRIMARY FILE** to modify. Current routing logic, state management, handler patterns. This is the complete current file.
  - `src/App.tsx:13` — Current `Screen` type to expand
  - `src/App.tsx:16-18` — Current state declarations to extend
  - `src/App.tsx:30-34` — `handleStartGame` to modify (add color override)
  - `src/App.tsx:44-56` — Current render logic to replace

  **API/Type References**:
  - `src/components/SpaceMap.tsx` (from Task 6) — Props: `{ onSelectUniverse, onOpenShop }`
  - `src/components/UniverseLevelSelector.tsx` (from Task 7) — Props: `{ universeId, onStartGame, onBack }`
  - `src/components/FallInTransition.tsx` (from Task 8) — Props: `{ isActive, universeTheme, onComplete }`
  - `src/utils/universeManager.ts` (from Task 4) — `syncUniversesFromCloud()`
  - `src/constants/universeConfig.ts` (from Task 3) — `getUniverseById()`

  **Acceptance Criteria**:

  - [ ] App starts on `'space-map'` screen (not `'menu'`)
  - [ ] SpaceMap renders as home screen
  - [ ] Selecting Milky Way triggers FallInTransition → then shows UniverseLevelSelector
  - [ ] Starting a game from UniverseLevelSelector shows Game
  - [ ] Back from Game goes to UniverseLevelSelector (not SpaceMap)
  - [ ] Back from UniverseLevelSelector goes to SpaceMap
  - [ ] Shop back goes to SpaceMap
  - [ ] `syncUniversesFromCloud` called during init
  - [ ] `npm run build` passes
  - [ ] No React Router or Context imports

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: App routing includes all new screens
    Tool: Bash
    Preconditions: All Wave 1-3 tasks complete
    Steps:
      1. Run `npm run build`
      2. Run `grep "space-map\|universe" src/App.tsx`
      3. Run `grep "SpaceMap\|UniverseLevelSelector\|FallInTransition" src/App.tsx`
      4. Run `grep "react-router\|createBrowserRouter\|BrowserRouter" src/App.tsx`
    Expected Result: Build passes. New screen states found. New component imports found. No React Router.
    Failure Indicators: Build fails, missing screens, or React Router detected.
    Evidence: .sisyphus/evidence/task-9-app-routing.txt

  Scenario: Game.tsx is NOT modified (guardrail)
    Tool: Bash
    Preconditions: Integration complete
    Steps:
      1. Run `git diff src/components/Game.tsx`
    Expected Result: No changes to Game.tsx (empty diff).
    Failure Indicators: Any modifications to Game.tsx.
    Evidence: .sisyphus/evidence/task-9-game-untouched.txt

  Scenario: Menu.tsx is no longer rendered in App
    Tool: Bash
    Preconditions: Integration complete
    Steps:
      1. Run `grep "<Menu" src/App.tsx`
    Expected Result: No `<Menu` JSX found in App.tsx (replaced by SpaceMap + UniverseLevelSelector).
    Failure Indicators: Menu still rendered.
    Evidence: .sisyphus/evidence/task-9-no-menu-render.txt
  ```

  **Commit**: YES (groups with Task 10)
  - Message: `feat(app): integrate universe navigation flow and color override system`
  - Files: `src/App.tsx`
  - Pre-commit: `npm run build`

---

- [ ] 10. Universe Color Override System

  **What to do**:
  - In `src/App.tsx` (or a small helper), when starting a game from a universe:
    - Look up the current universe via `getUniverseById(currentUniverseId)`
    - Get the universe's `theme.groundColorOverride` and `theme.backgroundColorOverride`
    - Pass these as the `colorOverride` parameter to `getCurrentLevel(levelId, colorOverride)` (modified in Task 2)
    - Store the resulting overridden level ID approach: since Game.tsx calls `getCurrentLevel(levelId)` internally (line 93), we need a different approach:
      - **Option A** (recommended): Modify `getCurrentLevel` to check a module-level override variable. Add `setColorOverride(override)` and `clearColorOverride()` to gameConfig.ts. App.tsx calls `setColorOverride` before navigating to game, and `clearColorOverride` on game exit.
      - **Option B**: Pass color overrides as additional props to Game.tsx — but this violates "don't modify Game.tsx".
    - Implement Option A:
      - In `src/constants/gameConfig.ts`, add:
        ```typescript
        let activeColorOverride: { groundColor?: string; backgroundColor?: string } | null = null;
        export const setColorOverride = (override: { groundColor?: string; backgroundColor?: string } | null) => {
          activeColorOverride = override;
        };
        export const getColorOverride = () => activeColorOverride;
        ```
      - Modify `getCurrentLevel` to automatically apply `activeColorOverride` when set:
        ```typescript
        export const getCurrentLevel = (levelId: number): Level | undefined => {
          const level = LEVELS.find(l => l.id === levelId);
          if (level && activeColorOverride) {
            return {
              ...level,
              groundColor: activeColorOverride.groundColor ?? level.groundColor,
              backgroundColor: activeColorOverride.backgroundColor ?? level.backgroundColor,
            };
          }
          return level;
        };
        ```
      - Note: This replaces the optional parameter approach from Task 2. getCurrentLevel's signature stays the same (just `levelId`), so Game.tsx doesn't need changes.
    - In `src/App.tsx`:
      - Before setting screen to 'game': call `setColorOverride(universe.theme)` with groundColorOverride and backgroundColorOverride
      - In `handleBackFromGame` and `handleBackToMap`: call `setColorOverride(null)` to clear

  **Must NOT do**:
  - Do NOT modify Game.tsx
  - Do NOT modify gameRenderer.ts or gamePhysics.ts
  - Do NOT change quant/spike/coin colors — only ground and background
  - Do NOT make color override persist to localStorage (it's runtime-only)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Cross-cutting concern touching gameConfig.ts and App.tsx, needs careful design to avoid breaking Game.tsx
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Logic-focused, not visual

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 9 if coordinated, but safer sequential)
  - **Parallel Group**: Wave 4 (with Task 9)
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 2, 3, 9 (needs planetName/override on levels, universe config, and App routing)

  **References**:

  **Pattern References**:
  - `src/constants/gameConfig.ts:489-491` — Current `getCurrentLevel` function to modify
  - `src/components/Game.tsx:93` — Where Game calls `getCurrentLevel(levelId)` — this call must continue to work unchanged
  - `src/utils/gameRenderer.ts:6-20` — `drawBackground` reads `level.backgroundColor` and `level.groundColor` — the override feeds through here automatically

  **API/Type References**:
  - `src/constants/universeConfig.ts` (from Task 3) — Universe theme with `groundColorOverride` and `backgroundColorOverride`
  - `src/types/universe.ts` (from Task 1) — `UniverseTheme` type

  **Acceptance Criteria**:

  - [ ] `setColorOverride` and `getColorOverride` exported from `gameConfig.ts`
  - [ ] `getCurrentLevel(1)` returns original colors when no override set
  - [ ] `getCurrentLevel(1)` returns overridden colors when `setColorOverride` has been called
  - [ ] Game.tsx NOT modified (unchanged call to `getCurrentLevel(levelId)`)
  - [ ] App.tsx sets override before game, clears on back
  - [ ] `npm run build` passes
  - [ ] `npm run test:run` passes (existing tests unaffected — they don't set overrides)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Color override functions exist and compile
    Tool: Bash
    Preconditions: Task 2 complete
    Steps:
      1. Run `npm run build`
      2. Run `grep "setColorOverride\|getColorOverride" src/constants/gameConfig.ts`
      3. Run `grep "setColorOverride" src/App.tsx`
    Expected Result: Build passes. Override functions in gameConfig. App.tsx calls setColorOverride.
    Failure Indicators: Build fails or missing function references.
    Evidence: .sisyphus/evidence/task-10-color-override.txt

  Scenario: Game.tsx is NOT modified (guardrail)
    Tool: Bash
    Preconditions: Integration complete
    Steps:
      1. Run `git diff src/components/Game.tsx`
    Expected Result: No changes to Game.tsx.
    Failure Indicators: Any modifications.
    Evidence: .sisyphus/evidence/task-10-game-untouched.txt

  Scenario: Existing tests pass with override system in place
    Tool: Bash
    Preconditions: Override implemented
    Steps:
      1. Run `npm run test:run`
    Expected Result: All tests pass (exit 0).
    Failure Indicators: Any test failures.
    Evidence: .sisyphus/evidence/task-10-tests-pass.txt
  ```

  **Commit**: YES (groups with Task 9)
  - Message: `feat(app): integrate universe navigation flow and color override system`
  - Files: `src/constants/gameConfig.ts`, `src/App.tsx`
  - Pre-commit: `npm run build && npm run test:run`

---

- [ ] 11. Tests for Universe Manager

  **What to do**:
  - Create `src/utils/__tests__/universeManager.test.ts`:
    - Mock Firebase: `vi.mock('../../config/firebase', () => ({ auth: {}, db: {} }))`
    - Mock firestoreService: `vi.mock('../firestoreService', ...)`
    - Mock authService: `vi.mock('../authService', ...)`
    - Mock progressManager: `vi.mock('../progressManager', ...)`
    - Test cases:
      - `syncUniversesFromCloud` — loads from localStorage for guest, Firestore for auth user
      - `getUnlockedUniverses` — returns `['milky-way']` by default (lazy init from localStorage)
      - `unlockUniverse` — adds to cached array, persists to localStorage
      - `isUniverseUnlocked('milky-way')` — returns true by default
      - `isUniverseUnlocked('andromeda')` — returns false by default
      - `isUniverseCompleted('milky-way')` — returns true when all 6 levels completed
      - `isUniverseCompleted('milky-way')` — returns false when only some levels completed
      - `getUniverseCompletion('milky-way')` — returns `{ completed: N, total: 6 }`
      - `resetUniverseCache` — clears cache, subsequent get returns fresh data
      - Edge case: missing localStorage key returns default `['milky-way']`

  **Must NOT do**:
  - Do not import Firebase modules directly — mock them
  - Do not test firestoreService internals (those have their own tests)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Test file with multiple test cases, mocking patterns, edge cases
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Testing, not visual work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 12, 13)
  - **Blocks**: Final verification
  - **Blocked By**: Tasks 4, 9

  **References**:

  **Test References**:
  - `src/utils/__tests__/progressManager.test.ts` — **PRIMARY PATTERN**. Shows exact mock structure for testing a manager (mock firebase, firestoreService, authService, localStorage). Copy this pattern.
  - `src/utils/__tests__/walletManager.test.ts` — Second reference for manager test pattern.

  **API/Type References**:
  - `src/utils/universeManager.ts` (from Task 4) — Module under test

  **Acceptance Criteria**:

  - [ ] File exists at `src/utils/__tests__/universeManager.test.ts`
  - [ ] `npx vitest run src/utils/__tests__/universeManager.test.ts` passes
  - [ ] At least 10 test cases covering all exported functions
  - [ ] Edge cases tested (empty localStorage, missing data, default values)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All universe manager tests pass
    Tool: Bash
    Preconditions: Tasks 4, 9 complete
    Steps:
      1. Run `npx vitest run src/utils/__tests__/universeManager.test.ts --reporter=verbose`
    Expected Result: All tests pass, 0 failures. At least 10 test cases.
    Failure Indicators: Any test failure.
    Evidence: .sisyphus/evidence/task-11-manager-tests.txt
  ```

  **Commit**: YES (groups with Tasks 12, 13)
  - Message: `test(universe): add tests for universe manager, SpaceMap, and LevelSelector`
  - Files: `src/utils/__tests__/universeManager.test.ts`
  - Pre-commit: `npx vitest run src/utils/__tests__/universeManager.test.ts`

---

- [ ] 12. Tests for SpaceMap Component

  **What to do**:
  - Create `src/components/__tests__/SpaceMap.test.tsx`:
    - Mock Firebase and all service dependencies (same pattern as Menu.test.tsx)
    - Mock universeManager, walletManager, authService
    - Test cases:
      - Renders all 5 universe names (Milky Way, Andromeda, Nebula Vortex, Cosmic Abyss, Quantum Realm)
      - Milky Way node is clickable (click fires `onSelectUniverse('milky-way')`)
      - Coming Soon nodes show "Coming Soon" text
      - Coming Soon nodes do NOT fire onSelectUniverse on click
      - Coin display shows correct total from walletManager
      - Shop button fires onOpenShop callback
      - Component renders without errors when no universes are unlocked (edge case — still shows milky-way)

  **Must NOT do**:
  - Do not test CSS animations (those are visual, covered by Playwright in Final QA)
  - Do not test panning mechanics in unit tests (DOM events are unreliable in jsdom)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Component testing with mocks, multiple test cases
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Testing, not visual

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 11, 13)
  - **Blocks**: Final verification
  - **Blocked By**: Tasks 6, 9

  **References**:

  **Test References**:
  - `src/components/__tests__/Menu.test.tsx` — **PRIMARY PATTERN**. Shows how to mock Firebase, services, and test a component with `render()`, `screen.getByText()`, `fireEvent.click()`. Copy this mock structure exactly.

  **API/Type References**:
  - `src/components/SpaceMap.tsx` (from Task 6) — Component under test

  **Acceptance Criteria**:

  - [ ] File exists at `src/components/__tests__/SpaceMap.test.tsx`
  - [ ] `npx vitest run src/components/__tests__/SpaceMap.test.tsx` passes
  - [ ] At least 6 test cases

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All SpaceMap tests pass
    Tool: Bash
    Preconditions: Tasks 6, 9 complete
    Steps:
      1. Run `npx vitest run src/components/__tests__/SpaceMap.test.tsx --reporter=verbose`
    Expected Result: All tests pass, 0 failures.
    Failure Indicators: Any test failure.
    Evidence: .sisyphus/evidence/task-12-spacemap-tests.txt
  ```

  **Commit**: YES (groups with Tasks 11, 13)
  - Message: `test(universe): add tests for universe manager, SpaceMap, and LevelSelector`
  - Files: `src/components/__tests__/SpaceMap.test.tsx`
  - Pre-commit: `npx vitest run src/components/__tests__/SpaceMap.test.tsx`

---

- [ ] 13. Tests for Universe Level Selector Component

  **What to do**:
  - Create `src/components/__tests__/UniverseLevelSelector.test.tsx`:
    - Mock Firebase and all service dependencies
    - Mock progressManager, universeConfig helpers
    - Test cases:
      - Renders universe name and emoji in header
      - Renders all 6 Milky Way levels
      - Level cards show planet name (e.g., "Mercury")
      - Level cards show level name (e.g., "Stereo Madness")
      - Level 1 is always unlocked
      - Locked levels show locked state
      - Completed levels show completed state
      - Back button fires `onBack` callback
      - Selecting a level and pressing play fires `onStartGame(levelId, cheats)`

  **Must NOT do**:
  - Do not test cheat mechanics in detail (those are Menu/Admin tests)
  - Do not test game physics or rendering

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Component testing with mocks, multiple test cases
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 11, 12)
  - **Blocks**: Final verification
  - **Blocked By**: Tasks 7, 9

  **References**:

  **Test References**:
  - `src/components/__tests__/Menu.test.tsx` — **PRIMARY PATTERN**. Exact same mock structure and testing approach.

  **API/Type References**:
  - `src/components/UniverseLevelSelector.tsx` (from Task 7) — Component under test

  **Acceptance Criteria**:

  - [ ] File exists at `src/components/__tests__/UniverseLevelSelector.test.tsx`
  - [ ] `npx vitest run src/components/__tests__/UniverseLevelSelector.test.tsx` passes
  - [ ] At least 8 test cases

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All LevelSelector tests pass
    Tool: Bash
    Preconditions: Tasks 7, 9 complete
    Steps:
      1. Run `npx vitest run src/components/__tests__/UniverseLevelSelector.test.tsx --reporter=verbose`
    Expected Result: All tests pass, 0 failures.
    Failure Indicators: Any test failure.
    Evidence: .sisyphus/evidence/task-13-levelselector-tests.txt
  ```

  **Commit**: YES (groups with Tasks 11, 12)
  - Message: `test(universe): add tests for universe manager, SpaceMap, and LevelSelector`
  - Files: `src/components/__tests__/UniverseLevelSelector.test.tsx`
  - Pre-commit: `npx vitest run src/components/__tests__/UniverseLevelSelector.test.tsx`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, check component renders, check persistence). For each "Must NOT Have": search codebase for forbidden patterns (Canvas in SpaceMap, React Router imports, modifications to Game.tsx). Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build` + `npm run lint` + `npm run test:run`. Review all new/changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify import ordering follows AGENTS.md convention.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real QA via Playwright** — `unspecified-high` + `playwright` skill
  Start dev server (`npm run dev`). Open browser. Verify: (1) App starts on SpaceMap with 5 universe nodes, (2) Milky Way is clickable with fall-in animation, (3) Level selector shows 6 levels with planet names, (4) Coming Soon universes show locked state, (5) Back navigation works through all screens, (6) Starting a game from universe level selector works, (7) Completing a level persists correctly. Save screenshots to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual implementation. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect Game.tsx was NOT modified. Detect no Canvas usage in SpaceMap. Detect no React Router. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Guardrails [N/N respected] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **After Wave 1**: `feat(types): add Universe type definitions and planetName to Level interface` — `src/types/universe.ts`, `src/types/game.ts`
- **After Wave 2**: `feat(universe): add universe config, manager, and Firestore integration` — `src/constants/universeConfig.ts`, `src/utils/universeManager.ts`, `src/utils/firestoreService.ts`, `src/constants/gameConfig.ts`
- **After Wave 3**: `feat(ui): add SpaceMap, UniverseLevelSelector, and fall-in animation` — `src/components/SpaceMap.tsx`, `src/components/SpaceMap.css`, `src/components/UniverseLevelSelector.tsx`, `src/components/UniverseLevelSelector.css`
- **After Wave 4**: `feat(app): integrate universe navigation flow and color override system` — `src/App.tsx`, `src/constants/gameConfig.ts`
- **After Wave 5**: `test(universe): add tests for universe manager, SpaceMap, and LevelSelector` — `src/utils/__tests__/universeManager.test.ts`, `src/components/__tests__/SpaceMap.test.tsx`, `src/components/__tests__/UniverseLevelSelector.test.tsx`
- **After Final Wave**: `chore: final cleanup after universe feature verification`

---

## Success Criteria

### Verification Commands
```bash
npm run build        # Expected: exits 0, no TypeScript errors
npm run lint         # Expected: exits 0, no lint errors  
npm run test:run     # Expected: exits 0, all tests pass
npm run test:coverage # Expected: new files meet 85% line / 70% function thresholds
```

### Final Checklist
- [ ] All "Must Have" items present and verified
- [ ] All "Must NOT Have" items absent (no Canvas SpaceMap, no Game.tsx changes, no React Router)
- [ ] All tests pass (existing + new)
- [ ] Build succeeds with zero TypeScript errors
- [ ] Universe progression persists across page reloads
- [ ] SpaceMap renders correctly as home screen
- [ ] Fall-in animation plays when entering Milky Way
- [ ] Level cards show dual naming (planet + level)
- [ ] Coming Soon universes are properly locked
- [ ] Back navigation works: Game → Level Selector → SpaceMap
