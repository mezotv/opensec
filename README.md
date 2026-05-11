# OpenSec

OpenSec is an MVP for donated security reviews of public open source GitHub repositories.

Maintainers can request a private report for a public repository. Donors can use their own AI capacity or security tooling to run a review and submit a Markdown report. Public pages show repository metadata and safe summary counts; full report contents stay private to the requester and donor.

## Stack

- Next.js app in `apps/web`
- Better Auth with GitHub OAuth only
- PostgreSQL with Drizzle ORM
- Shared UI primitives in `packages/ui`
- Bun and Turborepo for workspace scripts

## Development

Install dependencies:

```bash
bun install
```

Create `apps/web/.env` with local values, then run migrations:

```bash
bun run db:migrate
```

Start the app:

```bash
bun run dev:web
```

The local app is configured for Portless at `https://opensec.localhost`.

## Scripts

- `bun run dev`: start workspace dev tasks
- `bun run dev:web`: start only the web app
- `bun run build`: build workspace packages
- `bun run check`: run Oxlint and Oxfmt
- `bun run db:generate`: generate Drizzle migrations
- `bun run db:migrate`: run Drizzle migrations
- `bun run db:studio`: open Drizzle Studio
