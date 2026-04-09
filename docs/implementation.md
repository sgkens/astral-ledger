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
- starter admin review UI over parse runs, parse issues, and review queue
- review action endpoints and UI controls for approve / reject / resolve
- seed fallback behavior for API reads

## Review workflow status
The admin review UI is no longer read-only. It now supports:
- approving review queue items
- rejecting review queue items
- resolving review queue items
- resolving parse issues
- rejecting parse issues

Review actions are recorded in the `review_actions` table.

## Next step
Add notes/reasons to actions from the UI and surface `review_actions` history in the admin review page.
