# D1 Setup

## Apply migrations
```bash
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0001_init.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0002_seed_traits.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0003_seed_ethics.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0004_seed_authorities.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0005_parse_ops.sql
wrangler d1 execute astral-ledger --file=./packages/db/migrations/0006_review_actions.sql
```

## Verify
```bash
wrangler d1 execute astral-ledger --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('parse_runs','parse_issues','review_queue','review_actions');"
```
