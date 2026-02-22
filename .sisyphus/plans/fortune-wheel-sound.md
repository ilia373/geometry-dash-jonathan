# Fortune Wheel Spinning Sound

## TL;DR

> **Quick Summary**: Add spinning wheel sound effect that plays during the fortune wheel spin animation and stops when the wheel lands on a result.
> 
> **Deliverables**:
> - `soundManager.ts` updated with `playLoopingSound()`, `stopSound()` methods + `spinning-wheel` pre-loaded
> - `FortuneWheel.tsx` plays the sound on spin start, stops on land, cleans up on unmount
> - `FortuneWheel.test.tsx` updated with new mock methods + assertions for spinning sound behavior
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO — single task
> **Critical Path**: Task 1

---

## Context

### Original Request
User added `spinning-wheel.mp3` to `public/sounds/` and wants the sound to play when the fortune wheel spins.

### Interview Summary
**Key Discussions**:
- Sound should play when SPIN button is clicked
- Sound should explicitly stop when the wheel lands (after 4s animation), not fire-and-forget
- This prevents overlap with reward sounds (coin/success) that play after landing

**Research Findings**:
- `soundManager.ts` has `playSound(name)` that clones audio for fire-and-forget SFX — no stop capability
- `soundManager.ts` already has a tracked-audio pattern with `backgroundMusic` (play/pause/stop/resume)
- `FortuneWheel.tsx` already imports `soundManager` and uses it for reward sounds
- Spin animation is 4000ms (setTimeout on line 136)
- `spinning-wheel.mp3` already exists at `public/sounds/spinning-wheel.mp3`

### Metis Review
**Identified Gaps** (addressed):
- **Sound looping**: If `spinning-wheel.mp3` is shorter than 4s, there'd be a silence gap → resolved by setting `loop = true` on the clone
- **Modal close during spin**: Sound would keep playing if user closes modal mid-spin → resolved by adding `useEffect` cleanup
- **Double-click race condition**: Second `playLoopingSound` call while one is active → resolved by stopping existing instance before starting new
- **Autoplay policy**: Browser may block play → resolved by catching play promise rejection (same pattern as existing sounds)

---

## Work Objectives

### Core Objective
Play the `spinning-wheel.mp3` sound when the fortune wheel spin animation starts, and stop it when the wheel lands on a result.

### Concrete Deliverables
- `src/utils/soundManager.ts` — new `playLoopingSound()` and `stopSound()` methods, `spinning-wheel` pre-loaded
- `src/components/FortuneWheel.tsx` — play on spin, stop on land, cleanup on unmount
- `src/components/__tests__/FortuneWheel.test.tsx` — mock + assertion updates

