# Implementation Notes

## Current state
This baseline now includes:
- initial D1 schema
- trait, ethic, authority, and parse/review migrations
- D1 read helpers for traits, ethics, and authorities
- Worker trait, ethic, and authority endpoints
- route-level `load` conversion for codex routes
- a real trait parser path in PowerShell using wiki HTML heuristics
- local source snapshot persistence for fetched source HTML
- seed fallback behavior for API reads

## Real trait parser status
The trait parser is now heuristic-based rather than seeded. It:
- discovers trait candidates from wiki HTML
- locates trait sections by heading ID
- extracts a summary from decoded section text
- extracts effects from list items and fallback text heuristics
- captures trait image candidates when present
- returns parse confidence and warnings

## Source snapshot persistence status
The ingest pipeline now persists:
- raw fetched HTML snapshot
- JSON metadata alongside the snapshot
- content hash, byte length, and capture time

## Next step
Wire persisted source snapshot metadata into database writes and add real parser coverage for ethics.
