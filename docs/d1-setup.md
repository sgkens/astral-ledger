# D1 Setup

## Apply migrations
```bash
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0001_init.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0002_seed_traits.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0003_seed_ethics.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0004_seed_authorities.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0005_parse_ops.sql
```

## Verify
```bash
wrangler d1 execute astral-ledger --command "SELECT entity_type, slug, name FROM entities ORDER BY entity_type, name;"
wrangler d1 execute astral-ledger --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('parse_runs','parse_issues','review_queue');"
```

## Runtime behavior
- API reads from D1 first
- API falls back to seeded in-memory data if D1 is empty
- traits, ethics, and authorities support this path
- parse/review tables now exist for future ingest workflow integration
