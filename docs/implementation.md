# Implementation Notes

## Current state
This baseline now includes:
- initial D1 schema
- trait, ethic, authority, and parse/review migrations
- D1 read helpers for traits, ethics, and authorities
- Worker trait, ethic, authority, and admin review endpoints
- route-level `load` conversion for codex routes
- heuristic trait, ethic, and authority parser paths in PowerShell using wiki HTML
- local source snapshot persistence for fetched source HTML
- D1 SQL generation for parsed trait, ethic, and authority upserts
- optional Wrangler execution for writing parsed records into D1
- parse run creation during ingest
- parse issue and review queue creation for low-confidence parses
- starter admin review UI over parse runs, parse issues, and review queue
- seed fallback behavior for API reads

## Authority ingest status
Authorities now use the same ingest pipeline pattern as traits and ethics:
- source fetch
- source snapshot
- candidate discovery
- heuristic parsing
- normalized payload
- SQL generation
- optional D1 write through Wrangler

## Admin review UI status
The admin review UI is now seeded as a read-only operational surface. It allows inspection of:
- parse runs
- parse issues
- review queue items

## Next step
Add action endpoints and UI controls for approving, rejecting, and resolving review queue items.
