# Ingest to D1

## Current flow
The trait ingest pipeline now supports:

1. fetch wiki HTML
2. persist local source snapshot
3. discover trait candidates
4. parse trait sections
5. generate normalized JSON
6. generate D1 upsert SQL
7. optionally execute that SQL through Wrangler

## Command examples

### Parse and generate normalized JSON only
```bash
pwsh -File ./tools/powershell/scripts/Invoke-TraitsIngest.ps1 -Limit 25
```

### Parse and generate D1 SQL
```bash
pwsh -File ./tools/powershell/scripts/Invoke-TraitsIngest.ps1 -Limit 25 -GenerateSql
```

### Parse and write directly into D1
```bash
pwsh -File ./tools/powershell/scripts/Invoke-TraitsIngest.ps1 -Limit 25 -ExecuteWithWrangler -DatabaseName astral-ledger
```

## Generated artifacts
- `.cache/traits.html`
- `.cache/snapshots/<date>/<hash>.html`
- `.cache/snapshots/<date>/<hash>.json`
- `.cache/traits.normalized.json`
- `.cache/traits.upsert.sql`

## What gets written to D1
- `sources`
- `source_snapshots`
- `entities`
- `entity_effects`
- `entity_requirements`
- `parse_issues` when parse confidence is low

## Current limitation
This is SQL-generation-based integration through Wrangler, not a native direct database driver inside PowerShell. It is reliable for the current Cloudflare D1 workflow and keeps the ingest process explicit and auditable.
