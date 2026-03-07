# Decisions — weapons-system

## [2026-03-06] Session: ses_340684f9dffeR1iL6w08ceaEpe — Atlas Initialization

### Architecture Decisions
- Weapons persistence mirrors skinManager pattern: store owned weapon IDs (numbers) + equipped weapon ID in localStorage + Firestore
- `isDead` on Quant = derived property (computed from `hp <= 0`), NOT a stored boolean field — backward compat requirement
- Projectile type: new interface in `src/types/game.ts` (not a separate file)
- Shop routing: 'skins' route renamed to 'shop' in App.tsx; new Shop.tsx wraps both SkinSelector.tsx and new WeaponSelector.tsx in tabs
- WeaponSelector.tsx follows exact same structure as SkinSelector.tsx (category filter tabs, grid of cards, purchase/equip logic)
- projectilePhysics.ts: pure functions (createProjectile, updateProjectiles, checkProjectileQuantCollisions)
- projectileRenderer.ts: pure canvas functions, called from Game.tsx render order between quants and droppedCoins

### Scope Boundaries
- NO AoE damage — single target only for all weapon types including Explosive
- NO HP bar — flash visual feedback only
- NO ammo system — unlimited with cooldown
- NO multiple equipped weapons — one weapon equipped at a time
- NO weapon usage during death/completion state
