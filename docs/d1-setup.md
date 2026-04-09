# D1 Setup

## Apply migrations
```bash
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0001_init.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0002_seed_traits.sql
```

## Verify
```bash
wrangler d1 execute astral-ledger --command "SELECT slug, name FROM entities WHERE entity_type='trait';"
```

## Runtime behavior
- API reads from D1 first
- API falls back to seeded in-memory data if D1 is empty
