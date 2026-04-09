# Implementation Notes

## Current state
This baseline now includes:
- initial D1 schema
- trait, ethic, authority, and parse/review migrations
- D1 read helpers for traits, ethics, and authorities
- Worker trait, ethic, and authority endpoints
- route-level `load` conversion for codex routes
- heuristic trait and ethic parser paths in PowerShell using wiki HTML
- local source snapshot persistence for fetched source HTML
- D1 SQL generation for parsed trait and ethic upserts
- optional Wrangler execution for writing parsed trait and ethic records into D1
- parse run creation during ingest
- parse issue and review queue creation for low-confidence parses
- seed fallback behavior for API reads

## DB write integration status
The ingest pipeline now supports database writes for parsed trait and ethic data by:
- generating deterministic SQL from normalized payloads
- persisting source snapshot metadata into `source_snapshots`
- creating a `parse_runs` row per ingest execution
- upserting entities into `entities`
- replacing effect rows in `entity_effects`
- replacing requirement/restriction rows in `entity_requirements`
- writing low-confidence parse warnings into `parse_issues`
- opening `review_queue` rows for records that need manual follow-up

## Next step
Add authority ingest parsing with the same pipeline, then connect ingest-created parse runs to an eventual admin review UI.
