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
- seed fallback behavior for API reads

## Review workflow status
The admin review UI now supports:
- approving review queue items
- rejecting review queue items
- resolving review queue items
- resolving parse issues
- rejecting parse issues
- attaching notes to actions
- viewing per-item action history
- viewing global review history

Review actions are persisted in the `review_actions` table and exposed through `/api/admin/review/actions`.

## Next step
Add auth/permission enforcement for admin actions and build entity detail deep-links from review items into codex pages.
