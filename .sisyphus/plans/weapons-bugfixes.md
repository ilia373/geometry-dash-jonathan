# Weapons System — 3 Bug Fixes

## TL;DR

> **Quick Summary**: Fix three user-reported UI/UX bugs in the weapons system: wrong button label, stretched weapon cards, and slow equip action.
> 
> **Deliverables**:
> - Menu button says "Shop" (not "Skins")
> - Weapon cards have compact, uniform sizing
> - Equip is instant (optimistic UI)
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: YES — 3 waves (bugs can partly parallel, tests after)
> **Critical Path**: T1/T2/T3 (parallel) → T4 (tests/verify)

---

## Context

### Original Request
User tested the completed weapons system (20 tasks, all committed) and reported 3 bugs:
1. "the button to enter the shop is now not supposed to be written Skins, rather Shop"
2. "the items in the weapons shop are not looking good, they are streached"
3. "the equip takes huge amount of time"

### Current State
- Branch: `feature/intreduce-weapons`
- All 20 original tasks complete, 421/421 tests passing
- Build clean, lint clean

---

## Work Objectives

### Core Objective
Fix three UI/UX bugs reported by user after testing the weapons system.

### Concrete Deliverables
- `Menu.tsx` button text changed from "Skins" to "Shop", icon from 🎨 to 🛒
- `Menu.css` class renamed from `.skins-button` to `.shop-button`
- `WeaponSelector.css` grid/card sizing fixed — compact, non-stretched cards
- `WeaponSelector.tsx` handleEquip/handleBuy made optimistic (no await on Firestore writes)
- `Menu.test.tsx` updated for new button text

### Definition of Done
- [ ] `npm run build` passes
- [ ] `npm run lint` passes  
- [ ] `npm run test:run` passes (421+ tests, 0 failures)

### Must Have
- Button says "Shop" with 🛒 icon
- Weapon cards are compact, not stretched across the row
- Equip action feels instant (no visible delay)

### Must NOT Have (Guardrails)
- Do NOT change any game logic or weapon stats
- Do NOT touch files outside the 5 affected files (Menu.tsx, Menu.css, WeaponSelector.tsx, WeaponSelector.css, Menu.test.tsx)
- Do NOT rename the CSS class `.shop-button` in responsive media queries without also updating them
- Do NOT remove the `await` on `spendCoins()` in handleBuy — that must stay for correctness (coin deduction must succeed before unlocking)
- Do NOT fix pre-existing LSP errors in FortuneWheel.test.tsx, Menu.test.tsx setup.ts

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after (update existing tests)
- **Framework**: vitest

### QA Policy
Every task includes agent-executed QA scenarios.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (All 3 bugs — can run in parallel):
├── Task 1: Menu button label fix [quick]
├── Task 2: Weapon card CSS fix [quick]
└── Task 3: Optimistic equip fix [quick]

Wave 2 (After Wave 1 — verification):
└── Task 4: Update tests + full verification [quick]

Critical Path: T1+T2+T3 (parallel) → T4
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1   | —         | T4     |
| T2   | —         | T4     |
| T3   | —         | T4     |
| T4   | T1,T2,T3  | —      |

### Agent Dispatch Summary

- **Wave 1**: 3 tasks → all `quick`
- **Wave 2**: 1 task → `quick`

---

## TODOs

