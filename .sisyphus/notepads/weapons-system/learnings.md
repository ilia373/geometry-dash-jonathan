# Learnings — weapons-system

## [2026-03-06] Session: ses_340684f9dffeR1iL6w08ceaEpe — Atlas Initialization

### Codebase Patterns (from research phase)
- Canvas render order: bg → ground → obstacles → quants → droppedCoins → particles → player → UI
  - **Projectiles go between quants and droppedCoins**
- SkinSelector is a full-screen route (not modal), App.tsx routes: 'menu' | 'game' | 'skins'
  - **Must change 'skins' to 'shop' and render new Shop component**
- App.tsx is at `src/App.tsx` (NOT `src/components/App.tsx`)
- Game.tsx is ~561 lines with single large useEffect containing the rAF loop
- Input: Space/ArrowUp/W/click/tap = jump. Auto-fire needs NO new input handler — just a timer in the game loop
- skinManager stores owned skins as string names in Firestore (not IDs) — weaponManager should mirror id↔name pattern
- Collision detection is AABB-based with world-to-screen coordinate conversion
- Stomp: player.vy > 0 (falling) + position above quant center = instant kill

### Type Patterns
- Quants currently use `isDead: boolean` flag — must remain as DERIVED from HP (hp <= 0)
- `GameProps`: `{ levelId: number, onBack: () => void, cheats: CheatState }`
- `MenuProps`: `{ onStartGame: (levelId, cheats) => void, onOpenSkins: () => void }`
  - **Must rename onOpenSkins → onOpenShop**

### Testing Patterns
- Mock Firebase in tests BEFORE importing components (hoisting requirement)
- `vi.mock('../../config/firebase', () => ({ auth: {}, db: {} }))` pattern
- Pre-existing LSP errors in FortuneWheel.test.tsx and Menu.test.tsx are UNRELATED — do not fix them
- Coverage thresholds: Branches 85%, Functions 70%, Lines 85%, Statements 85%
- Excluded from coverage: Game.tsx, gameRenderer.ts, soundManager.ts, firebase.ts, App.tsx, main.tsx

### Design Decisions (User-Confirmed)
- Auto-fire (continuous), no manual trigger, per-weapon cooldown
- Unlimited ammo with cooldown
- HP system where damage determines kills; HP scales with level difficulty
- Must purchase first weapon (no free default)
- Projectiles fire forward (right) only, all straight horizontal
- Hit first quant and disappear; pass through obstacles/terrain
- Explosive = single-target, big visual explosion (NO AoE)
- Laser = traveling beam projectile (NOT hit-scan)
- Weapon switching: Shop only — fixed during gameplay
- Damage feedback: Flash only (white/red, ~6 frames) — NO HP bar
- Weapon HUD: Small icon in bottom-left corner of screen
- Coin drops: Same regardless of kill method
- Max projectiles: 50 cap for performance
- Cleanup: Clear projectiles on death, restart, completion
- Old save data without weapon fields loads without errors (backward compat)

### Weapon Stats Ranges
- Ballistic (20, IDs 1-20): damage 5→50, cooldown 30→5, speed 8→20, price 50→5000
- Fire (10, IDs 21-30): damage 8→60, cooldown 25→8, speed 6→15, price 100→6000
- Laser (10, IDs 31-40): damage 10→70, cooldown 20→4, speed 12→25, price 150→7000
- Explosive (10, IDs 41-50): damage 15→100, cooldown 60→15, speed 5→12, price 200→10000
