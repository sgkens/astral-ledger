# Astral Ledger

Production-ready baseline scaffold for a Stellaris codex + empire builder platform.

## Stack
- SvelteKit frontend scaffold
- Cloudflare Workers API scaffold
- Cloudflare D1 migration baseline
- Drizzle config baseline
- Shared TypeScript contracts
- PowerShell ingest module scaffold
- Seeded traits vertical slice

## Current Vertical Slice
Traits codex:
- source fetch
- normalized parser scaffold
- seeded API
- codex list/detail UI
- tooltip card base
- DB migration foundation

## Repository Layout
- `apps/web` — frontend
- `apps/api` — Worker API
- `packages/contracts` — shared contracts
- `packages/db` — migrations and DB helpers
- `tools/powershell` — ingest module
- `data/seed` — starter data
- `docs` — roadmap and implementation notes

## Getting Started
1. Install dependencies with `pnpm install`
2. Copy `.env.example` to `.env`
3. Apply D1 migration using Wrangler
4. Run web and api dev scripts
5. Replace seeded trait responses with DB-backed queries

## Notes
This baseline is intentionally structured for extension.
Canonical data, editorial build data, and UI read models remain separate.