- [x] 1. Fix Menu Button Label: "Skins" → "Shop"

  **What to do**:
  - In `src/components/Menu.tsx` line 222-226, change:
    - `className="skins-button"` → `className="shop-button"`
    - `🎨` → `🛒`
    - `Skins` → `Shop`
  - In `src/components/Menu.css`, rename ALL occurrences of `.skins-button` to `.shop-button`:
    - Line 232: `.skins-button,` → `.shop-button,`
    - Line 263: `.skins-button:hover,` → `.shop-button:hover,`
    - Line 879 (responsive): `.skins-button {` → `.shop-button {`

  **Must NOT do**:
  - Do NOT change the button's gradient colors or styling — only the class name, icon, and text
  - Do NOT touch any other buttons (login, logout, admin)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:
  - `src/components/Menu.tsx:222-226` — Current button markup with className="skins-button", icon 🎨, text "Skins"
  - `src/components/Menu.css:232` — `.skins-button,` in the combined selector with login-button and logout-button
  - `src/components/Menu.css:263` — `.skins-button:hover,` in the combined hover selector
  - `src/components/Menu.css:879` — `.skins-button` in responsive media query

  **Acceptance Criteria**:
  - [ ] Button text reads "Shop" (not "Skins")
  - [ ] Button icon is 🛒 (not 🎨)
  - [ ] CSS class is `.shop-button` everywhere (no remaining `.skins-button` references)
  - [ ] `npm run build` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Menu button shows "Shop" label
    Tool: Bash (grep)
    Preconditions: Files saved
    Steps:
      1. grep -n "skins-button" src/components/Menu.tsx — should return 0 matches
      2. grep -n "skins-button" src/components/Menu.css — should return 0 matches
      3. grep -n "shop-button" src/components/Menu.tsx — should return 1 match
      4. grep -n "shop-button" src/components/Menu.css — should return 3+ matches
      5. grep -n "Shop" src/components/Menu.tsx — should find the btn-text span
    Expected Result: No remaining "skins-button" references; "Shop" text present
    Evidence: .sisyphus/evidence/task-1-button-label.txt

  Scenario: Build succeeds after rename
    Tool: Bash
    Steps:
      1. npm run build
    Expected Result: Exit code 0, no errors
    Evidence: .sisyphus/evidence/task-1-build.txt
  ```

  **Commit**: YES (group with T2, T3, T4)
  - Message: `fix(ui): fix menu button label, weapon card layout, and equip performance`
  - Files: `src/components/Menu.tsx`, `src/components/Menu.css`

---

- [x] 2. Fix Stretched Weapon Cards

  **What to do**:
  - In `src/components/WeaponSelector.css`, fix the `.weapons-grid` to prevent cards from stretching:
    - Change `grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))` → `grid-template-columns: repeat(auto-fill, minmax(130px, 150px))`
    - Add `justify-content: center` to `.weapons-grid` so cards center rather than left-align
  - Add `max-width: 150px` to `.weapon-card` as a safety constraint
  - Remove `width: 100%` from `.btn-buy, .btn-equip` — buttons should size to content or use a reasonable fixed width like `width: auto; min-width: 80px;`

  **Must NOT do**:
  - Do NOT change card colors, borders, or animation effects
  - Do NOT change the emoji size or font sizes
  - Do NOT restructure the card layout (keep flex column with centered items)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:
  - `src/components/WeaponSelector.css:73-80` — Current `.weapons-grid` with `minmax(140px, 1fr)` causing stretch
  - `src/components/WeaponSelector.css:82-92` — `.weapon-card` styles (no max-width)
  - `src/components/WeaponSelector.css:129-141` — `.btn-buy, .btn-equip` with `width: 100%` causing button stretch
  - `src/components/SkinSelector.tsx` — Reference: check how skin cards are sized for consistency pattern

  **Acceptance Criteria**:
  - [ ] `.weapons-grid` uses fixed-max grid columns (not `1fr`)
  - [ ] `.weapon-card` has `max-width` set
  - [ ] Buy/equip buttons are not full-width stretched
  - [ ] `npm run build` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Grid columns don't use 1fr
    Tool: Bash (grep)
    Preconditions: CSS file saved
    Steps:
      1. grep "1fr" src/components/WeaponSelector.css — should return 0 matches
      2. grep "max-width" src/components/WeaponSelector.css — should find weapon-card max-width
      3. grep "justify-content" src/components/WeaponSelector.css — should find center on weapons-grid
    Expected Result: No 1fr, max-width present, justify-content: center present
    Evidence: .sisyphus/evidence/task-2-css-check.txt

  Scenario: Build succeeds after CSS changes
    Tool: Bash
    Steps:
      1. npm run build
    Expected Result: Exit code 0, no errors
    Evidence: .sisyphus/evidence/task-2-build.txt
  ```

  **Commit**: YES (group with T1, T3, T4)
  - Files: `src/components/WeaponSelector.css`

