# Weapons System — Full Combat & Shop Feature

## TL;DR

> **Quick Summary**: Add a comprehensive weapons system with 50 weapons across 4 categories (Ballistic/Fire/Laser/Explosive), a tabbed shop (Skins + Weapons), auto-fire combat mechanics, quant HP system, and category-themed projectile visuals. Mirrors existing skins shop patterns for persistence and UI.
> 
> **Deliverables**:
> - 50 weapon definitions with stats across 4 categories
> - Tabbed shop UI (Skins + Weapons tabs)
> - Weapon purchase, equip, and persistence system
> - Projectile physics, collision detection, and rendering
> - Quant HP system with level-scaling difficulty
> - Auto-fire mechanic with per-weapon cooldowns
> - Weapon HUD icon during gameplay
> - Damage flash feedback on quant hits
> - Full test coverage for all new modules
> 
> **Estimated Effort**: XL
> **Parallel Execution**: YES — 5 waves
> **Critical Path**: Task 1 → Task 3 → Task 6 → Task 10 → Task 13 → Task 15 → Final Wave

---

## Context

### Original Request
User wants to introduce a weapons store similar to the existing skins shop. The shop gets 2 tabs (Skins + Weapons). 50 weapon types across 4 categories (Ballistic 20, Fire 10, Laser 10, Explosive 10), priced by damage effectiveness. The character gains the ability to fire weapons during gameplay to eliminate quants. Weapons range from simplest/cheapest to heaviest/most expensive within each category.

### Interview Summary
**Key Discussions**:
- **Firing input**: Auto-fire (continuous, no manual trigger). Each weapon has its own fire rate cooldown.
- **Ammo**: Unlimited with cooldown. No ammo count.
- **Quant HP**: HP system where damage determines kills. HP scales with level difficulty. Stomp always kills instantly.
- **Starter weapon**: Must purchase first weapon. No free default.
- **Direction**: Projectiles fire forward (right) only, all straight horizontal.
- **Projectile collision**: Hit first quant and disappear. Pass through obstacles/terrain.
- **Explosive**: Single-target, big visual explosion. No AoE.
- **Laser**: Traveling beam projectile (not hit-scan). Behaves like a long thin bullet.
- **Weapon switching**: Shop only — fixed during gameplay.
- **Visuals**: Category-themed projectiles. Damage flash (no HP bar). Weapon HUD icon bottom-left corner.
- **Coin drops**: Same regardless of kill method (stomp vs weapon).
- **Tests**: Yes, automated tests with vitest following existing patterns.

### Research Findings
- **Skins shop**: SkinSelector.tsx full-screen route, SKINS array in types/skins.ts (100+ items), skinManager.ts cache+persistence, category filter tabs
- **Game loop**: rAF-based, refs for real-time state, canvas layers: bg→ground→obstacles→quants→droppedCoins→particles→player→UI
- **Wallet**: walletManager.ts with getTotalCoins/spendCoins/addCoins, localStorage + Firestore dual persistence
- **Collisions**: AABB-based, checkAllQuantCollisions returns typed results, stomp via vertical velocity check
- **Quants**: 3 types (static/moving/jumping), factory helpers in gameConfig.ts, isDead boolean flag

### Metis Review
**Identified Gaps** (addressed):
- Projectile collision behavior clarified (hit first quant, disappear)
- Explosive = single-target confirmed (no AoE)
- Laser = traveling projectile confirmed (not hit-scan)
- Stomp = always instant kill confirmed
- Max projectile cap: 50 active projectiles
- Backwards compatibility for existing save data (no weapon fields → defaults to empty)
- isDead must remain as derived property (hp <= 0) for backward compat
- Projectile cleanup on death/restart/completion

---

## Work Objectives

### Core Objective
Add a complete weapons system with shop, combat mechanics, and 50 weapons that integrates seamlessly with the existing game engine, following established codebase patterns exactly.

### Concrete Deliverables
- `src/types/weapons.ts` — Weapon interface, 50 weapon definitions, categories, helpers
- `src/utils/weaponManager.ts` — Purchase/equip/persistence (mirrors skinManager.ts)
- `src/components/Shop.tsx` + `Shop.css` — Tabbed container for Skins + Weapons
- `src/components/WeaponSelector.tsx` + `WeaponSelector.css` — Weapon shop tab content
- `src/utils/projectilePhysics.ts` — Projectile update, collision detection
- `src/utils/projectileRenderer.ts` — Category-themed projectile drawing + damage flash + weapon HUD
- Modified `src/types/game.ts` — Projectile type, Quant HP fields
- Modified `src/utils/gamePhysics.ts` — Quant HP system integration
- Modified `src/utils/gameRenderer.ts` — Damage flash, weapon HUD rendering
- Modified `src/components/Game.tsx` — Projectile refs, auto-fire, projectile loop integration
- Modified `src/constants/gameConfig.ts` — Quant HP config, HP level scaling
- Modified `src/utils/firestoreService.ts` — UserData weapon fields
- Modified `src/components/App.tsx` — Shop route, weapon prop passing
- Modified `src/components/Menu.tsx` — Shop button rename, weapon sync
- Test files for all new modules

### Definition of Done
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run test:run` passes with zero failures
- [ ] `npm run build` succeeds
- [ ] 50 weapons defined with unique IDs, valid stats, and prices
- [ ] Shop shows 2 tabs (Skins + Weapons), both fully functional
- [ ] Weapons purchasable with coins, persisted in localStorage and Firestore
- [ ] Auto-fire works during gameplay when weapon equipped
- [ ] Projectiles hit quants, deal damage, quants die when HP reaches 0
- [ ] Stomp still kills quants in one hit
- [ ] No weapon equipped = no combat (game plays exactly as before)
- [ ] Existing skin shop functionality unchanged

### Must Have
- 50 weapons across 4 categories with scaling damage/price
- Tabbed shop UI preserving all existing skin functionality
- Auto-fire with per-weapon cooldowns
- Quant HP system with level scaling
- Category-themed projectile visuals (bullets, flames, beams, explosions)
- Damage flash feedback on non-lethal hits
- Weapon HUD icon in bottom-left during gameplay
- Weapon persistence (localStorage + Firestore, mirrors skins pattern)
- Backwards compatibility (old saves without weapon data work fine)
- Full test coverage for new modules

### Must NOT Have (Guardrails)
- NO weapon upgrades/leveling — weapons have fixed stats
- NO ammo system — unlimited with cooldown only
- NO AoE/splash damage — all weapons are single-target
- NO weapon crafting/combining
- NO weapon animations on the player cube — HUD icon only
- NO new quant types — only existing static/moving/jumping
- NO Context/Redux/stores — follow existing prop-drilling + manager-cache pattern
- NO changes to coin drop mechanics — same drops regardless of kill method
- NO projectile recoil/knockback on player
- NO weapon switching during gameplay — shop only
- NO hit-scan mechanics — all projectiles travel as objects
- NO procedural weapon generation — all 50 are static const data
- NO changes to existing skin purchase, selection, or display behavior
- NO weapon achievements/kill tracking
- NO sound effects per weapon (use existing sound system as-is)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **Automated tests**: YES (tests alongside implementation)
- **Framework**: vitest with @testing-library/react
- **Pattern**: Follow existing test patterns in `src/utils/__tests__/` and `src/components/__tests__/`

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **Game Logic**: Use Bash (vitest) — Run tests, verify pass counts
- **Integration**: Use Playwright — Play the game, verify combat works

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — types, data, config):
├── Task 1: Weapon types & interfaces (src/types/weapons.ts) [quick]
├── Task 2: Quant HP type extensions (src/types/game.ts) [quick]
├── Task 3: Projectile type definition (src/types/game.ts — can merge with Task 2) [quick]
├── Task 4: Weapon stat constants & 50 weapon definitions [unspecified-high]
└── Task 5: Quant HP config & level scaling constants [quick]

Wave 2 (Managers & Physics — after Wave 1):
├── Task 6: weaponManager.ts — purchase/equip/persistence [unspecified-high]
├── Task 7: Firestore UserData extension + sync [quick]
├── Task 8: Projectile physics — update, collision, spawn [deep]
├── Task 9: Quant HP physics — damage, isDead derivation, stomp override [unspecified-high]
└── Task 10: weaponManager tests [unspecified-high]

Wave 3 (Rendering & Shop UI — after Wave 2):
├── Task 11: Projectile renderer — category-themed drawing [visual-engineering]
├── Task 12: Quant damage flash + weapon HUD renderer [visual-engineering]
├── Task 13: Shop.tsx — tabbed container (Skins + Weapons tabs) [visual-engineering]
├── Task 14: WeaponSelector.tsx — weapon shop tab content [visual-engineering]
├── Task 15: Projectile physics tests [unspecified-high]
└── Task 16: Quant HP physics tests [unspecified-high]

Wave 4 (Game Loop Integration — after Wave 3):
├── Task 17: Game.tsx — projectile refs, auto-fire, collision loop [deep]
├── Task 18: App.tsx + Menu.tsx — routing, weapon props, sync [quick]
├── Task 19: Shop + WeaponSelector tests [unspecified-high]
└── Task 20: Game integration tests [unspecified-high]

Wave FINAL (Verification — after ALL tasks):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review — lint + test + build [unspecified-high]
├── Task F3: Real QA — Playwright gameplay verification [unspecified-high]
└── Task F4: Scope fidelity check [deep]

Critical Path: T1 → T4 → T6 → T8 → T11 → T17 → T20 → Final
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 5 (Waves 1 & 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | — | T4, T6, T8, T11, T14 |
| T2 | — | T5, T8, T9 |
| T3 | — | T8, T11 |
| T4 | T1 | T6, T14 |
| T5 | T2 | T9, T17 |
| T6 | T1, T4 | T7, T10, T14, T17, T18 |
| T7 | T6 | T18 |
| T8 | T1, T2, T3 | T11, T15, T17 |
| T9 | T2, T5 | T16, T17 |
| T10 | T6 | — |
| T11 | T1, T3, T8 | T17 |
| T12 | T2 | T17 |
| T13 | — | T14, T18, T19 |
| T14 | T1, T4, T6, T13 | T18, T19 |
| T15 | T8 | — |
| T16 | T9 | — |
| T17 | T5, T6, T8, T9, T11, T12 | T20 |
| T18 | T6, T7, T13, T14 | T20 |
| T19 | T13, T14 | — |
| T20 | T17, T18 | Final |

### Agent Dispatch Summary

- **Wave 1**: 5 tasks — T1→`quick`, T2→`quick`, T3→`quick`, T4→`unspecified-high`, T5→`quick`
- **Wave 2**: 5 tasks — T6→`unspecified-high`, T7→`quick`, T8→`deep`, T9→`unspecified-high`, T10→`unspecified-high`
- **Wave 3**: 6 tasks — T11→`visual-engineering`, T12→`visual-engineering`, T13→`visual-engineering`, T14→`visual-engineering`, T15→`unspecified-high`, T16→`unspecified-high`
- **Wave 4**: 4 tasks — T17→`deep`, T18→`quick`, T19→`unspecified-high`, T20→`unspecified-high`
- **Final**: 4 tasks — F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`, F4→`deep`

