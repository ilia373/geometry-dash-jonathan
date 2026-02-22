# Components — AGENTS.md

6 React components. Each has co-located CSS and `__tests__/*.test.tsx`.

## Component Map

| Component | Role | Lines | Notes |
|-----------|------|-------|-------|
| `App.tsx` | Root. Screen router (`menu`/`game`/`skins`). Cheat state owner. | ~130 | Not tested (excluded from coverage) |
| `Game.tsx` | Canvas + rAF game loop. All gameplay here. | ~560 | Largest file. One `eslint-disable` (exhaustive-deps). Excluded from coverage. |
| `Menu.tsx` | Main menu. Level cards, coin display, auth, admin, fortune wheel. | ~380 | Composes AuthModal + AdminPanel + FortuneWheel |
| `SkinSelector.tsx` | Skin shop. Category tabs, purchase flow, equip. | ~280 | Reads walletManager + skinManager |
| `AdminPanel.tsx` | Cheat toggles + admin tools (grant coins, reset progress). | ~350 | Only renders for `isAdmin` users |
| `AuthModal.tsx` | Login/signup modal. Email + Google auth. | ~200 | Calls authService directly |
| `FortuneWheel.tsx` | Spin-to-win coin reward. Canvas wheel + animation. | ~250 | Uses fortuneWheelManager for cooldown |

## Screen Routing (App.tsx)

```
App useState('menu' | 'game' | 'skins')
├── 'menu'  → <Menu onStartGame onOpenSkins />
├── 'game'  → <Game levelId cheats onBack />
└── 'skins' → <SkinSelector onBack />
```

No React Router. No Context. Props down only.

## Composition (Menu.tsx)

Menu renders three child components inline:
- `<AuthModal>` — toggled by login button
- `<AdminPanel>` — shown only when `isAdmin && showAdminPanel`
- `<FortuneWheel>` — shown only when `showFortuneWheel`

## Game.tsx Internals

- All game state in `useRef` (playerRef, cameraXRef, obstaclesRef, particlesRef, etc.)
- Single `useEffect` containing the rAF loop: update physics → check collisions → render
- Cheats: `cheatsRef` synced from props via separate `useEffect`
- Canvas: single `<canvas>` element, 2D context
- Render layers: background → ground → obstacles → coins → particles → player → UI overlay
- Game states: `'ready' | 'playing' | 'dead' | 'complete'` (managed via `setGameState`)

## Adding a New Component

1. `src/components/NewComponent.tsx` — interface + `React.FC<Props>` + default export
2. `src/components/NewComponent.css` — co-located styles, kebab-case classes
3. `src/components/__tests__/NewComponent.test.tsx` — see testing below

## Testing Components

**Critical**: Mock Firebase BEFORE component import (vi.mock hoists automatically):

```typescript
vi.mock('../../config/firebase', () => ({ auth: {}, db: {} }));
vi.mock('../../utils/authService', () => ({ getCurrentUser: vi.fn() }));
// THEN import
import MyComponent from '../MyComponent';
```

- Use `@testing-library/react`: `render`, `screen`, `fireEvent`, `waitFor`
- Mock all util dependencies that touch Firebase/localStorage
- Admin tests: mock `getIdTokenResult` → `{ claims: { admin: true } }`
- `beforeEach(() => vi.clearAllMocks())` in every describe block

## CSS Conventions

- One CSS file per component, same name: `Menu.tsx` → `Menu.css`
- Glass-morphism pattern: `backdrop-filter: blur()` + semi-transparent backgrounds
- Responsive: media queries for mobile
- Class names: `kebab-case` (e.g., `menu-container`, `level-card`, `skin-item`)
- No CSS modules. No CSS-in-JS. Plain CSS imports.
