# Implementation Notes

## Current state
This incremental package adds:
- persistence fields for reviewer identity in `review_actions`
- API support for recording actor email / subject / source on each action
- admin review UI history entries that show who performed each action

## Next step
Backfill existing review actions with actor metadata where possible and surface avatar/name presentation if your identity provider supplies it.
