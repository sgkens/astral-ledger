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
- D1 SQL generation for parsed trait upserts
- optional Wrangler execution for writing parsed trait records into D1
- seed fallback behavior for API reads

## DB write integration status
The ingest pipeline now supports database writes for parsed trait data by:
- generating deterministic SQL from normalized trait payloads
- persisting source snapshot metadata into `source_snapshots`
- upserting entities into `entities`
- replacing effect rows in `entity_effects`
- replacing requirement/restriction rows in `entity_requirements`
- writing low-confidence parse warnings into `parse_issues`

## Next step
Add database write integration for ethics using the same normalized payload and SQL generation pattern, then connect parse runs and review queue creation.
