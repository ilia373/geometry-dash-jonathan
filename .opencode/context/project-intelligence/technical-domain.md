<!-- Context: project-intelligence/technical | Priority: critical | Version: 2.0 | Updated: 2026-02-07 -->

# Technical Domain - Geometry Dash Clone

**Purpose**: Tech stack, architecture, and development patterns for this React + TypeScript + Firebase game.
**Last Updated**: 2026-02-07

## Quick Reference
**Update Triggers**: Tech stack changes | New patterns | Architecture decisions
**Audience**: Developers, AI agents

## Primary Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | React | 19.2 | Modern hooks, concurrent features |
| Language | TypeScript | 5.9 | Strict mode, type safety |
| Build | Vite | 7.2 | Fast HMR, ESM-native |
| Backend | Firebase | 11 | Auth, Firestore, Hosting |
| Testing | Vitest | 3.2 | Fast, Vite-native, React Testing Library |
| Rendering | HTML5 Canvas | N/A | 60fps game graphics |

## Code Patterns

### Component Pattern
```typescript
interface MenuProps {
  onStartGame: (levelId: number, cheats: CheatState) => void;
  onOpenSkins: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartGame, onOpenSkins }) => {
  const [coins, setCoins] = useState<number>(getTotalCoins());
};

export default Menu;
```

### Error Handling Pattern
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

### Game Loop Pattern (Canvas)
```typescript
const playerRef = useRef<Player>(createPlayer());

useEffect(() => {
  const gameLoop = () => {
    playerRef.current = updatePlayerPhysics(playerRef.current, GAME_CONFIG);
    ctx.clearRect(0, 0, width, height);
    drawPlayer(ctx, playerRef.current);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };
  gameLoopRef.current = requestAnimationFrame(gameLoop);
  return () => cancelAnimationFrame(gameLoopRef.current);
}, [gameState]);
```

### Test Pattern (Mock Before Import)
```typescript
// Mock Firebase BEFORE importing components
vi.mock('../../config/firebase', () => ({ auth: {}, db: {} }));

// Import component AFTER mocks
import Menu from '../Menu';
```

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase.tsx | `Menu.tsx`, `AdminPanel.tsx` |
| Utility files | camelCase.ts | `authService.ts`, `walletManager.ts` |
| Test files | *.test.tsx/ts | `Menu.test.tsx` |
| Components | PascalCase | `Menu`, `FortuneWheel` |
| Functions | camelCase | `signInWithEmail`, `getTotalCoins` |
| Interfaces | PascalCase | `AuthUser`, `GameConfig` |
| Constants | UPPER_SNAKE_CASE | `SUPER_ADMIN_EMAILS` |
| CSS classes | kebab-case | `menu-container`, `level-card` |

## Code Standards

- TypeScript strict mode (no implicit any, strict null checks)
- Explicit type annotations for function parameters and returns
- Interface-first for React props (define before component)
- Use refs for game loop state (avoid re-renders)
- requestAnimationFrame for smooth 60fps rendering
- Mock Firebase BEFORE importing components in tests
- Import order: React → Firebase → Components → Utils → Types → CSS

## Security Requirements

- Custom claims for admin (set server-side via Cloud Functions)
- Client-side admin check is UI-only; Firestore rules enforce security
- Firebase Auth for authentication (Google, Email/Password)
- localStorage for guests, Firestore for logged-in users

## 📂 Codebase References

**Components**: `src/components/` - Game.tsx, Menu.tsx, SkinSelector.tsx
**Utils**: `src/utils/` - authService.ts, gamePhysics.ts, gameRenderer.ts
**Types**: `src/types/` - game.ts, skins.ts, cheats.ts
**Config**: `src/constants/gameConfig.ts` - Game physics constants
**Tests**: `src/components/__tests__/`, `src/utils/__tests__/`

## Development Commands

```bash
npm run dev              # Start dev server (localhost:5173)
npm test                 # Run tests in watch mode
npm run test:coverage    # Coverage (85% threshold)
npx vitest run -t "name" # Single test by name
npm run build            # TypeScript + Vite build
```

## Related Files

- [Business Domain](business-domain.md) - Project purpose
- [Decisions Log](decisions-log.md) - Technical decisions
- [AGENTS.md](/AGENTS.md) - Full agent guidelines
