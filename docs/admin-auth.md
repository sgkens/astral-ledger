# Admin Auth

## Current implementation
Admin endpoints under `/api/admin/*` are protected with two layers:

1. Cloudflare Access JWT validation
2. role-aware permission checks

## UI surfacing
The admin review UI now shows:
- authenticated identity source
- email / subject
- derived roles / groups
- read permission status and reason
- write permission status and reason
- per-action blocked reasons when write access is missing

## Deep links
Review queue items and parse issues can expose codex links so reviewers can jump directly into the affected entity page during moderation.
