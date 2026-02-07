<!-- Context: project-intelligence/nav | Priority: high | Version: 1.0 | Updated: 2026-02-07 -->

# Project Intelligence

> Start here for quick project understanding. Links to patterns and standards.

## Structure

```
.opencode/context/project-intelligence/
├── navigation.md          # This file - quick overview
└── technical-domain.md    # Stack, patterns, conventions
```

## Quick Routes

| What You Need | File | Description |
|---------------|------|-------------|
| Tech stack & patterns | `technical-domain.md` | React, TypeScript, Firebase patterns |
| Full agent guidelines | `/AGENTS.md` | Complete guide (257 lines) |

## This Project

**Geometry Dash Clone** - Browser-based rhythm platformer

| Aspect | Details |
|--------|---------|
| Stack | React 19 + TypeScript 5.9 + Vite 7 + Firebase 11 |
| Rendering | HTML5 Canvas (60fps game loop) |
| Testing | Vitest + React Testing Library |
| Hosting | Firebase Hosting |

## Key Patterns

1. **Components**: `React.FC<Props>` with interface-first
2. **Game Loop**: `useRef` + `requestAnimationFrame`
3. **Testing**: Mock Firebase BEFORE imports
4. **Naming**: PascalCase components, camelCase utils

## Usage

**New to project?**
1. Read `AGENTS.md` (full guide)
2. Read `technical-domain.md` (patterns)

**Quick reference?**
- Patterns → `technical-domain.md`
- Commands → `AGENTS.md` Quick Reference section

## Maintenance

Update when:
- Tech stack changes
- New patterns established
- Architecture decisions made

Run `/add-context --update` to refresh patterns.
