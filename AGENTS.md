# AGENTS.md - Geometry Dash Clone

> Guidelines for AI agents working in this React + TypeScript + Firebase game project.

## Quick Reference

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run dev:emulators    # Dev with Firebase emulators

# Testing
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage report
npx vitest run src/utils/__tests__/authService.test.ts  # Single test file
npx vitest run -t "should return false when no user"    # Single test by name

# Build & Lint
npm run build            # TypeScript check + Vite build
npm run lint             # ESLint check

# Firebase
npm run emulators        # Start Firebase emulators only
firebase deploy          # Deploy to Firebase Hosting

# CI/CD (GitHub Actions)
# ci.yml: lint → test:coverage → build (runs on push/PR to main)
# deploy.yml: manual workflow_dispatch, requires DEPLOY_USER var
```

## Project Structure

```
src/
├── components/          # React components (PascalCase.tsx)
│   └── __tests__/       # Component tests (*.test.tsx)
├── utils/               # Utility modules (camelCase.ts)
│   └── __tests__/       # Unit tests
├── types/               # TypeScript type definitions
├── constants/           # Game config, levels
├── config/              # Firebase initialization
└── test/                # Test setup (setup.ts)
functions/               # Firebase Cloud Functions (separate tsconfig)
```

## Code Style

### TypeScript
- **Strict mode enabled** - No implicit any, strict null checks
- **Explicit type annotations** for function parameters and returns
- **Interfaces for props** - Define before component

```typescript
// Good
interface MenuProps {
  onStartGame: (levelId: number, cheats: CheatState) => void;
  onOpenSkins: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartGame, onOpenSkins }) => {
  const [coins, setCoins] = useState<number>(getTotalCoins());
  // ...
};

export default Menu;
```

### Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase.tsx | `Menu.tsx`, `AdminPanel.tsx` |
| Utility files | camelCase.ts | `authService.ts`, `walletManager.ts` |
| Test files | `*.test.tsx` / `*.test.ts` | `Menu.test.tsx` |
| Components | PascalCase | `Menu`, `FortuneWheel` |
| Functions | camelCase | `signInWithEmail`, `getTotalCoins` |
| Interfaces/Types | PascalCase | `AuthUser`, `GameConfig` |
| Constants | UPPER_SNAKE_CASE | `SUPER_ADMIN_EMAILS` |
| CSS classes | kebab-case | `menu-container`, `level-card` |

### Imports Order
1. React/external libraries → 2. Firebase imports → 3. Local components → 4. Utils → 5. Types → 6. CSS

```typescript
import { useState, useEffect, useCallback } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import AuthModal from './AuthModal';
import { getCurrentUser, onAuthChange } from '../utils/authService';
import type { AuthUser } from '../utils/authService';
import './Menu.css';
```

### Error Handling
- Use try-catch with typed errors
- Provide user-friendly error messages
- Log errors to console for debugging

```typescript
try {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return convertUser(result.user);
} catch (error: unknown) {
  const firebaseError = error as { code?: string; message?: string };
  console.error('Sign in error:', firebaseError);
  throw new Error(getErrorMessage(firebaseError.code));
}
```

## Testing Guidelines

### Test Structure
- Use `describe` blocks for grouping related tests
- Use `beforeEach` for setup/cleanup
- Mock Firebase and external services BEFORE importing components (hoisting requirement)
- `src/test/setup.ts` provides global mocks for localStorage and HTMLAudioElement

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock Firebase BEFORE importing components (critical: mocks must be hoisted)
vi.mock('../../config/firebase', () => ({ auth: {}, db: {} }));
vi.mock('../../utils/authService', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Import component AFTER mocks
import Menu from '../Menu';

describe('Menu Component', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should render menu container', () => {
    render(<Menu onStartGame={vi.fn()} onOpenSkins={vi.fn()} />);
    expect(document.querySelector('.hero-title')).toBeInTheDocument();
  });
});
```

### Testing Admin Claims
Mock `getIdTokenResult()` on user objects to test admin/non-admin flows:

```typescript
const mockUser = {
  uid: 'test-id',
  email: 'admin@test.com',
  getIdTokenResult: vi.fn().mockResolvedValue({ claims: { admin: true } })
};
```

### Coverage: Branches 85%, Functions 70%, Lines 85%, Statements 85%

