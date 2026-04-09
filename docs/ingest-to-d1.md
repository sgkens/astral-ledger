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

### Traits: parse and generate normalized JSON only
```bash
pwsh -File ./tools/powershell/scripts/Invoke-TraitsIngest.ps1 -Limit 25
```

### Traits: parse and generate D1 SQL
```bash
pwsh -File ./tools/powershell/scripts/Invoke-TraitsIngest.ps1 -Limit 25 -GenerateSql
```

### Traits: parse and write directly into D1
```bash
pwsh -File ./tools/powershell/scripts/Invoke-TraitsIngest.ps1 -Limit 25 -ExecuteWithWrangler -DatabaseName astral-ledger
```

### Ethics: parse and generate D1 SQL
```bash
pwsh -File ./tools/powershell/scripts/Invoke-EthicsIngest.ps1 -Limit 16 -GenerateSql
```

### Ethics: parse and write directly into D1
```bash
pwsh -File ./tools/powershell/scripts/Invoke-EthicsIngest.ps1 -Limit 16 -ExecuteWithWrangler -DatabaseName astral-ledger
```

## Generated artifacts
- `.cache/traits.html`
- `.cache/ethics.html`
- `.cache/snapshots/<date>/<hash>.html`
- `.cache/snapshots/<date>/<hash>.json`
- `.cache/traits.normalized.json`
- `.cache/ethics.normalized.json`
- `.cache/traits.upsert.sql`
- `.cache/ethics.upsert.sql`

## What gets written to D1
- `parse_runs`
- `sources`
- `source_snapshots`
- `entities`
- `entity_effects`
- `entity_requirements`
- `parse_issues` when parse confidence is low
- `review_queue` when low-confidence parses need review

## Current limitation
This is SQL-generation-based integration through Wrangler, not a native direct database driver inside PowerShell. It is reliable for the current Cloudflare D1 workflow and keeps the ingest process explicit and auditable.
