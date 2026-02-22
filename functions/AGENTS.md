# Cloud Functions — AGENTS.md

Single Cloud Function in `functions/src/index.ts`. Separate TypeScript project (own `tsconfig.json`, Node 22 runtime).

## What's Here

One blocking auth function: `setAdminClaim`.

```
functions/
├── src/
│   └── index.ts       # setAdminClaim — beforeUserSignedIn trigger
├── package.json       # Separate deps (firebase-functions, firebase-admin)
├── tsconfig.json      # Separate config (Node target, not browser)
└── .eslintrc.js       # Separate lint config
```

## setAdminClaim

- **Trigger**: `beforeUserSignedIn` (blocking — runs before sign-in completes)
- **Logic**: Reads `SUPER_ADMIN_EMAILS` from Secret Manager → splits CSV → checks if signing-in user's email is in list → sets `{ admin: true/false }` custom claim on JWT
- **Effect**: Client reads `idTokenResult.claims.admin` after sign-in to show/hide AdminPanel

```typescript
export const setAdminClaim = beforeUserSignedIn(
  { secrets: [superAdminEmails] },
  async (event) => {
    const email = event.data.email?.toLowerCase();
    const adminList = superAdminEmails.value().split(',').map(e => e.trim().toLowerCase());
    return { customClaims: { admin: adminList.includes(email || '') } };
  }
);
```

## Key Details

- **Secret**: `SUPER_ADMIN_EMAILS` — comma-separated emails, stored in Google Secret Manager
- **Runtime**: Node 22 (set in `package.json` `engines` field)
- **Region**: Default (us-central1) unless overridden
- **Security**: Admin check is server-side only. Client claim is UI hint — Firestore rules enforce actual access control.

## Development

```bash
# Deploy functions only
firebase deploy --only functions

# Test locally with emulators
npm run emulators       # from project root
```

- Functions are **excluded from frontend test coverage**
- No unit tests currently exist for Cloud Functions
- Changes here require `firebase deploy --only functions` (separate from hosting deploy)

## Gotchas

- `beforeUserSignedIn` is a **blocking** function — if it throws, sign-in fails entirely
- Secret Manager access requires `secretmanager.versions.access` IAM permission on the service account
- The function runs on **every** sign-in (Google + email), not just first registration
- Separate `node_modules` — run `npm install` inside `functions/` directory
