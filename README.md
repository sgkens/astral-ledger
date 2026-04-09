# Astral Ledger Starter Scaffold

Starter scaffold for a Stellaris codex and empire builder platform.

## Included
- `apps/web` — SvelteKit-style frontend scaffold
- `apps/api` — Cloudflare Worker API scaffold
- `packages/contracts` — shared TypeScript contracts
- `packages/db` — SQL schema and migration starter
- `tools/powershell` — PowerShell ingest module scaffold
- `data/seed` — sample trait record for UI/API development

## Initial focus
This scaffold targets the **traits vertical slice**:
- fetch
- parse
- normalize
- store
- expose read API
- render codex list/detail
- reuse tooltip card

## Notes
This is a starter scaffold, not a fully wired production app. It is structured so implementation can continue without reshaping the repository.
