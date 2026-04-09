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
- admin auth gating for review endpoints
- codex deep-links from review items
- seed fallback behavior for API reads

## Admin auth status
Admin endpoints now enforce a baseline admin gate:
- allow Cloudflare Access-protected requests via `Cf-Access-Jwt-Assertion` header presence
- allow development or fallback access via configured admin API key headers

This is a practical baseline for the current scaffold. The next hardening step is full JWT validation against Cloudflare Access signing keys.

## Deep-link status
Review queue items now resolve entity deep-links through joined entity metadata.
Parse issues also expose a codex link when the issue carries both entity type and raw slug context.

## Next step
Replace baseline admin auth checks with full Cloudflare Access JWT validation and add role-aware permissions.