### Excluded from Coverage
- `src/main.tsx`, `src/App.tsx`, `src/components/Game.tsx`, `src/utils/gameRenderer.ts`
- `src/utils/soundManager.ts`, `src/config/firebase.ts`, `functions/**`

## Firebase Patterns

### Authentication
- Custom claims for admin (set server-side via Cloud Functions)
- Client-side check is UI-only; Firestore rules enforce security

```typescript
// Cloud Function sets admin claim on sign-in
export const setAdminClaim = beforeUserSignedIn(
  { secrets: [superAdminEmails] },
  async (event) => ({ customClaims: { admin: shouldBeAdmin } })
);

// Client reads claim from ID token (UI only)
const idTokenResult = await user.getIdTokenResult();
isAdminUser = idTokenResult.claims.admin === true;
```

### Data Storage: Guests use localStorage only; logged-in users use Firestore with localStorage fallback with localStorage fallback

## Game Development Patterns

### Game Loop Architecture
- Use `requestAnimationFrame` for smooth 60fps rendering
- Store game state in refs (not useState) to avoid re-renders during game loop
- Separate update logic from render logic

```typescript
// Use refs for real-time game state (no re-renders)
const playerRef = useRef<Player>(createPlayer());
const cameraXRef = useRef<number>(0);
const particlesRef = useRef<Particle[]>([]);

// Game loop pattern
useEffect(() => {
  const gameLoop = () => {
    // 1. Update physics
    playerRef.current = updatePlayerPhysics(playerRef.current, GAME_CONFIG);
    
    // 2. Check collisions
    const collisions = checkAllCollisions(playerRef.current, obstacles, cameraXRef.current);
    
    // 3. Render
    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, level, cameraXRef.current);
    drawPlayer(ctx, playerRef.current);
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };
  
  gameLoopRef.current = requestAnimationFrame(gameLoop);
  return () => cancelAnimationFrame(gameLoopRef.current);
}, [gameState]);
```

### Canvas Rendering
- Clear canvas each frame before drawing
- Draw in layers: background → ground → obstacles → particles → player → UI
- Use `timeRef` for animations (oscillating effects, frame counting)

### Physics & Collision
- Collision functions return typed results: `{ type: 'death' | 'coin' | 'platform', obstacle? }`
- Separate collision detection from collision response
- Use camera offset for world-space to screen-space conversion: `screenX = worldX - cameraX`

### Cheat System Pattern
- Pass cheats as props, sync to ref for game loop access
- Check cheats inside game loop: `if (activeCheat.ghostMode) { /* skip death */ }`

```typescript
const cheatsRef = useRef<CheatState>(cheats);
useEffect(() => { cheatsRef.current = cheats; }, [cheats]);

// In game loop
const activeCheat = cheatsRef.current;
if (activeCheat.invincible) { /* ignore damage */ }
```

## Agent Behavior

### Core Principles
- **Iterate until solved** - Keep working until the problem is completely resolved
- **Research before implementing** - Use web search for external packages/APIs to get current documentation
- **Test rigorously** - Handle edge cases, run existing tests, verify changes work
- **Small incremental changes** - Make testable changes that logically follow from investigation

### When Working on This Codebase
1. Read relevant files before editing (2000+ lines for full context)
2. Mock Firebase in tests BEFORE importing components (hoisting requirement)
3. Check `GAME_CONFIG` in `constants/gameConfig.ts` for physics constants
4. Game state changes: use `setGameState()` for React, refs for game loop values
5. Run `npm test` after changes to verify nothing broke

## Do NOT Modify
- `src/config/firebase.ts` - Firebase SDK initialization
- `firestore.rules`, `storage.rules` - Security rules (test locally first)
- `.env.local` - Contains secrets (gitignored)

## Common Tasks

### Add a new component
1. Create `src/components/NewComponent.tsx` with interface + component
2. Create `src/components/NewComponent.css` for styles
3. Create `src/components/__tests__/NewComponent.test.tsx`
4. Mock Firebase in test file before imports

### Add a new utility
1. Create `src/utils/newUtil.ts` with exported functions
2. Create `src/utils/__tests__/newUtil.test.ts`
3. Add type definitions to `src/types/` if needed

### Run specific tests
```bash
npx vitest run src/utils/__tests__/authService.test.ts
npx vitest run -t "should return false"
npx vitest run --reporter=verbose
```