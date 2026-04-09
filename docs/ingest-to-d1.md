# Ingest to D1

## Current flow
The ingest pipeline now supports:

1. fetch wiki HTML
2. persist local source snapshot
3. discover entity candidates
4. parse entity sections
5. generate normalized JSON
6. generate D1 upsert SQL
7. optionally execute that SQL through Wrangler
8. create `parse_runs`
9. create `parse_issues` for low-confidence parses
10. create `review_queue` records for items that need follow-up

## Command examples

### Traits: parse and write directly into D1
```bash
pwsh -File ./tools/powershell/scripts/Invoke-TraitsIngest.ps1 -Limit 25 -ExecuteWithWrangler -DatabaseName astral-ledger
```

### Ethics: parse and write directly into D1
```bash
pwsh -File ./tools/powershell/scripts/Invoke-EthicsIngest.ps1 -Limit 16 -ExecuteWithWrangler -DatabaseName astral-ledger
```

### Authorities: parse and write directly into D1
```bash
pwsh -File ./tools/powershell/scripts/Invoke-AuthoritiesIngest.ps1 -Limit 12 -ExecuteWithWrangler -DatabaseName astral-ledger
```

## Admin review UI
A starter admin UI now reads from:
- `/api/admin/review/parse-runs`
- `/api/admin/review/parse-issues`
- `/api/admin/review/review-queue`

Route:
- `/admin/review`

## Current limitation
The admin review UI is read-only. It is intended as the first inspection surface over ingest activity, not a complete moderation workflow yet.
