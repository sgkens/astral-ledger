# D1 Setup

## Apply migrations
```bash
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0001_init.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0002_seed_traits.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0003_seed_ethics.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0004_seed_authorities.sql
```

## Verify
```bash
wrangler d1 execute astral-ledger --command "SELECT entity_type, slug, name FROM entities ORDER BY entity_type, name;"
```

## Runtime behavior
- API reads from D1 first
- API falls back to seeded in-memory data if D1 is empty
- traits, ethics, and authorities now support this path