---

## TODOs

- [ ] 1. Weapon Types & Interfaces

  **What to do**:
  - Create `src/types/weapons.ts` mirroring the structure of `src/types/skins.ts`
  - Define `WeaponCategory` type: `'ballistic' | 'fire' | 'laser' | 'explosive'`
  - Define `Weapon` interface with fields: `id: number`, `name: string`, `category: WeaponCategory`, `damage: number`, `cooldown: number` (frames between shots), `projectileSpeed: number`, `projectileSize: { width: number, height: number }`, `price: number`, `emoji: string`, `description: string`, `projectileColor: string`
  - Define `WEAPON_CATEGORIES` array (like `SKIN_CATEGORIES`): `[{ id: WeaponCategory, name: string, emoji: string }]` — Ballistic 🔫, Fire 🔥, Laser ⚡, Explosive 💣
  - Add helper functions: `getWeaponById(id: number): Weapon | undefined`, `getWeaponsByCategory(category: WeaponCategory): Weapon[]`
  - Do NOT populate the 50 weapons here — that's Task 4

  **Must NOT do**:
  - Do not add weapon stats/data (that's Task 4)
  - Do not add any persistence/manager logic
  - Do not add projectile types (that's Task 3)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
    - Simple type definition file following existing pattern

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Tasks 4, 6, 8, 11, 14
  - **Blocked By**: None

  **References**:
  - `src/types/skins.ts` — **Mirror this file exactly**. Copy the structure: type alias for category, interface for Skin→Weapon, const array for categories, helper functions. This is the canonical pattern.
  - `src/types/skins.ts:SkinCategory` — Shows how category type is defined as a union of string literals
  - `src/types/skins.ts:SKIN_CATEGORIES` — Shows the category array structure with id/name/emoji

  **Acceptance Criteria**:
  - [ ] `src/types/weapons.ts` exists with `Weapon` interface, `WeaponCategory` type, `WEAPON_CATEGORIES` array
  - [ ] `getWeaponById` and `getWeaponsByCategory` exported
  - [ ] TypeScript compiles: `npx tsc --noEmit src/types/weapons.ts` → no errors

  **QA Scenarios**:
  ```
  Scenario: Weapon types compile and export correctly
    Tool: Bash
    Steps:
      1. Run: npx tsc --noEmit
      2. Run: npx vitest run -t "weapon types" (if test exists)
    Expected Result: Zero TypeScript errors
    Evidence: .sisyphus/evidence/task-1-types-compile.txt

  Scenario: Verify interface has all required fields
    Tool: Bash (grep)
    Steps:
      1. Search src/types/weapons.ts for: id, name, category, damage, cooldown, projectileSpeed, price, emoji
    Expected Result: All fields present in Weapon interface
    Evidence: .sisyphus/evidence/task-1-interface-fields.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(weapons): add weapon types, interfaces, and category definitions`
  - Files: `src/types/weapons.ts`

- [ ] 2. Quant HP Type Extensions

  **What to do**:
  - Modify `src/types/game.ts` to add HP-related fields to the `Quant` interface:
    - `hp: number` — current health points
    - `maxHp: number` — maximum health points (for potential future use and damage flash calculation)
    - `flashTimer: number` — frames remaining for damage flash effect (0 = no flash)
  - Keep `isDead` as an existing field but document that it should be set when `hp <= 0`
  - Do NOT remove any existing Quant fields — only add new ones

  **Must NOT do**:
  - Do not remove `isDead` field — it's used in ~15+ places
  - Do not modify any other types in game.ts
  - Do not add Projectile type here (that's Task 3)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: Tasks 5, 8, 9
  - **Blocked By**: None

  **References**:
  - `src/types/game.ts:Quant` — Current Quant interface. Add hp, maxHp, flashTimer fields. Do NOT remove isDead.
  - `src/utils/gamePhysics.ts:updateQuantPhysics` — Uses quant.isDead to skip updates. Must remain working.
  - `src/utils/gameRenderer.ts:drawQuants` — Uses quant.isDead to skip rendering. Must remain working.
  - `src/components/Game.tsx` — Sets `quant.isDead = true` on stomp/kill. Pattern must be preserved.

  **Acceptance Criteria**:
  - [ ] Quant interface has `hp`, `maxHp`, `flashTimer` fields
  - [ ] `isDead` field remains on Quant
  - [ ] `npx tsc --noEmit` passes (no type errors)
  - [ ] `npm run test:run` passes (existing tests unbroken)

  **QA Scenarios**:
  ```
  Scenario: Existing tests pass after type change
    Tool: Bash
    Steps:
      1. Run: npm run test:run
    Expected Result: All existing tests pass (0 failures)
    Evidence: .sisyphus/evidence/task-2-existing-tests.txt

  Scenario: TypeScript compiles with new fields
    Tool: Bash
    Steps:
      1. Run: npx tsc --noEmit
    Expected Result: Zero errors
    Evidence: .sisyphus/evidence/task-2-compile.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(weapons): add HP fields to Quant interface`
  - Files: `src/types/game.ts`

- [ ] 3. Projectile Type Definition

  **What to do**:
  - Add `Projectile` interface to `src/types/game.ts`:
    - `id: number`
    - `x: number` (world-space X position)
    - `y: number` (world-space Y position)
    - `vx: number` (horizontal velocity — projectileSpeed from weapon)
    - `width: number`
    - `height: number`
    - `damage: number` (from weapon stats)
    - `life: number` (frames remaining — TTL, suggest 300 frames = 5 seconds at 60fps)
    - `category: WeaponCategory` (determines visual style)
    - `color: string` (projectile color from weapon)
  - Import `WeaponCategory` from `../types/weapons` (or co-locate if Task 1 not done yet — use string literal union as fallback)

  **Must NOT do**:
  - Do not add physics/update logic (that's Task 8)
  - Do not add rendering logic (that's Task 11)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: Tasks 8, 11
  - **Blocked By**: None (can use string literal for WeaponCategory if Task 1 not done)

  **References**:
  - `src/types/game.ts` — Where to add the Projectile interface alongside Player, Quant, etc.
  - `src/types/game.ts:Quant` — Similar entity structure (x, y, width, height, id pattern)
  - `src/types/game.ts:DroppedCoin` — Another world-space entity with similar fields pattern

  **Acceptance Criteria**:
  - [ ] `Projectile` interface exported from `src/types/game.ts`
  - [ ] All fields present: id, x, y, vx, width, height, damage, life, category, color
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Projectile type compiles
    Tool: Bash
    Steps:
      1. Run: npx tsc --noEmit
    Expected Result: Zero errors
    Evidence: .sisyphus/evidence/task-3-compile.txt
  ```

  **Commit**: YES (groups with Wave 1 — can merge with Task 2 since same file)
  - Message: `feat(weapons): add Projectile type definition`
  - Files: `src/types/game.ts`

- [ ] 4. 50 Weapon Definitions with Stats

  **What to do**:
  - Populate the `WEAPONS` array in `src/types/weapons.ts` with all 50 weapons
  - **Ballistic (20 weapons, IDs 1-20)**: Pistol → Revolver → Desert Eagle → Shotgun → Sawed-Off → Double Barrel → SMG → UZI → MP5 → P90 → AK-47 → M16 → AR-15 → SCAR → M4A1 → LMG → Minigun → Gatling Gun → Sniper Rifle → Barrett .50 Cal
    - Stats progression: damage 5→50, cooldown 30→5 frames, speed 8→20, price 50→5000
  - **Fire (10 weapons, IDs 21-30)**: Match → Torch → Flare Gun → Molotov → Flame Pistol → Flamethrower → Napalm Sprayer → Dragon's Breath → Phoenix Cannon → Inferno Core
    - Stats: damage 8→60, cooldown 25→8, speed 6→15, price 100→6000
  - **Laser (10 weapons, IDs 31-40)**: Flashlight → Laser Pointer → Light Pistol → Pulse Blaster → Ion Beam → Plasma Rifle → Photon Cannon → Quantum Ray → Nova Beam → Death Ray
    - Stats: damage 10→70, cooldown 20→4, speed 12→25, price 150→7000
  - **Explosive (10 weapons, IDs 41-50)**: Firecracker → Cherry Bomb → Grenade → Pipe Bomb → Dynamite Bundle → C4 → RPG → Mortar → Missile Launcher → Nuclear Launcher
    - Stats: damage 15→100, cooldown 60→15, speed 5→12, price 200→10000
  - Each weapon needs: id, name, category, damage, cooldown, projectileSpeed, projectileSize, price, emoji, description, projectileColor
  - Ensure stats scale progressively within each category (monotonically increasing damage, decreasing cooldown)
  - Ensure prices correlate with effectiveness (damage × fire-rate proxy)
  - Add `DEFAULT_WEAPON_PRICE` constant (like `SKIN_PRICE` in skinManager)

  **Must NOT do**:
  - Do not add AoE or splash damage stats
  - Do not add ammo counts
  - Do not add upgrade paths or levels
  - Do not generate weapons procedurally — all 50 must be explicit const data

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
    - Reason: Large data definition requiring careful stat balancing across 50 items

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5) — but depends on Task 1 for the Weapon interface
  - **Blocks**: Tasks 6, 14
  - **Blocked By**: Task 1

  **References**:
  - `src/types/skins.ts:SKINS` — **Mirror this pattern exactly**. Large const array with 100+ items. Each item fully typed.
  - `src/types/weapons.ts` (created in Task 1) — The Weapon interface to implement against
  - Price reference: Skins cost ~200 coins as default. Weapons should start at 50 (cheapest pistol) and go up to 10000 (nuclear launcher) to create progression.

  **Acceptance Criteria**:
  - [ ] WEAPONS array has exactly 50 items
  - [ ] 20 ballistic (IDs 1-20), 10 fire (IDs 21-30), 10 laser (IDs 31-40), 10 explosive (IDs 41-50)
  - [ ] All IDs unique
  - [ ] Damage increases within each category (first weapon < last weapon)
  - [ ] Price increases with effectiveness
  - [ ] All required fields populated (no undefined/empty strings)
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: All 50 weapons defined with valid data
    Tool: Bash (vitest)
    Steps:
      1. Create test: npx vitest run -t "should define 50 weapons"
      2. Verify: WEAPONS.length === 50
      3. Verify: WEAPONS.filter(w => w.category === 'ballistic').length === 20
      4. Verify: WEAPONS.filter(w => w.category === 'fire').length === 10
      5. Verify: WEAPONS.filter(w => w.category === 'laser').length === 10
      6. Verify: WEAPONS.filter(w => w.category === 'explosive').length === 10
      7. Verify: all IDs unique (new Set(WEAPONS.map(w=>w.id)).size === 50)
    Expected Result: All assertions pass
    Evidence: .sisyphus/evidence/task-4-weapon-count.txt

  Scenario: Stats scale within categories
    Tool: Bash (vitest)
    Steps:
      1. For each category: verify damage of weapon[i] <= damage of weapon[i+1]
      2. Verify price of weapon[i] <= price of weapon[i+1] within same category
    Expected Result: Monotonically non-decreasing damage and price per category
    Evidence: .sisyphus/evidence/task-4-stat-scaling.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(weapons): define 50 weapons across 4 categories with balanced stats`
  - Files: `src/types/weapons.ts`

- [ ] 5. Quant HP Config & Level Scaling Constants

  **What to do**:
  - Add `QUANT_HP_CONFIG` to `src/constants/gameConfig.ts`:
    - Base HP by quant type: `{ static: 20, moving: 40, jumping: 60 }`
    - Level scaling multiplier: `levelHpMultiplier: number[]` — e.g. `[1.0, 1.5, 2.0]` for levels 1-3
    - Formula: `quant.maxHp = baseHp[type] * levelHpMultiplier[levelIndex]`
  - Modify `createStaticQuant`, `createMovingQuant`, `createJumpingQuant` factory functions to accept an optional `levelIndex` parameter and set `hp`, `maxHp`, `flashTimer: 0` on created quants
  - Ensure existing factory calls without levelIndex default to `levelIndex = 0` (backwards compatible)

  **Must NOT do**:
  - Do not add damage resistance per quant type
  - Do not change quant movement or behavior
  - Do not modify how quants are placed in levels

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: Tasks 9, 17
  - **Blocked By**: Task 2 (needs HP fields on Quant interface)

  **References**:
  - `src/constants/gameConfig.ts:QUANT_CONFIG` — Existing quant config (size, speed, jumpForce, color). Add HP config alongside this.
  - `src/constants/gameConfig.ts:createStaticQuant` — Factory function. Add hp/maxHp/flashTimer initialization.
  - `src/constants/gameConfig.ts:createMovingQuant` — Same pattern.
  - `src/constants/gameConfig.ts:createJumpingQuant` — Same pattern.
  - `src/constants/gameConfig.ts:LEVELS` — Level definitions that call factory functions. May need to pass levelIndex.

  **Acceptance Criteria**:
  - [ ] `QUANT_HP_CONFIG` exported with base HP values per type and level multipliers
  - [ ] Factory functions create quants with hp, maxHp, flashTimer fields
  - [ ] Existing factory calls (without levelIndex) still work (default to level 0)
  - [ ] `npm run test:run` passes

  **QA Scenarios**:
  ```
  Scenario: Factory functions produce quants with HP
    Tool: Bash (vitest)
    Steps:
      1. Write test: createStaticQuant(100) produces quant with hp === 20, maxHp === 20
      2. Write test: createMovingQuant(200) produces quant with hp === 40
      3. Write test: createJumpingQuant(300) produces quant with hp === 60
    Expected Result: All assertions pass
    Evidence: .sisyphus/evidence/task-5-quant-hp.txt

  Scenario: Level scaling works
    Tool: Bash (vitest)
    Steps:
      1. Write test: createStaticQuant(100, 2) produces quant with hp === 40 (20 * 2.0 multiplier for level 3)
    Expected Result: HP scales correctly
    Evidence: .sisyphus/evidence/task-5-level-scaling.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(weapons): add quant HP config and level scaling`
  - Files: `src/constants/gameConfig.ts`

- [ ] 6. weaponManager.ts — Purchase, Equip, Persistence

  **What to do**:
  - Create `src/utils/weaponManager.ts` mirroring `src/utils/skinManager.ts` exactly:
    - Constants: `WEAPON_STORAGE_KEY = 'geometry-dash-selected-weapon'`, `OWNED_WEAPONS_KEY = 'geometry-dash-owned-weapons'`
    - Cache: `cachedOwnedWeaponIds: number[]`, `cachedSelectedWeaponId: number | null`, `cacheInitialized: boolean`
    - `DEFAULT_UNLOCKED_WEAPONS: number[] = []` — empty, no free weapons
  - Exports:
    - `getWeaponPrice(weaponId: number): number` — returns weapon.price from WEAPONS array
    - `isWeaponUnlocked(weaponId: number): boolean` — checks cachedOwnedWeaponIds
    - `unlockWeapon(weaponId: number): Promise<void>` — adds to cache, persists to localStorage/Firestore
    - `getSelectedWeaponId(): number | null` — returns cachedSelectedWeaponId (null = no weapon)
    - `getSelectedWeapon(): Weapon | null` — returns full weapon object or null
    - `setSelectedWeapon(weaponId: number): Promise<void>` — updates cache, persists
    - `getOwnedWeaponIds(): number[]` — returns cachedOwnedWeaponIds
    - `syncWeaponsFromCloud(): Promise<void>` — loads from Firestore/localStorage
    - `resetWeaponCache(): void` — for tests
    - `setOwnedWeapons(weaponNames: string[]): void` — for firestoreService merge
    - `setSelectedWeaponCache(weaponName: string): void` — for firestoreService merge
  - Persistence pattern:
    - Guest: localStorage (`WEAPON_STORAGE_KEY`, `OWNED_WEAPONS_KEY`)
    - Authenticated: `saveUserData({ ownedWeapons: [...], selectedWeapon: '...' })`
  - Implement `weaponIdToName` and `nameToWeaponId` helpers (like skins do)

  **Must NOT do**:
  - Do not add weapon upgrade logic
  - Do not introduce new state management patterns (no Context/Redux)
  - Do not modify walletManager.ts

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
    - Reason: Moderate complexity — persistence, cache pattern, Firestore integration

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10)
  - **Blocks**: Tasks 7, 10, 14, 17, 18
  - **Blocked By**: Tasks 1, 4

  **References**:
  - `src/utils/skinManager.ts` — **MIRROR THIS FILE EXACTLY**. Copy the entire cache pattern, the localStorage read/write pattern, the Firestore save pattern, the id↔name conversion. This is the authoritative template.
  - `src/utils/skinManager.ts:SKIN_STORAGE_KEY` — Shows the localStorage key naming convention
  - `src/utils/skinManager.ts:unlockSkin` — Shows how to add to owned list and persist
  - `src/utils/skinManager.ts:setSelectedSkin` — Shows how to persist selection
  - `src/utils/skinManager.ts:syncSkinsFromCloud` — Shows how cloud sync works
  - `src/utils/firestoreService.ts:saveUserData` — The persistence function to call
  - `src/utils/firestoreService.ts:loadUserData` — For reading weapon data from Firestore
  - `src/types/weapons.ts` (Task 1) — For Weapon interface and WEAPONS array

  **Acceptance Criteria**:
  - [ ] `src/utils/weaponManager.ts` exists with all exported functions listed above
  - [ ] Cache pattern matches skinManager.ts (cachedOwned, cachedSelected, cacheInitialized)
  - [ ] `getSelectedWeaponId()` returns `null` when no weapon owned/selected
  - [ ] `isWeaponUnlocked(id)` returns false for non-owned weapons
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: No weapon state by default
    Tool: Bash (vitest)
    Steps:
      1. Reset cache, clear localStorage
      2. Call getSelectedWeaponId() → expect null
      3. Call getOwnedWeaponIds() → expect []
      4. Call isWeaponUnlocked(1) → expect false
    Expected Result: All return empty/null/false defaults
    Evidence: .sisyphus/evidence/task-6-no-weapon-default.txt

  Scenario: Purchase and equip flow
    Tool: Bash (vitest)
    Steps:
      1. Call unlockWeapon(1)
      2. Call isWeaponUnlocked(1) → expect true
      3. Call setSelectedWeapon(1)
      4. Call getSelectedWeaponId() → expect 1
      5. Verify localStorage has the weapon data
    Expected Result: Full purchase/equip cycle works
    Evidence: .sisyphus/evidence/task-6-purchase-equip.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(weapons): add weaponManager with purchase, equip, and persistence`
  - Files: `src/utils/weaponManager.ts`

- [ ] 7. Firestore UserData Extension + Sync

  **What to do**:
  - Modify `src/utils/firestoreService.ts`:
    - Add `ownedWeapons?: string[]` and `selectedWeapon?: string` to `UserData` interface
    - Add localStorage keys: `LOCAL_KEYS.ownedWeapons = 'geometry-dash-owned-weapons'`, `LOCAL_KEYS.selectedWeapon = 'geometry-dash-selected-weapon'`
    - Update `syncLocalToCloud` merge logic: merge ownedWeapons (union of local and cloud arrays), selectedWeapon (local wins, like selectedSkin)
    - Update `loadUserData` to return weapon fields
    - Update `saveUserData` to accept weapon fields
    - Ensure backwards compatibility: if cloud doc has no weapon fields, default to `ownedWeapons: []`, `selectedWeapon: ''`

  **Must NOT do**:
  - Do not change how coins, skins, or progress are synced
  - Do not add Firestore transactions or Cloud Functions

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 8, 9, 10)
  - **Blocks**: Tasks 18
  - **Blocked By**: Task 6

  **References**:
  - `src/utils/firestoreService.ts:UserData` — Current interface. Add ownedWeapons and selectedWeapon fields.
  - `src/utils/firestoreService.ts:LOCAL_KEYS` — Add new localStorage key mappings.
  - `src/utils/firestoreService.ts:syncLocalToCloud` — Shows merge logic for skins. Mirror for weapons (union arrays, local-wins for selection).
  - `src/utils/firestoreService.ts:loadUserData` — Returns user data. Must include weapon fields with defaults.
  - `src/utils/firestoreService.ts:saveUserData` — Already accepts partial UserData. Should work if fields are added to interface.

  **Acceptance Criteria**:
  - [ ] `UserData` interface includes `ownedWeapons?: string[]` and `selectedWeapon?: string`
  - [ ] `LOCAL_KEYS` includes weapon key mappings
  - [ ] `syncLocalToCloud` handles weapon merge
  - [ ] Old Firestore docs without weapon fields don't cause errors
  - [ ] `npm run test:run` passes (existing firestoreService tests)

  **QA Scenarios**:
  ```
  Scenario: Backwards compatibility
    Tool: Bash (vitest)
    Steps:
      1. Mock loadUserData returning old data (no weapon fields)
      2. Verify no crash
      3. Verify ownedWeapons defaults to []
    Expected Result: Graceful handling of missing fields
    Evidence: .sisyphus/evidence/task-7-backwards-compat.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(weapons): extend Firestore UserData with weapon fields`
  - Files: `src/utils/firestoreService.ts`

- [ ] 8. Projectile Physics — Update, Collision, Spawn

  **What to do**:
  - Create `src/utils/projectilePhysics.ts` with:
    - `createProjectile(player: Player, weapon: Weapon, cameraX: number): Projectile` — spawns projectile at player's right edge, world-space X = player.x + player.width + cameraX, Y = player.y + player.height/2
    - `updateProjectiles(projectiles: Projectile[]): Projectile[]` — move each by vx, decrement life, filter out life <= 0
    - `checkProjectileQuantCollision(projectile: Projectile, quant: Quant, cameraX: number): boolean` — AABB collision between projectile and quant (both in world-space)
    - `checkAllProjectileCollisions(projectiles: Projectile[], quants: Quant[], cameraX: number): ProjectileHit[]` — returns array of `{ projectileId: number, quantId: number, damage: number }`
    - `ProjectileHit` type: `{ projectileId: number, quantId: number, damage: number }`
  - Collision rules:
    - Skip quants where `quant.isDead === true` or `quant.hp <= 0`
    - Each projectile hits at most ONE quant (first collision found), then is consumed
    - Max active projectiles: `MAX_PROJECTILES = 50`
  - Performance: only check collisions for projectiles and quants that are on-screen (within canvasWidth of cameraX)

  **Must NOT do**:
  - Do not add AoE/splash damage
  - Do not add projectile gravity or arcing
  - Do not add projectile-obstacle collision
  - Do not modify existing gamePhysics.ts collision functions

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
    - Reason: Core physics and collision logic — must be precise and performant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 9, 10)
  - **Blocks**: Tasks 11, 15, 17
  - **Blocked By**: Tasks 1, 2, 3

  **References**:
  - `src/utils/gamePhysics.ts:checkQuantCollision` — **Follow this AABB collision pattern**. Shows how to convert between world-space and screen-space for collision detection.
  - `src/utils/gamePhysics.ts:checkAllQuantCollisions` — Shows the iteration pattern (filter on-screen quants first, return typed results).
  - `src/utils/gamePhysics.ts:createQuantDeathParticles` — Shows how to create death effects (you'll reference this from Game.tsx integration, not here).
  - `src/types/game.ts:Projectile` (Task 3) — The Projectile type.
  - `src/types/game.ts:Player` — Player position fields (x, y, width, height) for spawn calculation.

  **Acceptance Criteria**:
  - [ ] `src/utils/projectilePhysics.ts` exists with all functions listed
  - [ ] createProjectile spawns at player's right edge in world-space
  - [ ] updateProjectiles moves projectiles and removes expired ones
  - [ ] Collision detection uses AABB
  - [ ] Dead quants (isDead or hp<=0) are skipped
  - [ ] Each projectile hits at most one quant
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Projectile creation at correct position
    Tool: Bash (vitest)
    Steps:
      1. Create player at x=50, y=400, width=40, height=40, cameraX=100
      2. Call createProjectile(player, weapon, cameraX)
      3. Expect projectile.x = 50 + 40 + 100 = 190 (world-space)
      4. Expect projectile.y = 400 + 20 = 420 (center of player)
    Expected Result: Correct world-space spawn position
    Evidence: .sisyphus/evidence/task-8-spawn-position.txt

  Scenario: Projectile-quant collision detection
    Tool: Bash (vitest)
    Steps:
      1. Create projectile at world x=200, y=420, width=10, height=5
      2. Create quant at world x=195, y=415, width=30, height=30, hp=20
      3. Check collision → expect true
      4. Create quant with isDead=true → expect false (skipped)
    Expected Result: Collision detected for live quants, skipped for dead
    Evidence: .sisyphus/evidence/task-8-collision.txt

  Scenario: Projectile lifetime expiry
    Tool: Bash (vitest)
    Steps:
      1. Create projectile with life=1
      2. Call updateProjectiles([projectile])
      3. Expect result to be empty array (filtered out)
    Expected Result: Expired projectiles removed
    Evidence: .sisyphus/evidence/task-8-lifetime.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(weapons): add projectile physics and collision detection`
  - Files: `src/utils/projectilePhysics.ts`

- [ ] 9. Quant HP Physics — Damage, isDead Derivation, Stomp Override

  **What to do**:
  - Modify `src/utils/gamePhysics.ts`:
    - Add `applyDamageToQuant(quant: Quant, damage: number): void` — reduces quant.hp by damage, sets quant.flashTimer = 6 (100ms flash), if hp <= 0 then set quant.isDead = true
    - Add `updateQuantFlash(quant: Quant): void` — decrements flashTimer each frame if > 0
    - Modify `updateAllQuants` to call `updateQuantFlash` on each quant
    - Ensure stomp handling in collision results still sets `quant.isDead = true` directly (instant kill, bypasses HP)
  - Do NOT change the checkQuantCollision or checkAllQuantCollisions return types
  - The existing stomp detection logic remains unchanged — Game.tsx will continue to set `quant.isDead = true` on stomp

  **Must NOT do**:
  - Do not change stomp to deal "stomp damage" — stomp is always instant kill
  - Do not add damage resistance or armor
  - Do not modify collision detection logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 10)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Tasks 2, 5

  **References**:
  - `src/utils/gamePhysics.ts:updateAllQuants` — Add flashTimer decrement call here.
  - `src/utils/gamePhysics.ts:updateQuantPhysics` — Per-quant update. Add flash logic here or in updateAllQuants.
  - `src/components/Game.tsx` — Where stomp kills happen (sets isDead = true). This file is NOT modified in this task — stomp behavior preserved.
  - `src/types/game.ts:Quant` (Task 2) — hp, maxHp, flashTimer fields.

  **Acceptance Criteria**:
  - [ ] `applyDamageToQuant` exported, reduces hp and sets flashTimer
  - [ ] `applyDamageToQuant` sets isDead = true when hp <= 0
  - [ ] `updateQuantFlash` decrements flashTimer
  - [ ] Existing stomp behavior unchanged (no references modified)
  - [ ] `npm run test:run` passes

  **QA Scenarios**:
  ```
  Scenario: Damage reduces HP and triggers flash
    Tool: Bash (vitest)
    Steps:
      1. Create quant with hp=40, maxHp=40
      2. Call applyDamageToQuant(quant, 15)
      3. Expect quant.hp === 25
      4. Expect quant.flashTimer === 6
      5. Expect quant.isDead === false
    Expected Result: HP reduced, flash active, not dead
    Evidence: .sisyphus/evidence/task-9-damage.txt

  Scenario: Lethal damage kills quant
    Tool: Bash (vitest)
    Steps:
      1. Create quant with hp=10
      2. Call applyDamageToQuant(quant, 15)
      3. Expect quant.hp <= 0
      4. Expect quant.isDead === true
    Expected Result: Quant dies when HP depleted
    Evidence: .sisyphus/evidence/task-9-lethal.txt

  Scenario: Flash timer decrements
    Tool: Bash (vitest)
    Steps:
      1. Create quant with flashTimer=3
      2. Call updateQuantFlash(quant)
      3. Expect quant.flashTimer === 2
    Expected Result: Timer decreases by 1 each call
    Evidence: .sisyphus/evidence/task-9-flash-timer.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(weapons): add quant HP damage system and flash timer`
  - Files: `src/utils/gamePhysics.ts`

- [ ] 10. weaponManager Tests

  **What to do**:
  - Create `src/utils/__tests__/weaponManager.test.ts` following the pattern of existing manager tests
  - Test cases:
    - Default state: no weapons owned, no weapon selected (returns null/[])
    - `isWeaponUnlocked(id)` returns false for non-owned, true for owned
    - `unlockWeapon(id)` adds weapon to owned list, persists to localStorage
    - `setSelectedWeapon(id)` updates selection, persists
    - `getSelectedWeapon()` returns full Weapon object or null
    - `getWeaponPrice(id)` returns correct price from WEAPONS data
    - `syncWeaponsFromCloud()` loads data from Firestore mock
    - `resetWeaponCache()` clears all cache
    - Backwards compatibility: missing localStorage keys don't crash
  - Mock Firebase before imports (standard pattern from AGENTS.md)

  **Must NOT do**:
  - Do not test walletManager or skinManager (those have their own tests)
  - Do not test UI components

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 9)
  - **Blocks**: None
  - **Blocked By**: Task 6

  **References**:
  - `src/utils/__tests__/walletManager.test.ts` — **Follow this test pattern**. Shows mock setup, beforeEach cleanup, and assertion style.
  - `src/utils/__tests__/authService.test.ts` — Shows Firebase mocking pattern (vi.mock before imports).
  - `src/utils/weaponManager.ts` (Task 6) — The module under test.
  - `src/test/setup.ts` — Global test setup with localStorage mock.

  **Acceptance Criteria**:
  - [ ] `src/utils/__tests__/weaponManager.test.ts` exists
  - [ ] All test cases listed above are implemented
  - [ ] `npx vitest run src/utils/__tests__/weaponManager.test.ts` → all pass

  **QA Scenarios**:
  ```
  Scenario: All weaponManager tests pass
    Tool: Bash
    Steps:
      1. Run: npx vitest run src/utils/__tests__/weaponManager.test.ts --reporter=verbose
    Expected Result: All tests pass (0 failures)
    Evidence: .sisyphus/evidence/task-10-tests.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `test(weapons): add weaponManager unit tests`
  - Files: `src/utils/__tests__/weaponManager.test.ts`

- [ ] 11. Projectile Renderer — Category-Themed Drawing

  **What to do**:
  - Create `src/utils/projectileRenderer.ts` with:
    - `drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[], cameraX: number, time: number): void`
    - Category-themed rendering:
      - **Ballistic**: Small bright yellow/orange dots with a short trail (3-4 px circle + 2px trail line behind)
      - **Fire**: Orange-red flame shape with flickering glow effect (use time for animation). Draw teardrop/flame shape with gradient, add subtle glow using ctx.shadowBlur
      - **Laser**: Long thin beam (narrow rectangle, 2-3px height) with bright core color and outer glow. Slight pulse using time (oscillate shadowBlur). Color: bright cyan/green
      - **Explosive**: Larger projectile (8-10px sphere) with orange/red color, spark trail particles behind it. On hit (when projectile is consumed), the Game.tsx will spawn explosion particles — just draw the projectile itself here
    - Each projectile drawn at screenX = projectile.x - cameraX, screenY = projectile.y
    - Use `projectile.category` to select drawing style
    - Use `projectile.color` for the base color

  **Must NOT do**:
  - Do not handle collision responses (that's Game.tsx)
  - Do not add explosion effects on hit (Game.tsx handles particles)
  - Do not modify existing gameRenderer.ts functions

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - Reason: Canvas rendering with visual effects, animations, and category-themed aesthetics

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12, 13, 14, 15, 16)
  - **Blocks**: Task 17
  - **Blocked By**: Tasks 1, 3, 8

  **References**:
  - `src/utils/gameRenderer.ts:drawQuants` — **Follow this canvas drawing pattern**. Shows how to draw entities with world-to-screen conversion (entity.x - cameraX), how to use ctx.save/restore, shadows, gradients.
  - `src/utils/gameRenderer.ts:drawParticles` — Shows particle-style drawing with time-based animation effects.
  - `src/utils/gameRenderer.ts:drawPlayer` — Shows gradient fills, glow effects with ctx.shadowBlur/shadowColor.
  - `src/types/game.ts:Projectile` (Task 3) — Projectile fields: x, y, width, height, category, color.

  **Acceptance Criteria**:
  - [ ] `src/utils/projectileRenderer.ts` exists
  - [ ] `drawProjectiles` exported with correct signature
  - [ ] 4 distinct visual styles for ballistic/fire/laser/explosive
  - [ ] World-to-screen conversion: screenX = x - cameraX
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Projectile renderer compiles
    Tool: Bash
    Steps:
      1. Run: npx tsc --noEmit
    Expected Result: Zero errors
    Evidence: .sisyphus/evidence/task-11-compile.txt

  Scenario: Visual verification via Playwright
    Tool: Playwright
    Preconditions: Game running with weapon equipped
    Steps:
      1. Navigate to localhost:5173
      2. Purchase a weapon and start level
      3. Wait for auto-fire to produce projectiles
      4. Screenshot the gameplay
    Expected Result: Projectiles visible on canvas, themed by weapon category
    Evidence: .sisyphus/evidence/task-11-visual.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `feat(weapons): add category-themed projectile rendering`
  - Files: `src/utils/projectileRenderer.ts`

- [ ] 12. Quant Damage Flash + Weapon HUD Renderer

  **What to do**:
  - Modify `src/utils/gameRenderer.ts`:
    - Update `drawQuants` to check `quant.flashTimer > 0`: if flashing, draw the quant with a white overlay (semi-transparent white fill over the quant body, or use `ctx.globalCompositeOperation = 'lighter'` briefly). The flash should be visually obvious — bright white flash that fades.
    - Add `drawWeaponHUD(ctx: CanvasRenderingContext2D, weapon: Weapon | null, canvasWidth: number, canvasHeight: number): void` — draws a small weapon icon/indicator in the bottom-left corner of the canvas:
      - If weapon is null: draw nothing (no weapon equipped)
      - If weapon exists: draw a small rounded rectangle (48x48px) with weapon emoji inside, weapon name below in small text. Use semi-transparent dark background with weapon category color border.
  - Ensure flashTimer=0 means no visual change (backwards compatible for existing quants without HP)

  **Must NOT do**:
  - Do not add HP bars above quants
  - Do not change how quants are drawn when not flashing
  - Do not add weapon rendering on the player cube

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 13, 14, 15, 16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 2 (needs flashTimer field on Quant)

  **References**:
  - `src/utils/gameRenderer.ts:drawQuants` — Modify this function. Currently draws quants with colors and eyes/features. Add flash overlay when flashTimer > 0.
  - `src/utils/gameRenderer.ts:drawCoins` — Shows HUD-style drawing on canvas (coin count display). Pattern for the weapon HUD.
  - `src/utils/gameRenderer.ts:drawProgressBar` — Another HUD element. Shows positioning relative to canvas dimensions.
  - `src/types/game.ts:Quant` — flashTimer field (Task 2).
  - `src/types/weapons.ts:Weapon` — emoji and name fields for HUD display.

  **Acceptance Criteria**:
  - [ ] Quants flash white when flashTimer > 0
  - [ ] Flash is visually distinct (not subtle)
  - [ ] Weapon HUD appears in bottom-left when weapon is equipped
  - [ ] No HUD when weapon is null
  - [ ] Existing quant rendering unchanged when flashTimer = 0
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Quant flash rendering
    Tool: Playwright
    Preconditions: Game running, weapon equipped
    Steps:
      1. Start a level with quants
      2. Wait for auto-fire to hit a quant
      3. Screenshot during flash
    Expected Result: Quant visibly flashes white on damage
    Evidence: .sisyphus/evidence/task-12-flash.png

  Scenario: Weapon HUD display
    Tool: Playwright
    Steps:
      1. Navigate to game with weapon equipped
      2. Start a level
      3. Screenshot showing bottom-left corner
    Expected Result: Weapon icon with emoji and name visible in bottom-left
    Evidence: .sisyphus/evidence/task-12-hud.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `feat(weapons): add quant damage flash and weapon HUD display`
  - Files: `src/utils/gameRenderer.ts`

- [ ] 13. Shop.tsx — Tabbed Container (Skins + Weapons Tabs)

  **What to do**:
  - Create `src/components/Shop.tsx` — a new container component that wraps both SkinSelector and WeaponSelector:
    - Header with Back button and coin display (moved from SkinSelector)
    - Tab bar with 2 tabs: "🎨 Skins" and "🔫 Weapons"
    - Active tab renders the corresponding content component
    - Tab state managed with useState
    - Pass `onBack` prop through to parent
  - Create `src/components/Shop.css` with:
    - Tab bar styling (horizontal tabs, active/inactive states)
    - Follow existing glass-morphism and neon aesthetic from SkinSelector.css
    - Active tab: highlighted with glow effect
    - Responsive layout
  - Modify `src/components/SkinSelector.tsx`:
    - Remove the header/back button/coin display (now handled by Shop.tsx)
    - SkinSelector becomes a "tab content" component — receives coins as prop instead of managing its own header
    - Keep all existing purchase/equip logic intact
    - Export the component (it's now embedded in Shop)

  **Must NOT do**:
  - Do not change skin purchase, selection, or display logic
  - Do not modify the skins grid or category filters
  - Do not add weapon content (that's Task 14)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - Reason: UI/UX design for tab system, visual consistency with existing shop

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12, 14, 15, 16)
  - **Blocks**: Tasks 14, 18, 19
  - **Blocked By**: None (only restructures existing components)

  **References**:
  - `src/components/SkinSelector.tsx` — **The component to refactor**. Move header to Shop.tsx. Keep purchase logic intact. This becomes a child of Shop.
  - `src/components/SkinSelector.css` — Visual styling to follow. The tab bar should match this aesthetic.
  - `src/components/Menu.tsx` — Shows how onOpenSkins flows. Will become onOpenShop in Task 18.
  - `src/App.tsx` — Currently routes to SkinSelector. Will route to Shop in Task 18.

  **Acceptance Criteria**:
  - [ ] `src/components/Shop.tsx` exists with tab system
  - [ ] `src/components/Shop.css` exists with tab styling
  - [ ] Skins tab renders SkinSelector content
  - [ ] Weapons tab renders placeholder (WeaponSelector not built yet — show "Coming soon" or empty)
  - [ ] Back button works
  - [ ] Coin display in header
  - [ ] Existing skin functionality 100% preserved
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Tab switching works
    Tool: Playwright
    Steps:
      1. Navigate to shop
      2. Verify Skins tab is active by default
      3. Verify skins grid is visible
      4. Click "Weapons" tab
      5. Verify Weapons content appears
      6. Click "Skins" tab again
      7. Verify skins grid is back
    Expected Result: Smooth tab switching, skins content preserved
    Evidence: .sisyphus/evidence/task-13-tabs.png

  Scenario: Existing skin purchase unchanged
    Tool: Playwright
    Steps:
      1. Navigate to shop > Skins tab
      2. Find a locked skin
      3. Purchase it (if coins sufficient)
      4. Verify coin deduction and skin unlocked
    Expected Result: Purchase flow identical to before
    Evidence: .sisyphus/evidence/task-13-skin-purchase.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `feat(weapons): add tabbed Shop container with Skins and Weapons tabs`
  - Files: `src/components/Shop.tsx`, `src/components/Shop.css`, `src/components/SkinSelector.tsx`

- [ ] 14. WeaponSelector.tsx — Weapon Shop Tab Content

  **What to do**:
  - Create `src/components/WeaponSelector.tsx` mirroring SkinSelector's structure:
    - Category filter: "All" + WEAPON_CATEGORIES tabs (Ballistic, Fire, Laser, Explosive)
    - Weapons grid: display all weapons filtered by selected category
    - Weapon card: emoji preview, name, category badge, price, buy/equip button
    - Buy flow: check coins >= price → spendCoins(price) → unlockWeapon(weaponId) → setSelectedWeapon(weaponId) → update UI
    - Equip flow: click on owned weapon → setSelectedWeapon(weaponId)
    - Show "Equipped" badge on currently selected weapon
    - Show locked/owned state per weapon
    - Stats display on each card: damage, fire rate (derived from cooldown), tooltip or small text
  - Create `src/components/WeaponSelector.css`:
    - Grid layout matching SkinSelector grid
    - Category-themed card borders (ballistic=yellow, fire=red, laser=cyan, explosive=orange)
    - Weapon stats display styling
    - Follow glass-morphism aesthetic

  **Must NOT do**:
  - Do not add weapon preview animation
  - Do not add weapon comparison UI
  - Do not add weapon upgrade buttons

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]
    - Reason: Full shop UI with purchase flow, category filters, styled cards

  **Parallelization**:
  - **Can Run In Parallel**: YES (needs Tasks 1, 4, 6, 13 done)
  - **Parallel Group**: Wave 3 (with Tasks 11, 12, 13, 15, 16)
  - **Blocks**: Tasks 18, 19
  - **Blocked By**: Tasks 1, 4, 6, 13

  **References**:
  - `src/components/SkinSelector.tsx` — **Mirror this component's structure**. Category filter, grid, card with buy/equip button, purchase flow handlers.
  - `src/components/SkinSelector.css` — **Mirror the styling patterns**. Grid layout, card design, button styles.
  - `src/utils/weaponManager.ts` (Task 6) — isWeaponUnlocked, unlockWeapon, setSelectedWeapon, getSelectedWeaponId, getWeaponPrice, getOwnedWeaponIds
  - `src/utils/walletManager.ts` — getTotalCoins, spendCoins for purchase flow
  - `src/types/weapons.ts` (Tasks 1, 4) — WEAPONS array, WEAPON_CATEGORIES, getWeaponsByCategory

  **Acceptance Criteria**:
  - [ ] `src/components/WeaponSelector.tsx` exists with category filter and weapons grid
  - [ ] Purchase flow: coins deducted, weapon unlocked, auto-equipped
  - [ ] Category filter shows 4 categories + "All"
  - [ ] Equipped weapon shows badge
  - [ ] Locked weapons show price + buy button
  - [ ] Insufficient coins disables buy button
  - [ ] `npx tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Browse weapons by category
    Tool: Playwright
    Steps:
      1. Navigate to shop > Weapons tab
      2. Verify "All" shows 50 weapons
      3. Click "Ballistic" → verify 20 weapons shown
      4. Click "Fire" → verify 10 weapons shown
      5. Click "Laser" → verify 10 weapons shown
      6. Click "Explosive" → verify 10 weapons shown
    Expected Result: Category filtering works with correct counts
    Evidence: .sisyphus/evidence/task-14-categories.png

  Scenario: Purchase a weapon
    Tool: Playwright
    Steps:
      1. Navigate to shop > Weapons tab
      2. Note current coin balance
      3. Find cheapest weapon (Pistol, ~50 coins)
      4. Click Buy button
      5. Verify coin balance decreased by weapon price
      6. Verify weapon shows "Equipped" badge
      7. Verify Buy button replaced with Equip state
    Expected Result: Full purchase-equip cycle works
    Evidence: .sisyphus/evidence/task-14-purchase.png

  Scenario: Insufficient coins
    Tool: Playwright
    Steps:
      1. Navigate to shop with 0 coins
      2. Find an expensive weapon
      3. Verify Buy button is disabled/grayed out
    Expected Result: Cannot purchase without sufficient coins
    Evidence: .sisyphus/evidence/task-14-insufficient.png
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `feat(weapons): add WeaponSelector component with purchase and equip UI`
  - Files: `src/components/WeaponSelector.tsx`, `src/components/WeaponSelector.css`

- [ ] 15. Projectile Physics Tests

  **What to do**:
  - Create `src/utils/__tests__/projectilePhysics.test.ts`
  - Test cases:
    - `createProjectile`: correct spawn position (world-space), correct damage from weapon, correct velocity from weapon speed
    - `updateProjectiles`: projectiles move by vx each frame, life decrements, expired projectiles filtered out
    - `checkProjectileQuantCollision`: AABB detection (overlapping → true, non-overlapping → false), dead quants skipped
    - `checkAllProjectileCollisions`: returns correct hits, each projectile hits at most one quant, MAX_PROJECTILES cap respected
    - Edge cases: empty arrays, projectile exactly at quant boundary, zero damage

  **Must NOT do**:
  - Do not test rendering (that's visual, tested via Playwright)
  - Do not test Game.tsx integration (that's Task 20)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12, 13, 14, 16)
  - **Blocks**: None
  - **Blocked By**: Task 8

  **References**:
  - `src/utils/__tests__/gamePhysics.test.ts` — **Follow this test pattern for physics tests**.
  - `src/utils/projectilePhysics.ts` (Task 8) — Module under test.

  **Acceptance Criteria**:
  - [ ] All tests pass: `npx vitest run src/utils/__tests__/projectilePhysics.test.ts`
  - [ ] Tests cover: creation, movement, expiry, collision, edge cases

  **QA Scenarios**:
  ```
  Scenario: All projectile physics tests pass
    Tool: Bash
    Steps:
      1. Run: npx vitest run src/utils/__tests__/projectilePhysics.test.ts --reporter=verbose
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-15-tests.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `test(weapons): add projectile physics unit tests`
  - Files: `src/utils/__tests__/projectilePhysics.test.ts`

- [ ] 16. Quant HP Physics Tests

  **What to do**:
  - Create `src/utils/__tests__/quantHp.test.ts` (or add to existing gamePhysics test file)
  - Test cases:
    - `applyDamageToQuant`: reduces HP, sets flashTimer, sets isDead when hp <= 0
    - `updateQuantFlash`: decrements flashTimer, stops at 0
    - HP initialization: factory functions create quants with correct HP based on type
    - Level scaling: HP multiplied by level multiplier
    - Overkill: damage > remaining HP doesn't crash (HP goes negative, isDead = true)
    - Backwards compat: quant with flashTimer=0 renders normally (no flash)

  **Must NOT do**:
  - Do not test stomp behavior (that's unchanged existing behavior)
  - Do not test rendering

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12, 13, 14, 15)
  - **Blocks**: None
  - **Blocked By**: Task 9

  **References**:
  - `src/utils/__tests__/gamePhysics.test.ts` — Existing physics tests. Follow same patterns.
  - `src/utils/gamePhysics.ts` (Task 9) — applyDamageToQuant, updateQuantFlash functions.
  - `src/constants/gameConfig.ts` (Task 5) — QUANT_HP_CONFIG for expected values.

  **Acceptance Criteria**:
  - [ ] All tests pass: `npx vitest run src/utils/__tests__/quantHp.test.ts`
  - [ ] Tests cover: damage, flash, HP init, level scaling, overkill

  **QA Scenarios**:
  ```
  Scenario: All quant HP tests pass
    Tool: Bash
    Steps:
      1. Run: npx vitest run src/utils/__tests__/quantHp.test.ts --reporter=verbose
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-16-tests.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `test(weapons): add quant HP system unit tests`
  - Files: `src/utils/__tests__/quantHp.test.ts`

- [ ] 17. Game.tsx — Projectile Refs, Auto-Fire Timer, Collision Loop Integration

  **What to do**:
  - This is the most complex task. Modify `src/components/Game.tsx` to integrate the weapons system into the game loop:
  - **New imports**: Import `Projectile` from `types/game`, import `createProjectile`, `updateProjectiles`, `checkAllProjectileCollisions`, `MAX_PROJECTILES` from `utils/projectilePhysics`, import `drawProjectiles` from `utils/projectileRenderer`, import `drawWeaponHUD` from `utils/gameRenderer`, import `applyDamageToQuant`, `createQuantDeathParticles`, `createDroppedCoins` (if not already imported), import `getSelectedWeapon` from `utils/weaponManager`, import `Weapon` from `types/weapons`
  - **New refs**:
    - `projectilesRef = useRef<Projectile[]>([])` — active projectiles array
    - `fireCooldownRef = useRef<number>(0)` — frames until next shot
    - `weaponRef = useRef<Weapon | null>(null)` — cached weapon (loaded once on mount)
    - `projectileIdRef = useRef<number>(0)` — incrementing ID counter for projectiles
  - **Weapon initialization**: Add a `useEffect` that calls `getSelectedWeapon()` and stores result in `weaponRef.current` (once, on mount)
  - **Auto-fire logic** (inside game loop, AFTER player physics update, BEFORE collision checks):
    ```
    if (weaponRef.current && !playerRef.current.isDead) {
      fireCooldownRef.current--;
      if (fireCooldownRef.current <= 0 && projectilesRef.current.length < MAX_PROJECTILES) {
        projectileIdRef.current++;
        projectilesRef.current.push(
          createProjectile(playerRef.current, weaponRef.current, cameraXRef.current, projectileIdRef.current)
        );
        fireCooldownRef.current = weaponRef.current.cooldown;
      }
    }
    ```
  - **Projectile update** (inside game loop, AFTER auto-fire):
    ```
    projectilesRef.current = updateProjectiles(projectilesRef.current);
    ```
  - **Projectile-quant collision** (inside game loop, AFTER projectile update):
    ```
    const projectileHits = checkAllProjectileCollisions(
      projectilesRef.current, quantsRef.current, cameraXRef.current
    );
    for (const hit of projectileHits) {
      // Remove the consumed projectile
      projectilesRef.current = projectilesRef.current.filter(p => p.id !== hit.projectileId);
      // Find the quant and apply damage
      const quant = quantsRef.current.find(q => q.id === hit.quantId);
      if (quant && !quant.isDead) {
        applyDamageToQuant(quant, hit.damage);
        if (quant.isDead) {
          // Quant died from weapon damage — spawn death particles + dropped coins
          particlesRef.current = [...particlesRef.current, ...createQuantDeathParticles(quant, cameraXRef.current)];
          droppedCoinsRef.current = [...droppedCoinsRef.current, ...createDroppedCoins(quant, cameraXRef.current)];
          soundManager.playSound('coin');
        }
      }
    }
    ```
  - **Projectile rendering** (inside render section, AFTER `drawQuants` and BEFORE `drawDroppedCoins`):
    ```
    drawProjectiles(ctx, projectilesRef.current, cameraXRef.current, timeRef.current);
    ```
  - **Weapon HUD rendering** (inside render section, AFTER all other UI draws):
    ```
    drawWeaponHUD(ctx, weaponRef.current, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
    ```
  - **Cleanup on death/restart** (inside `resetGame` function):
    ```
    projectilesRef.current = [];
    fireCooldownRef.current = 0;
    ```
  - **Cleanup on win** (where `setGameState('won')` is called):
    ```
    projectilesRef.current = [];
    ```
  - **IMPORTANT**: The existing stomp logic (lines 281-316) must remain UNCHANGED. Stomp still sets `quant.isDead = true` directly, bypassing HP. The only addition is the new projectile collision block placed AFTER the existing quant collision block.

  **Must NOT do**:
  - Do not change existing stomp behavior — stomp = instant kill, no HP check
  - Do not add input handlers for firing — auto-fire only via timer
  - Do not add weapon switching during gameplay
  - Do not add projectile-obstacle collision
  - Do not modify the existing quant collision handling block (lines 274-316)
  - Do not add sound effects per weapon type — reuse existing coin sound for kills

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
    - Reason: Most complex integration task — modifying a 560-line game loop with multiple insertion points. Must be precise to avoid breaking existing mechanics.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sequential dependencies within wave)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 5, 6, 8, 9, 11, 12

  **References**:

  **Pattern References** (existing code to follow):
  - `src/components/Game.tsx:44-80` — All useRef declarations. Add new refs (projectilesRef, fireCooldownRef, weaponRef, projectileIdRef) in the same section alongside existing refs.
  - `src/components/Game.tsx:86-89` — Quant initialization useEffect. Add similar useEffect for weapon initialization: `weaponRef.current = getSelectedWeapon()`.
  - `src/components/Game.tsx:128-151` — `resetGame` function. Add projectile cleanup (clear array, reset cooldown) alongside existing coin/quant reset.
  - `src/components/Game.tsx:174-396` — The game loop. This is where auto-fire, projectile update, and projectile collision go. Insert auto-fire AFTER line 208 (updateAllQuants). Insert projectile collision AFTER the existing quant collision block (after line 316).
  - `src/components/Game.tsx:275-316` — Existing quant collision block. This MUST NOT be modified. The new projectile collision block goes AFTER this entire block.
  - `src/components/Game.tsx:382-395` — Win condition. Add `projectilesRef.current = []` here.
  - `src/components/Game.tsx:414` — `drawQuants` call. Insert `drawProjectiles` AFTER this line and BEFORE `drawDroppedCoins` (line 417).
  - `src/components/Game.tsx:428-430` — UI drawing calls. Insert `drawWeaponHUD` AFTER these lines.

  **API/Type References** (contracts to implement against):
  - `src/utils/projectilePhysics.ts` (Task 8) — `createProjectile(player, weapon, cameraX, id)`, `updateProjectiles(projectiles)`, `checkAllProjectileCollisions(projectiles, quants, cameraX)`, `MAX_PROJECTILES`
  - `src/utils/projectileRenderer.ts` (Task 11) — `drawProjectiles(ctx, projectiles, cameraX, time)`
  - `src/utils/gameRenderer.ts` (Task 12) — `drawWeaponHUD(ctx, weapon, canvasWidth, canvasHeight)`
  - `src/utils/gamePhysics.ts` (Task 9) — `applyDamageToQuant(quant, damage)`
  - `src/utils/weaponManager.ts` (Task 6) — `getSelectedWeapon(): Weapon | null`

  **External References**:
  - None — all APIs are internal

  **Acceptance Criteria**:
  - [ ] Projectile refs added (projectilesRef, fireCooldownRef, weaponRef, projectileIdRef)
  - [ ] Weapon loaded on mount via getSelectedWeapon()
  - [ ] Auto-fire spawns projectiles when weapon equipped and player alive
  - [ ] Projectiles update each frame (move + expire)
  - [ ] Projectile-quant collisions apply damage, kill quants at HP=0
  - [ ] Dead quants from weapon fire produce death particles + dropped coins
  - [ ] Projectiles rendered AFTER quants, BEFORE droppedCoins
  - [ ] Weapon HUD rendered AFTER UI elements
  - [ ] Projectiles cleared on death, restart, and win
  - [ ] No weapon → no projectiles, no auto-fire, no HUD (game identical to before)
  - [ ] Stomp still instant-kills (existing block unchanged)
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm run test:run` passes (existing tests unbroken)

  **QA Scenarios**:
  ```
  Scenario: Auto-fire produces projectiles with weapon equipped
    Tool: Playwright
    Preconditions: User has purchased and equipped a weapon (e.g., Pistol)
    Steps:
      1. Navigate to localhost:5173
      2. Start level 1
      3. Wait 2 seconds for auto-fire to produce projectiles
      4. Take screenshot
    Expected Result: Projectiles visible on screen traveling to the right
    Failure Indicators: No projectiles visible, game crash, FPS drops
    Evidence: .sisyphus/evidence/task-17-autofire.png

  Scenario: No weapon = no combat
    Tool: Playwright
    Preconditions: User has NOT purchased any weapon (fresh state)
    Steps:
      1. Clear localStorage
      2. Navigate to localhost:5173
      3. Start level 1
      4. Wait 3 seconds
      5. Take screenshot
    Expected Result: No projectiles visible, game plays identically to original
    Failure Indicators: Projectiles appear, HUD weapon icon visible, errors in console
    Evidence: .sisyphus/evidence/task-17-no-weapon.png

  Scenario: Projectile kills quant
    Tool: Playwright
    Preconditions: Weapon equipped, level with quants
    Steps:
      1. Start level 1 (has quants)
      2. Wait for projectiles to reach a quant
      3. Observe quant flashes on hit (if not one-shot kill)
      4. Observe quant death particles when killed
      5. Take screenshot during/after kill
    Expected Result: Quant takes damage, eventually dies, drops coins, death particles visible
    Failure Indicators: Quant doesn't take damage, no flash, no death, crash
    Evidence: .sisyphus/evidence/task-17-quant-kill.png

  Scenario: Stomp still instant-kills
    Tool: Playwright
    Preconditions: Weapon equipped, level with quants
    Steps:
      1. Start a level
      2. Jump on top of a quant (stomp it)
      3. Observe instant death of quant
    Expected Result: Quant dies immediately on stomp regardless of HP
    Failure Indicators: Quant survives stomp, takes only weapon-level damage from stomp
    Evidence: .sisyphus/evidence/task-17-stomp.png

  Scenario: Projectiles clear on death
    Tool: Playwright
    Steps:
      1. Start level, let auto-fire create projectiles
      2. Die (hit a spike)
      3. Retry
      4. Verify no leftover projectiles from previous run
    Expected Result: Clean slate after retry — no stale projectiles
    Evidence: .sisyphus/evidence/task-17-clear-on-death.png
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `feat(weapons): integrate auto-fire combat into game loop`
  - Files: `src/components/Game.tsx`

- [ ] 18. App.tsx + Menu.tsx — Routing, Weapon Props, Sync

  **What to do**:
  - Modify `src/App.tsx`:
    - Change `Screen` type from `'menu' | 'game' | 'skins'` to `'menu' | 'game' | 'shop'`
    - Rename `handleOpenSkins` to `handleOpenShop` and change `setScreen('skins')` to `setScreen('shop')`
    - Replace the `screen === 'skins'` rendering block: render `<Shop onBack={handleBackToMenu} />` instead of `<SkinSelector onBack={handleBackToMenu} />`
    - Update imports: remove `SkinSelector` import, add `Shop` import from `./components/Shop`
    - Add import for `syncWeaponsFromCloud` from `./utils/weaponManager`
    - Call `syncWeaponsFromCloud()` inside the initialization `useEffect` (alongside existing `initializeAuth()` and `initializeFirestoreSync()`)
  - Modify `src/components/Menu.tsx`:
    - Rename `onOpenSkins` prop to `onOpenShop` in `MenuProps` interface
    - Update the button/handler that opens the shop to use `onOpenShop` instead of `onOpenSkins`
    - The button text can remain as "🛍️ Shop" or update from "🎨 Skins" to "🛍️ Shop"
    - Add call to `syncWeaponsFromCloud()` in the same data sync `useEffect` where skins are synced (around line 50-58)
    - Import `syncWeaponsFromCloud` from `../utils/weaponManager`
  - These are straightforward prop/route renames — the actual shop logic is in Shop.tsx (Task 13)

  **Must NOT do**:
  - Do not add any new screens or modals
  - Do not modify game logic or Game.tsx props
  - Do not change auth flow or Firestore initialization
  - Do not add weapon state to App.tsx — weapon management is all in weaponManager

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
    - Reason: Simple prop renames and route changes. ~20 lines across 2 files.

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 19, after Task 17 if needed for integration)
  - **Parallel Group**: Wave 4 (with Tasks 17, 19, 20)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 6, 7, 13, 14

  **References**:

  **Pattern References** (existing code to follow):
  - `src/App.tsx:12` — `Screen` type union. Change `'skins'` to `'shop'`.
  - `src/App.tsx:38-40` — `handleOpenSkins` function. Rename to `handleOpenShop`, change to `setScreen('shop')`.
  - `src/App.tsx:44-53` — Screen rendering. Change `screen === 'skins'` to `screen === 'shop'`, render `<Shop onBack={handleBackToMenu} />`.
  - `src/App.tsx:20-26` — Initialization useEffect. Add `syncWeaponsFromCloud()` call here.
  - `src/components/Menu.tsx:26-28` — `MenuProps` interface. Rename `onOpenSkins` to `onOpenShop`.
  - `src/components/Menu.tsx:31` — Props destructuring. Update `onOpenSkins` → `onOpenShop`.
  - `src/components/Menu.tsx:50-58` — Data sync useEffect. Add weapon sync call.
  - `src/components/Menu.tsx` — Find the button that calls `onOpenSkins` (search for "Skin" or "onOpenSkins") and rename to `onOpenShop`.

  **API/Type References**:
  - `src/components/Shop.tsx` (Task 13) — `<Shop onBack={() => void />` — the component to render.
  - `src/utils/weaponManager.ts` (Task 6) — `syncWeaponsFromCloud()` function.

  **Acceptance Criteria**:
  - [ ] App.tsx renders Shop component instead of SkinSelector for shop screen
  - [ ] Screen type includes 'shop' instead of 'skins'
  - [ ] Menu.tsx uses onOpenShop prop
  - [ ] Shop button in menu opens the tabbed shop
  - [ ] Weapon data synced on initialization
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm run test:run` passes

  **QA Scenarios**:
  ```
  Scenario: Menu shop button opens tabbed shop
    Tool: Playwright
    Steps:
      1. Navigate to localhost:5173
      2. Find and click the Shop button in the menu
      3. Verify Shop opens with Skins and Weapons tabs visible
      4. Click Weapons tab → verify weapon grid appears
      5. Click Skins tab → verify skins grid appears
      6. Click Back → verify returns to menu
    Expected Result: Complete navigation flow works: Menu → Shop (tabs) → Back to Menu
    Failure Indicators: Shop doesn't open, tabs missing, back button broken, crash
    Evidence: .sisyphus/evidence/task-18-navigation.png

  Scenario: Skins still accessible via shop tab
    Tool: Playwright
    Steps:
      1. Navigate to Shop
      2. Ensure Skins tab is active by default
      3. Verify skins grid with categories visible
      4. Purchase a skin (if coins available)
      5. Verify purchase works identically to before
    Expected Result: Skins tab = exact same experience as old SkinSelector route
    Failure Indicators: Skins missing, purchase broken, wrong layout
    Evidence: .sisyphus/evidence/task-18-skins-tab.png
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `feat(weapons): update routing to tabbed shop and add weapon sync`
  - Files: `src/App.tsx`, `src/components/Menu.tsx`

- [ ] 19. Shop + WeaponSelector Component Tests

  **What to do**:
  - Create `src/components/__tests__/Shop.test.tsx`:
    - Mock Firebase, weaponManager, skinManager, walletManager before imports
    - Test cases:
      - Renders Shop container with tab bar
      - Skins tab is active by default
      - Clicking Weapons tab switches content
      - Clicking Skins tab switches back
      - Back button calls onBack
      - Coin display shows current balance
  - Create `src/components/__tests__/WeaponSelector.test.tsx`:
    - Mock Firebase, weaponManager, walletManager before imports
    - Test cases:
      - Renders weapon grid
      - "All" category shows 50 weapons
      - Clicking "Ballistic" filter shows 20 weapons
      - Clicking "Fire" filter shows 10 weapons
      - Clicking "Laser" filter shows 10 weapons
      - Clicking "Explosive" filter shows 10 weapons
      - Locked weapon shows price and buy button
      - Owned weapon shows equip/equipped state
      - Buying a weapon calls spendCoins + unlockWeapon + setSelectedWeapon
      - Insufficient coins disables buy button
  - Follow the exact testing pattern from `SkinSelector.test.tsx` — mock setup, beforeEach cleanup, render + screen assertions

  **Must NOT do**:
  - Do not test Game.tsx integration (that's Task 20)
  - Do not test weaponManager internals (that's Task 10)
  - Do not modify existing SkinSelector tests

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
    - Reason: Multiple test files with extensive mocking, following existing patterns precisely

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 17, 18, 20)
  - **Blocks**: None
  - **Blocked By**: Tasks 13, 14

  **References**:

  **Pattern References** (existing code to follow):
  - `src/components/__tests__/SkinSelector.test.tsx` — **Mirror this file exactly for both test files**. Shows: vi.mock before imports, mock setup for skinManager/walletManager, render + screen.getByText assertions, fireEvent.click for interactions, beforeEach cleanup pattern.
  - `src/components/__tests__/Menu.test.tsx` — Shows component test patterns with more complex mock setups.
  - `src/components/__tests__/AdminPanel.test.tsx` — Shows mocking patterns for components with external dependencies.

  **API/Type References**:
  - `src/components/Shop.tsx` (Task 13) — Component under test. Props: `{ onBack: () => void }`.
  - `src/components/WeaponSelector.tsx` (Task 14) — Component under test. Props likely: `{ coins: number, onCoinsChange: () => void }` or similar (follow what Task 14 defines).
  - `src/utils/weaponManager.ts` (Task 6) — Functions to mock: isWeaponUnlocked, getSelectedWeaponId, getOwnedWeaponIds, unlockWeapon, setSelectedWeapon, getWeaponPrice.
  - `src/types/weapons.ts` (Tasks 1, 4) — WEAPONS array, WEAPON_CATEGORIES for assertion counts.

  **Acceptance Criteria**:
  - [ ] `src/components/__tests__/Shop.test.tsx` exists with all listed test cases
  - [ ] `src/components/__tests__/WeaponSelector.test.tsx` exists with all listed test cases
  - [ ] `npx vitest run src/components/__tests__/Shop.test.tsx` → all pass
  - [ ] `npx vitest run src/components/__tests__/WeaponSelector.test.tsx` → all pass
  - [ ] Mock pattern matches SkinSelector.test.tsx (Firebase mocked before import)

  **QA Scenarios**:
  ```
  Scenario: All Shop component tests pass
    Tool: Bash
    Steps:
      1. Run: npx vitest run src/components/__tests__/Shop.test.tsx --reporter=verbose
    Expected Result: All tests pass (0 failures)
    Evidence: .sisyphus/evidence/task-19-shop-tests.txt

  Scenario: All WeaponSelector component tests pass
    Tool: Bash
    Steps:
      1. Run: npx vitest run src/components/__tests__/WeaponSelector.test.tsx --reporter=verbose
    Expected Result: All tests pass (0 failures)
    Evidence: .sisyphus/evidence/task-19-weapon-selector-tests.txt
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `test(weapons): add Shop and WeaponSelector component tests`
  - Files: `src/components/__tests__/Shop.test.tsx`, `src/components/__tests__/WeaponSelector.test.tsx`

- [ ] 20. Full Integration Verification — Build, Lint, All Tests

  **What to do**:
  - This is a verification task, not a coding task. Run the full project build pipeline and fix any issues:
  - **Step 1**: Run `npm run lint` — fix any ESLint errors across all new/modified files
  - **Step 2**: Run `npm run test:run` — ensure ALL tests pass (old + new). Fix any failures.
  - **Step 3**: Run `npm run build` — ensure production build succeeds with zero errors
  - **Step 4**: Run `npx tsc --noEmit` — verify strict TypeScript compilation
  - **Step 5**: Start dev server (`npm run dev`) and do a smoke test:
    - Menu loads → Shop opens with tabs → Buy a weapon → Start level → Auto-fire works → Quants take damage → Game win/death works → Back to menu
  - **Step 6**: Fix any issues found in Steps 1-5. If fixes require changes to earlier tasks' files, make them directly.
  - **Step 7**: Update Menu tests if `onOpenSkins` → `onOpenShop` rename broke them (it likely will — update the prop name in `Menu.test.tsx`)

  **Must NOT do**:
  - Do not add new features
  - Do not refactor existing code beyond what's needed to fix errors
  - Do not modify game balance (weapon stats)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`playwright`]
    - Reason: Needs to run full pipeline, identify root causes of failures, and fix across multiple files. Playwright for smoke test.

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on all prior tasks)
  - **Parallel Group**: Sequential — after Tasks 17, 18, 19
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Tasks 17, 18, 19 (all Wave 4 tasks)

  **References**:
  - All files created/modified in Tasks 1-19
  - `src/components/__tests__/Menu.test.tsx` — Likely needs update: `onOpenSkins` → `onOpenShop` in mock props
  - `package.json` — `scripts` section for lint, test, build commands
  - `tsconfig.json` — TypeScript config for strict mode validation
  - `.eslintrc*` or `eslint.config.*` — ESLint configuration

  **Acceptance Criteria**:
  - [ ] `npm run lint` → 0 errors (warnings OK)
  - [ ] `npm run test:run` → ALL tests pass (0 failures)
  - [ ] `npm run build` → successful build
  - [ ] `npx tsc --noEmit` → 0 errors
  - [ ] Smoke test via Playwright: menu → shop → buy weapon → play level → auto-fire → kill quant → complete or die → back to menu

  **QA Scenarios**:
  ```
  Scenario: Full build pipeline passes
    Tool: Bash
    Steps:
      1. Run: npm run lint
      2. Run: npm run test:run
      3. Run: npm run build
    Expected Result: All three commands succeed with zero errors
    Failure Indicators: TypeScript errors, test failures, ESLint errors, build errors
    Evidence: .sisyphus/evidence/task-20-build-pipeline.txt

  Scenario: End-to-end smoke test
    Tool: Playwright
    Preconditions: Dev server running (npm run dev)
    Steps:
      1. Navigate to localhost:5173
      2. Verify menu loads with Shop button
      3. Click Shop → verify tabs (Skins, Weapons)
      4. Click Weapons tab → verify 50 weapons visible (All category)
      5. Purchase cheapest weapon (Pistol, 50 coins) if coins available
      6. Navigate back to menu
      7. Start Level 1
      8. Wait 3-4 seconds for auto-fire to engage quants
      9. Observe projectiles on screen
      10. Observe quant damage flash on hit
      11. Observe quant death (particles + coin drop) when HP depleted
      12. Let player die (hit spike) → verify death screen, retry works
      13. Screenshot final state
    Expected Result: Full gameplay loop with weapons system works end-to-end
    Failure Indicators: Any crash, missing visuals, broken transitions, stuck states
    Evidence: .sisyphus/evidence/task-20-e2e-smoke.png

  Scenario: No-weapon backwards compatibility
    Tool: Playwright
    Steps:
      1. Clear all localStorage
      2. Navigate to localhost:5173
      3. Start Level 1 immediately (no weapon purchase)
      4. Play for 5 seconds
      5. Verify: no projectiles, no weapon HUD, no errors
      6. Verify: stomping quants still works (instant kill)
    Expected Result: Game plays identically to pre-weapons version
    Evidence: .sisyphus/evidence/task-20-no-weapon.png
  ```

  **Commit**: YES (final commit)
  - Message: `fix(weapons): resolve integration issues and ensure full build passes`
  - Files: Any files that needed fixes
  - Pre-commit: `npm run lint && npm run test:run && npm run build`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run lint && npm run test:run && npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify all 50 weapons have unique IDs and valid stats.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Verify: shop opens with 2 tabs, skin tab unchanged, weapon tab shows 4 categories with 50 weapons. Purchase a weapon, verify coin deduction. Start a level with weapon equipped, verify auto-fire. Verify quants take damage, flash on hit, die when HP depleted. Verify stomp still instant-kills. Verify no-weapon state (no projectiles). Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance (no AoE, no ammo, no upgrades, no weapon on cube). Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Wave | Commit | Files | Pre-commit |
|------|--------|-------|-----------|
| 1 | `feat(weapons): add weapon types, interfaces, and 50 weapon definitions` | types/weapons.ts, types/game.ts, constants/gameConfig.ts | `npx vitest run src/types` |
| 2 | `feat(weapons): add weaponManager, projectile physics, and quant HP system` | utils/weaponManager.ts, utils/projectilePhysics.ts, utils/gamePhysics.ts, utils/firestoreService.ts + tests | `npx vitest run src/utils` |
| 3 | `feat(weapons): add tabbed shop UI, weapon selector, and projectile rendering` | components/Shop.tsx, components/WeaponSelector.tsx, utils/projectileRenderer.ts, utils/gameRenderer.ts + CSS + tests | `npm run test:run` |
| 4 | `feat(weapons): integrate combat into game loop with auto-fire and HUD` | components/Game.tsx, components/App.tsx, components/Menu.tsx + tests | `npm run lint && npm run test:run && npm run build` |

---

## Success Criteria

### Verification Commands
```bash
npm run lint              # Expected: 0 errors
npm run test:run          # Expected: all tests pass
npm run build             # Expected: successful build
npx vitest run src/types  # Expected: weapon type validation passes
npx vitest run src/utils/__tests__/weaponManager.test.ts  # Expected: all pass
npx vitest run src/utils/__tests__/projectilePhysics.test.ts  # Expected: all pass
```

### Final Checklist
- [ ] 50 weapons defined with unique IDs, valid categories, scaling damage/price
- [ ] Shop has Skins + Weapons tabs, both functional
- [ ] Weapon purchase deducts coins, persists ownership
- [ ] Weapon equip persists selection
- [ ] Auto-fire spawns projectiles at weapon's fire rate
- [ ] Projectiles travel right, hit first quant, disappear
- [ ] Quants have HP, take damage, flash on hit, die at HP=0
- [ ] Stomp still instant-kills regardless of HP
- [ ] No weapon equipped = zero combat behavior (identical to current game)
- [ ] Category-themed projectile visuals work
- [ ] Weapon HUD icon shows in bottom-left
- [ ] Old save data without weapon fields loads without errors
- [ ] All "Must NOT Have" items verified absent
- [ ] All tests pass, lint clean, build succeeds
