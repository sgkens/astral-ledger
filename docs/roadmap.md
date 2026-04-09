# Astral Ledger Roadmap

## Project Intent
Astral Ledger is a Stellaris codex, empire library, and build-planning platform.

It has three long-term product goals:

1. preserve accurate, patch-aware gameplay data
2. provide a structured builder for empire design and comparison
3. publish curated, roleplay-rich, and meta-aware build guides

The product must remain maintainable as patches change, sources shift, and new editorial content is added.

## Core Foundation Rules
- canonical gameplay data is not the same as editorial advice
- parser output must be deterministic
- source attribution is mandatory
- patch awareness is first-class
- UI theming must support multiple empires and play styles
- mobile-first layout remains the default
- direct game-file parsing is a later enhancement, not the MVP dependency

## Phase 0 — Foundation
### Goals
- stabilize repository layout
- establish D1 schema baseline
- define shared contracts
- create PowerShell ingest module scaffold
- scaffold Cloudflare Worker API
- scaffold SvelteKit-style frontend routes

### Deliverables
- workspace root
- `apps/web`
- `apps/api`
- `packages/contracts`
- `packages/db`
- `tools/powershell`
- `context/`

### Exit Criteria
- repository can be opened and extended without reshaping
- migrations exist
- API health route responds
- seed trait endpoint works
- web codex pages render seed data

## Phase 1 — Traits Vertical Slice
### Why Traits First
Traits are:
- bounded
- reusable across builds
- visible in UI
- simple enough for parser iteration

### Goals
- trait source fetch
- trait parse scaffold
- normalized trait JSON
- D1 persistence
- trait list/detail API
- trait list/detail UI
- tooltip reuse

### Deliverables
- trait migrations
- trait seed SQL
- D1-first API routes
- tooltip card component
- trait codex list/detail pages

### Exit Criteria
- seeded trait loads from D1 when database is present
- fallback works if D1 is unavailable
- trait detail page renders exact effects
- source attribution renders in UI

## Phase 2 — Canonical Codex Expansion
### Entity Order
1. ethics
2. authorities
3. civics
4. origins
5. traditions
6. ascension perks
7. technologies
8. optional later entities: relics, edicts, leader traits

### Goals
- one parser per entity family
- stable normalized shapes
- patch-aware read models
- shared codex detail layout

### Exit Criteria
- each entity family supports list/detail routes
- all detail pages use shared tooltip contract
- parse anomalies can be captured for review

## Phase 3 — Empire Library
### Goals
- add empire identities
- add theme overrides per empire
- add roleplay metadata
- add linked build variants

### Deliverables
- `/empires`
- `/empires/[slug]`
- empire cards
- empire theme system
- variant relationships

### Exit Criteria
- at least three complete empires can be published
- each empire can attach one or more build variants
- empire theme tokens can change UI accents cleanly

## Phase 4 — Build System
### Goals
- add build records
- link builds to canonical entities
- add scoring model
- add synergy and anti-synergy notes
- add patch scoping to builds

### Deliverables
- `/builds`
- `/builds/[slug]`
- build score panels
- build notes
- patch-tagged build pages

### Exit Criteria
- builds reference entities by ID/slug, not free text only
- scores can be stored and rendered consistently
- build pages remain separate from canonical codex records

## Phase 5 — Compare and Search
### Goals
- compare multiple builds
- search codex and builds separately
- persist filters
- improve route-level data loading

### Deliverables
- `/compare`
- query filter model
- search API
- search UI
- saveable presets later

### Exit Criteria
- compare up to three builds
- build and codex results do not mix unpredictably
- filter state survives navigation

## Phase 6 — Admin Ingest and Review
### Goals
- ingest safely
- surface parse failures
- support manual approval
- publish snapshots deliberately

### Deliverables
- `/admin/ingest`
- `/admin/review`
- parse run records
- review queue
- publish workflow

### Exit Criteria
- low-confidence parse results cannot silently ship
- changed entities can be reviewed before publication
- source snapshot lineage is preserved

## Phase 7 — Public Release Hardening
### Goals
- improve performance
- secure admin routes
- improve SEO and metadata
- optimize image delivery
- add rate limiting and operational visibility

### Exit Criteria
- deployable to Cloudflare Pages + Workers
- mobile performance remains acceptable
- ingest/auth boundaries are enforced

## Phase 8 — Community Layer
### Goals
- user accounts
- saved builds
- public submissions
- revision history
- moderation controls

### Exit Criteria
- private and public records are separate
- moderation exists for submissions
- revision history is preserved per build

## Recommended Immediate Sequence
1. wire web pages to live API fetches
2. add ethics vertical slice
3. add authorities vertical slice
4. replace trait parser stub with real HTML parsing
5. add source snapshot persistence flow
6. add basic admin review queue schema

## Engineering Principle
The project should evolve through vertical slices, not broad speculative scaffolding.

Each slice should prove:
- source acquisition
- parsing
- normalization
- storage
- API read
- UI rendering
- reuse in later product areas


## Latest Progress
- live web route loading added for traits and ethics
- ethics vertical slice added with D1 seed migration, API routes, and codex pages


## Latest Progress
- route-level `load` conversion added for codex detail/list pages
- authorities vertical slice added with D1 seed migration, API routes, and codex pages


## Latest Progress
- heuristic trait parser added for real wiki HTML parsing
- source snapshot persistence added to the PowerShell ingest pipeline
- parse/review migration added for future approval workflow integration


## Latest Progress
- D1 write integration added for parsed trait records
- source snapshot rows now persist into D1 through generated upsert SQL
- Wrangler execution path added for ingest-driven D1 writes


## Latest Progress
- ethics D1 write integration added through the same normalized SQL pipeline used for traits
- ingest now creates `parse_runs` rows
- low-confidence ingest items can now create both `parse_issues` and `review_queue` rows automatically


## Latest Progress
- authority ingest parsing added to the shared PowerShell ingest pipeline
- starter admin review UI added on top of parse runs, parse issues, and review queue
- admin review read endpoints added to the Worker API


## Latest Progress
- approve / reject / resolve actions added for review queue items and parse issues
- `review_actions` table added for persisted moderation history
- admin review UI is now interactive rather than read-only