---

- [x] 3. Make Equip Instant (Optimistic UI)

  **What to do**:
  - In `src/components/WeaponSelector.tsx`, change `handleEquip` from async+await to fire-and-forget:
    ```typescript
    // BEFORE (slow — awaits Firestore write):
    const handleEquip = async (weaponId: number) => {
      await setSelectedWeapon(weaponId);
      setSelectedId(weaponId);
    };

    // AFTER (instant — updates UI first, Firestore in background):
    const handleEquip = (weaponId: number) => {
      setSelectedId(weaponId);
      setSelectedWeapon(weaponId); // fire-and-forget, no await
    };
    ```
  - In the same file, optimize `handleBuy` — keep `await spendCoins()` for correctness but make `unlockWeapon` and `setSelectedWeapon` fire-and-forget:
    ```typescript
    // BEFORE:
    const handleBuy = async (weapon: Weapon) => {
      if (coins < weapon.price) return;
      const success = await spendCoins(weapon.price);
      if (success) {
        await unlockWeapon(weapon.id);
        await setSelectedWeapon(weapon.id);
        setOwnedIds(getOwnedWeaponIds());
        setSelectedId(weapon.id);
        setCoins(getTotalCoins());
      }
    };

    // AFTER:
    const handleBuy = async (weapon: Weapon) => {
      if (coins < weapon.price) return;
      const success = await spendCoins(weapon.price);
      if (success) {
        setOwnedIds(prev => [...prev, weapon.id]);
        setSelectedId(weapon.id);
        setCoins(getTotalCoins());
        // Fire-and-forget Firestore writes
        unlockWeapon(weapon.id);
        setSelectedWeapon(weapon.id);
      }
    };
    ```

  **Must NOT do**:
  - Do NOT remove the `await` from `spendCoins()` — coin deduction MUST succeed before unlocking
  - Do NOT change any weapon data, imports, or types
  - Do NOT add error handling/retry for the fire-and-forget calls (keep it simple)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:
  - `src/components/WeaponSelector.tsx:22-32` — Current `handleBuy` with three sequential awaits
  - `src/components/WeaponSelector.tsx:34-37` — Current `handleEquip` with `await setSelectedWeapon`
  - `src/utils/weaponManager.ts` — `setSelectedWeapon` is async (writes to Firestore + localStorage)
  - `src/utils/weaponManager.ts` — `unlockWeapon` is async (writes to Firestore + localStorage)

  **Acceptance Criteria**:
  - [ ] `handleEquip` is NOT async (no `async` keyword, no `await`)
  - [ ] `handleEquip` calls `setSelectedId` BEFORE `setSelectedWeapon`
  - [ ] `handleBuy` still awaits `spendCoins` but NOT `unlockWeapon` or `setSelectedWeapon`
  - [ ] `handleBuy` updates React state (`setOwnedIds`, `setSelectedId`, `setCoins`) BEFORE the fire-and-forget calls
  - [ ] `npm run build` passes (no type errors from removing async)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: handleEquip is synchronous
    Tool: Bash (grep)
    Preconditions: WeaponSelector.tsx saved
    Steps:
      1. grep -n "handleEquip" src/components/WeaponSelector.tsx
      2. Verify the function signature does NOT contain "async"
      3. Verify there is no "await" inside handleEquip
      4. Verify setSelectedId appears BEFORE setSelectedWeapon
    Expected Result: handleEquip is a plain function, no async/await
    Evidence: .sisyphus/evidence/task-3-equip-check.txt

  Scenario: handleBuy still awaits spendCoins but not unlock/select
    Tool: Bash (grep)
    Steps:
      1. grep -A 15 "handleBuy" src/components/WeaponSelector.tsx
      2. Verify "await spendCoins" is present
      3. Verify "await unlockWeapon" is NOT present
      4. Verify "await setSelectedWeapon" is NOT present in handleBuy
    Expected Result: Only spendCoins is awaited; unlockWeapon and setSelectedWeapon are fire-and-forget
    Evidence: .sisyphus/evidence/task-3-buy-check.txt

  Scenario: Build succeeds
    Tool: Bash
    Steps:
      1. npm run build
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-3-build.txt
  ```

  **Commit**: YES (group with T1, T2, T4)
  - Files: `src/components/WeaponSelector.tsx`

---

- [x] 4. Update Tests + Full Verification

  **What to do**:
  - In `src/components/__tests__/Menu.test.tsx`:
    - Line 77-81: Update test name from `'should render skins button'` to `'should render shop button'`
    - Line 79: Change `screen.getByRole('button', { name: /skins/i })` → `screen.getByRole('button', { name: /shop/i })`
    - Line 83-88: Update test name from `'should call onOpenShop when skins button is clicked'` to `'should call onOpenShop when shop button is clicked'`
    - Line 85: Change `screen.getByRole('button', { name: /skins/i })` → `screen.getByRole('button', { name: /shop/i })`
  - Run full verification:
    - `npm run lint` — must pass
    - `npm run test:run` — must pass (421+ tests, 0 failures)
    - `npm run build` — must pass

  **Must NOT do**:
  - Do NOT modify any test logic or assertions beyond the button name change
  - Do NOT fix pre-existing LSP errors in other test files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Wave 1)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2, 3

  **References**:
  - `src/components/__tests__/Menu.test.tsx:77-88` — Two tests that reference `/skins/i` button name
  - `src/components/__tests__/WeaponSelector.test.tsx` — Review but likely no changes needed (tests use CSS selectors, not button text)

  **Acceptance Criteria**:
  - [ ] No test references `/skins/i` in Menu.test.tsx
  - [ ] `npm run lint` exits 0
  - [ ] `npm run test:run` exits 0 with 421+ tests passing
  - [ ] `npm run build` exits 0

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All tests pass
    Tool: Bash
    Steps:
      1. npm run test:run
    Expected Result: 421+ tests pass, 0 failures
    Evidence: .sisyphus/evidence/task-4-tests.txt

  Scenario: Lint passes
    Tool: Bash
    Steps:
      1. npm run lint
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-4-lint.txt

  Scenario: Build passes
    Tool: Bash
    Steps:
      1. npm run build
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-4-build.txt
  ```

  **Commit**: YES (single commit with T1, T2, T3)
  - Message: `fix(ui): fix menu button label, weapon card layout, and equip performance`
  - Files: `src/components/Menu.tsx`, `src/components/Menu.css`, `src/components/WeaponSelector.tsx`, `src/components/WeaponSelector.css`, `src/components/__tests__/Menu.test.tsx`
  - Pre-commit: `npm run test:run && npm run lint`

---

## Commit Strategy

Single commit for all 4 tasks:
- **Message**: `fix(ui): fix menu button label, weapon card layout, and equip performance`
- **Files**: Menu.tsx, Menu.css, WeaponSelector.tsx, WeaponSelector.css, Menu.test.tsx
- **Pre-commit**: `npm run test:run && npm run lint`

---

## Success Criteria

### Verification Commands
```bash
npm run lint      # Expected: exit 0
npm run test:run  # Expected: 421+ tests, 0 failures
npm run build     # Expected: exit 0
grep -r "skins-button" src/  # Expected: no matches
grep "Shop" src/components/Menu.tsx  # Expected: 1 match in btn-text
grep "1fr" src/components/WeaponSelector.css  # Expected: no matches
grep "async.*handleEquip" src/components/WeaponSelector.tsx  # Expected: no matches
```

### Final Checklist
- [ ] Button says "Shop" with 🛒 icon
- [ ] No remaining `.skins-button` CSS references
- [ ] Weapon cards are compact (max-width constrained, no 1fr)
- [ ] handleEquip is synchronous (instant UI)
- [ ] handleBuy only awaits spendCoins, not unlock/select
- [ ] All tests pass
- [ ] Build clean
