# Implementation Notes

## Current state
This incremental package adds:
- reviewer identity persistence fields for `review_actions`
- DB migration to backfill older rows where possible
- API support for recording actor email / subject / source on each action
- cleaner actor presentation in the admin history feed
- continuation of the admin review UI implementation

## What is persisted
New and updated review action records can now store:
- `actor_email`
- `actor_subject`
- `actor_source`

## Backfill strategy
Older rows are backfilled conservatively:
- `actor_source` -> `legacy_unknown`
- `actor_email` -> `unknown-reviewer@local`
- `actor_subject` -> `legacy-review-action`

This preserves traceability without fabricating a real identity.

## UI presentation
The history feed now shows:
- actor label
- auth source
- simple avatar/initial badge
- note
- timestamp

## Next implementation direction
Persist richer actor presentation fields when available from identity claims, such as display name and avatar URL.
