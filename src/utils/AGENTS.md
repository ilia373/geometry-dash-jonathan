# Utils — AGENTS.md

9 utility modules. Three categories: game engine, managers, services.

## Module Map

| Module | Category | Role | Singleton? |
|--------|----------|------|------------|
| `gamePhysics.ts` | Engine | Collision detection, physics updates, player creation | No — pure functions |
| `gameRenderer.ts` | Engine | Canvas draw functions (background, player, obstacles, UI) | No — pure functions |
| `walletManager.ts` | Manager | Coin balance (get/add/spend/sync) | Module-level cache |
| `progressManager.ts` | Manager | Level completion tracking (complete/check/sync) | Module-level cache |
| `skinManager.ts` | Manager | Skin equip/unlock/purchase (+ Firestore sync) | Module-level cache |
| `authService.ts` | Service | Firebase Auth wrapper. Sign in/up/out, admin check, auth listener. | Module-level singleton (`currentUser`) |
| `firestoreService.ts` | Service | Raw Firestore CRUD for user documents | No — stateless helpers |
| `fortuneWheelManager.ts` | Service | Spin cooldown, reward calculation, localStorage timestamps | Module-level state |
| `soundManager.ts` | Service | Audio playback. `SoundManager` class singleton via `getSoundManager()` | Class singleton |

## Manager Cache Pattern (wallet/progress/skin)

All three managers use an **identical** pattern:

```
Module-level variable (cache) → null initially
├── get*(): if cache null → read localStorage → set cache → return
├── set*(): update cache + localStorage + Firestore (if logged in)
├── sync*(): called on auth change → merge localStorage ↔ Firestore
└── reset*(): clear cache (used on sign-out)
```

Key rules:
- localStorage is **always** written (guest + logged-in)
- Firestore is **only** written for authenticated users
- On login: merge localStorage into Firestore (localStorage wins on conflict)
- On logout: `reset*()` clears module cache; localStorage persists
- Cache is lazy-initialized on first read

## Game Engine (gamePhysics + gameRenderer)

**gamePhysics.ts** — Pure functions, no side effects:
- `createPlayer()` → default Player object
- `updatePlayerPhysics(player, config)` → new Player with gravity/velocity applied
- `checkObstacleCollision(player, obstacle, cameraX)` → `CollisionResult | null`
- `checkAllCollisions(player, obstacles, cameraX)` → `CollisionResult[]`
- `CollisionResult`: `{ type: 'death' | 'coin' | 'platform', obstacle }` — detection only, no response

**gameRenderer.ts** — Canvas 2D draw calls. ~700 lines. Excluded from coverage.
- `drawBackground()`, `drawGround()`, `drawObstacles()`, `drawPlayer()`, `drawUI()`
- Render order matters: background → ground → obstacles → coins → particles → player → UI
- All functions take `(ctx, ...)` — no stored canvas reference
- Uses `GAME_CONFIG` for dimensions, colors, sizes

## authService.ts

Module-level mutable state: `currentUser: AuthUser | null`, `isAdminUser: boolean`.
- `onAuthChange(callback)` — subscribes to Firebase `onAuthStateChanged`
- `getCurrentUser()` → cached `AuthUser | null`
- `isAdmin()` → cached boolean (reads `idTokenResult.claims.admin`)
- `signInWithEmail/Google/signUp/signOut` — wrappers around Firebase Auth
- `getErrorMessage(code)` — maps Firebase error codes to user-friendly strings

## Adding a New Utility

1. `src/utils/newUtil.ts` — named exports, explicit return types
2. `src/utils/__tests__/newUtil.test.ts` — mock Firebase before imports
3. If it touches Firebase: follow manager cache pattern (localStorage + optional Firestore)
4. Add types to `src/types/` if introducing new data shapes

## Testing Utils

- Mock `../../config/firebase` BEFORE importing the module under test
- Manager tests: mock `firestoreService` + `authService` to control auth state
- Physics tests: pure functions — no mocking needed, just assert inputs/outputs
- `beforeEach`: clear mocks + reset module-level caches (call `reset*()` or re-import)
- localStorage: mocked globally in `src/test/setup.ts`
