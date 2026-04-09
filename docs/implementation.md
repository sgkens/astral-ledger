# Implementation Notes

## Current state
This baseline now includes:
- initial D1 schema
- trait, ethic, authority, parse/review, and review-action migrations
- D1 read helpers for traits, ethics, and authorities
- Worker trait, ethic, authority, and admin review endpoints
- route-level `load` conversion for codex routes
- heuristic trait, ethic, and authority parser paths in PowerShell using wiki HTML
- local source snapshot persistence for fetched source HTML
- D1 SQL generation for parsed trait, ethic, and authority upserts
- optional Wrangler execution for writing parsed records into D1
- parse run creation during ingest
- parse issue and review queue creation for low-confidence parses
- interactive admin review UI over parse runs, parse issues, review queue, and review action history
- review action notes captured from the UI
- full Cloudflare Access JWT validation scaffold using JWKs + AUD
- role-aware permission checks for admin reads and writes
- codex deep-links from review items
- seed fallback behavior for API reads

## Admin auth status
The scaffold has moved beyond header presence checks.
It now validates Access JWTs using JWKs and audience configuration, then applies role/group based permissions.

## Current permission model
- GET on `/api/admin/*` -> requires admin read permission
- POST on `/api/admin/*` -> requires admin write permission

## Next step
Surface the authenticated admin identity in the UI and add per-action permission messaging.