### Definition of Done
- [ ] `npm run build` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run test:run` exits 0 with all tests passing

### Must Have
- Spinning wheel sound plays immediately when SPIN button is clicked
- Sound loops (in case audio file < 4 seconds)
- Sound stops before reward sounds play (inside setTimeout callback)
- Sound stops when FortuneWheel component unmounts (modal close during spin)
- Mute state respected — sound does not play when muted
- Existing `playSound()` method completely unchanged

### Must NOT Have (Guardrails)
- Do NOT refactor existing `playSound()` to track clones
- Do NOT add a generic `stopAllSounds()` method
- Do NOT add volume fade-out or transition effects
- Do NOT create a separate `LoopingSoundManager` class
- Do NOT modify `src/test/setup.ts`
- Do NOT add tests for `soundManager.ts` itself (excluded from coverage)
- Do NOT change the 4000ms timeout or CSS animation duration
- Do NOT touch any file other than `soundManager.ts`, `FortuneWheel.tsx`, and `FortuneWheel.test.tsx`

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest + RTL)
- **Automated tests**: YES (Tests-after — update existing test file)
- **Framework**: Vitest

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Tests/Build**: Use Bash — Run test/build commands, assert exit codes

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — single task):
└── Task 1: Add spinning sound to SoundManager + FortuneWheel + tests [quick]

Wave FINAL (After Task 1):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1 → F1-F4
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | — | F1, F2, F3, F4 |
| F1 | 1 | — |
| F2 | 1 | — |
| F3 | 1 | — |
| F4 | 1 | — |

### Agent Dispatch Summary

- **Wave 1**: 1 task — T1 → `quick`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Add spinning wheel sound to SoundManager, wire into FortuneWheel, update tests

  **What to do**:

  **Part A — `src/utils/soundManager.ts`:**
  1. Add a new private field: `private activeSounds: Map<string, HTMLAudioElement> = new Map();`
  2. In the constructor, add after line 15 (`this.loadSound('coin', '/sounds/coin.mp3');`):
     ```typescript
     this.loadSound('spinning-wheel', '/sounds/spinning-wheel.mp3');
     ```
  3. Add new method `playLoopingSound(name: string): void`:
     - If `this.isMuted`, return early
     - Get base audio from `this.sounds.get(name)`, if not found return
     - If `this.activeSounds.has(name)`, stop existing instance first (call `this.stopSound(name)`)
     - Clone the audio: `const clone = sound.cloneNode() as HTMLAudioElement`
     - Set `clone.volume = this.sfxVolume`
     - Set `clone.loop = true`
     - Store: `this.activeSounds.set(name, clone)`
     - Play: `clone.play().catch(() => {})` — same error-catching pattern as `playSound()`
  4. Add new method `stopSound(name: string): void`:
     - Get from `this.activeSounds.get(name)`, if not found return (no-op)
     - Call `.pause()` on it
     - Set `.currentTime = 0`
     - Delete from Map: `this.activeSounds.delete(name)`

  **Part B — `src/components/FortuneWheel.tsx`:**
  1. After line 98 (`setRotation(newRotation);`), add:
     ```typescript
     soundManager.playLoopingSound('spinning-wheel');
     ```
  2. At the TOP of the `setTimeout` callback (line 101, before `let skinResult`), add:
     ```typescript
     soundManager.stopSound('spinning-wheel');
     ```
  3. Add a `useEffect` cleanup hook (near other state declarations, around line 57) to stop the sound when the component unmounts:
     ```typescript
     useEffect(() => {
       return () => {
         soundManager.stopSound('spinning-wheel');
       };
     }, []);
     ```

  **Part C — `src/components/__tests__/FortuneWheel.test.tsx`:**
  1. Add new mock functions near the existing `mockPlaySound` (line 55):
     ```typescript
     const mockPlayLoopingSound = vi.fn();
     const mockStopSound = vi.fn();
     ```
  2. Update the soundManager mock (lines 56-60) to include new methods:
     ```typescript
     vi.mock('../../utils/soundManager', () => ({
       soundManager: {
         playSound: (sound: string) => mockPlaySound(sound),
         playLoopingSound: (sound: string) => mockPlayLoopingSound(sound),
         stopSound: (sound: string) => mockStopSound(sound),
       },
     }));
     ```
  3. Add test: `"should play spinning sound when spin starts"`:
     - Render FortuneWheel with `isOpen={true}` and spins available
     - Click SPIN button
     - Assert: `expect(mockPlayLoopingSound).toHaveBeenCalledWith('spinning-wheel')`
  4. Add test: `"should stop spinning sound when wheel lands"`:
     - Render FortuneWheel with `isOpen={true}` and spins available
     - Click SPIN button
     - `vi.advanceTimersByTime(4100)`
     - Assert: `expect(mockStopSound).toHaveBeenCalledWith('spinning-wheel')`
  5. Add test: `"should stop spinning sound before reward sounds play"`:
     - Use `mockStopSound.mock.invocationCallOrder[0]` and `mockPlaySound.mock.invocationCallOrder[0]`
     - Assert stop was called before play (stop's invocation order < play's invocation order)

  **Must NOT do**:
  - Do NOT modify `playSound()` method
  - Do NOT modify `src/test/setup.ts`
  - Do NOT add tests for `soundManager.ts` itself
  - Do NOT change 4000ms timeout or CSS animation duration

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, well-scoped task touching 3 files with clear patterns to follow
  - **Skills**: `[]`
    - No specialized skills needed — straightforward TypeScript/React changes
  - **Skills Evaluated but Omitted**:
    - `playwright`: No browser testing needed — verification via Vitest
    - `dev-browser`: No browser automation required
    - `frontend-ui-ux`: No UI/UX design involved — pure logic/audio wiring

  **Parallelization**:
  - **Can Run In Parallel**: NO (only task)
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: F1, F2, F3, F4
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL):

  **Pattern References** (existing code to follow):
  - `src/utils/soundManager.ts:3-17` — `SoundManager` class structure, constructor with `loadSound()` calls. Follow this pattern for adding the new `spinning-wheel` sound.
  - `src/utils/soundManager.ts:33-45` — `playSound()` method showing clone-and-play pattern with `.catch(() => {})` error handling. New `playLoopingSound()` uses same clone pattern but adds `loop = true` and stores reference.
  - `src/utils/soundManager.ts:26-31` — `loadBackgroundMusic()` showing tracked audio pattern (storing reference for lifecycle control). `activeSounds` Map follows this precedent.
  - `src/utils/soundManager.ts:57-74` — `pauseBackgroundMusic()/resumeBackgroundMusic()/stopBackgroundMusic()` showing pause + `currentTime = 0` reset pattern. `stopSound()` uses same pattern.
  - `src/components/FortuneWheel.tsx:96-98` — Where `setRotation(newRotation)` is called, right before setTimeout. This is where `playLoopingSound` should be inserted.
  - `src/components/FortuneWheel.tsx:101-136` — The setTimeout callback where the wheel "lands". `stopSound` should be the FIRST line inside this callback.
  - `src/components/FortuneWheel.tsx:107-121` — Existing reward sound calls (`soundManager.playSound('coin')`, `soundManager.playSound('success')`) showing how sounds are already used in this component.

  **Test References** (testing patterns to follow):
  - `src/components/__tests__/FortuneWheel.test.tsx:54-60` — Existing soundManager mock setup. Add `playLoopingSound` and `stopSound` to this mock object.
  - `src/components/__tests__/FortuneWheel.test.tsx:243-274` — Test showing spin-click → advanceTimers → assert pattern. New spinning sound tests follow this exact structure.
  - `src/components/__tests__/FortuneWheel.test.tsx:353-384` — Test asserting `mockPlaySound` was called with `'success'` after skin unlock. Shows the assertion pattern for sound mock calls.

  **Acceptance Criteria**:

  **Tests:**
  - [ ] All existing tests still pass: `npm run test:run` → 0 failures
  - [ ] New test "should play spinning sound when spin starts" passes
  - [ ] New test "should stop spinning sound when wheel lands" passes
  - [ ] New test "should stop spinning sound before reward sounds play" passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Build compiles successfully
    Tool: Bash
    Preconditions: All code changes applied
    Steps:
      1. Run `npm run build`
      2. Check exit code
    Expected Result: Exit code 0, no TypeScript errors
    Failure Indicators: Non-zero exit code, "error TS" in output
    Evidence: .sisyphus/evidence/task-1-build.txt

  Scenario: Lint passes
    Tool: Bash
    Preconditions: All code changes applied
    Steps:
      1. Run `npm run lint`
      2. Check exit code
    Expected Result: Exit code 0, no lint errors
    Failure Indicators: Non-zero exit code, lint error messages
    Evidence: .sisyphus/evidence/task-1-lint.txt

  Scenario: All tests pass including new spinning sound tests
    Tool: Bash
    Preconditions: All code changes applied
    Steps:
      1. Run `npm run test:run`
      2. Check exit code and test count
    Expected Result: Exit code 0, all tests pass, test count increased by 3
    Failure Indicators: Non-zero exit code, "FAIL" in output
    Evidence: .sisyphus/evidence/task-1-tests.txt

  Scenario: Coverage thresholds maintained
    Tool: Bash
    Preconditions: All tests passing
    Steps:
      1. Run `npm run test:coverage`
      2. Check branch/function/line/statement percentages
    Expected Result: branches ≥ 85%, functions ≥ 70%, lines ≥ 85%, statements ≥ 85%
    Failure Indicators: "Coverage threshold not met" error
    Evidence: .sisyphus/evidence/task-1-coverage.txt
  ```

  **Evidence to Capture:**
  - [ ] task-1-build.txt — Build output
  - [ ] task-1-lint.txt — Lint output
  - [ ] task-1-tests.txt — Test results
  - [ ] task-1-coverage.txt — Coverage report

  **Commit**: YES
  - Message: `feat(fortune-wheel): play spinning sound during wheel spin animation`
  - Files: `src/utils/soundManager.ts`, `src/components/FortuneWheel.tsx`, `src/components/__tests__/FortuneWheel.test.tsx`
  - Pre-commit: `npm run test:run`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, check method/call). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build` + `npm run lint` + `npm run test:run`. Review all changed files for: `as any`/`@ts-ignore`, empty catches (except the intentional autoplay `.catch(() => {})`), console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Run `npm run dev`. Open browser to localhost:5173. Navigate to fortune wheel. Click SPIN. Verify sound plays during animation. Verify sound stops when wheel lands. Verify reward sound plays after landing. Test with mute. Close modal during spin — verify sound stops. Save evidence.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Task 1**: `feat(fortune-wheel): play spinning sound during wheel spin animation` — `src/utils/soundManager.ts`, `src/components/FortuneWheel.tsx`, `src/components/__tests__/FortuneWheel.test.tsx`

---

## Success Criteria

### Verification Commands
```bash
npm run build     # Expected: exit code 0
npm run lint      # Expected: exit code 0
npm run test:run  # Expected: exit code 0, all tests pass
npm run test:coverage  # Expected: all thresholds met
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Coverage thresholds maintained
