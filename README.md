# Nestora

Nestora is a frontend-only React/Vite prototype for a calmer way to discover flats, houses, apartments, studios, and PG homes.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Build for deployment

```bash
pnpm check
pnpm build
pnpm preview
```

The static build is written to `dist/public`. Vercel can deploy it using the committed `vercel.json`; the SPA rewrite keeps direct visits to `/explore` working.

## Current routes

- `/` — Nestora landing page
- `/explore` — searchable and filterable property directory

Authentication, owner listing tools, backend APIs, and database storage are intentionally deferred until the frontend product is finished.
