# Ingest to D1

## Admin review UI
The admin review UI now reads from:
- `/api/admin/review/parse-runs`
- `/api/admin/review/parse-issues`
- `/api/admin/review/review-queue`
- `/api/admin/review/actions`

Route:
- `/admin/review`

## Actions
The admin review UI can now submit:
- approve
- reject
- resolve

Actions support optional notes and are written through:
- `POST /api/admin/review/action`

Those decisions are stored in `review_actions` and shown in:
- per-item history panels
- a global review history panel
