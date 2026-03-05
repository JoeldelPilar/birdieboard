# Birdieboard — Golf Tracking App

## What This Is
A social golf tracking web app. Track rounds, manage your bag, compete with friends, and improve your game.

## Tech Stack
- **Framework:** Next.js 14 App Router, React 18, TypeScript strict
- **UI:** HeroUI (formerly NextUI), Tailwind CSS, Framer Motion, Tabler Icons
- **Auth:** NextAuth.js v5 (Google OAuth + Magic Link)
- **Database:** PostgreSQL + Drizzle ORM
- **Cache:** Valkey (Redis-compatible) via ioredis
- **Storage:** MinIO (S3-compatible) via AWS SDK v3
- **Charts:** Chart.js + react-chartjs-2
- **Validation:** Zod
- **State:** TanStack React Query v5
- **Deploy:** OSC My App (nodejs)

## Project Structure
```
src/
  app/                     # Next.js App Router pages + API routes
    (landing)/             # Public landing page (no auth required)
    auth/                  # Sign in, sign up, verify
    dashboard/             # Authenticated app (sidebar layout)
    api/                   # API route handlers
  components/              # Reusable UI components
    dashboard/             # Dashboard shell, sidebar
  contexts/                # React Context providers
  hooks/                   # Custom React hooks
  lib/                     # Core utilities
    drizzle/schema.ts      # Database schema (Drizzle ORM)
    drizzle/migrations/    # SQL migrations
    db.ts                  # PostgreSQL connection
    redis.ts               # Valkey connection
    s3.ts                  # MinIO client
    golf-api.ts            # GolfCourseAPI client
    handicap.ts            # WHS handicap calculation
    env.ts                 # Validated environment variables
    validations/           # Zod schemas
  server/
    auth.ts                # NextAuth configuration
    actions/               # Server Actions
  types/                   # TypeScript type definitions
  utils/                   # Error classes, helpers
```

## Commands
- `npm run dev` — Start dev server (port 3000)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run typecheck` — TypeScript type check
- `npm run lint` — ESLint
- `npm run lint:fix` — ESLint with auto-fix
- `npm run format` — Prettier format
- `npm run format:check` — Prettier check

## Code Conventions
- TypeScript strict mode, no `any`, no `@ts-ignore`
- ES modules, 2-space indent, trailing commas, single quotes
- Zod validation on all API routes and server actions
- `ActionResponse<T>` tuple for server action return types
- Custom error classes in `src/utils/errors.ts`
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`

## Environment Variables
See `.env.example` for all required variables. OSC injects PORT, APP_URL, AUTH_URL.

## Database
- Schema in `src/lib/drizzle/schema.ts`
- Generate migrations: `npx drizzle-kit generate`
- Run migrations: `npx drizzle-kit migrate`

## External APIs
- **GolfCourseAPI** (golfcourseapi.com): Course search, 300 req/day free
- **Open-Meteo**: Weather data, free, no key
- **WHS**: Handicap calculation implemented in `src/lib/handicap.ts`
