# Birdieboard Conventions

## Code Style
- TypeScript strict mode — no `any`, no `@ts-ignore`
- ES modules (import/export)
- 2-space indentation, trailing commas, single quotes
- Prettier for formatting, ESLint for linting
- Run `npm run typecheck && npm run lint` before committing

## Components
- Use HeroUI components as base (Button, Card, Input, Modal, etc.)
- Custom wrappers in `src/components/` for project-specific styling
- Server Components by default, `'use client'` only when needed
- Golf-specific colors via `golf-green`, `golf-fairway`, `golf-light`, `golf-sand`, `golf-sky`

## API Design
- Next.js Route Handlers in `src/app/api/`
- Validate all input with Zod schemas from `src/lib/validations/`
- Return consistent JSON: `{ success: true, data }` or `{ success: false, error }`
- Health check at `/api/healthz`

## Server Actions
- Located in `src/server/actions/`
- Return `ActionResponse<T>` type:
  ```typescript
  type ActionResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string };
  ```

## Database
- Drizzle ORM with PostgreSQL
- Schema in `src/lib/drizzle/schema.ts`
- UUIDs for all primary keys
- Timestamps (`created_at`, `updated_at`) on all tables
- Use parameterized queries only (never string concatenation)

## Auth
- NextAuth.js v5 with JWT sessions
- Protected routes via middleware in `src/middleware.ts`
- Session check in server components via `auth()` from `src/server/auth.ts`
- Client-side session via `useSession()` from `next-auth/react`

## Error Handling
- Use custom error classes from `src/utils/errors.ts`
- Never expose internal errors to clients
- Log errors server-side only

## Commits
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Keep subject under 72 characters
- Co-authored commits include model attribution
