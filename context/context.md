# Astral Ledger Context

## Current State

Astral Ledger currently exists as a production-ready baseline scaffold with a working repository structure and an initial traits vertical slice.

The codebase currently includes:

- workspace root and package boundaries
- Cloudflare Worker API scaffold
- D1 schema baseline
- seed migration for one trait
- D1-first trait query helpers
- fallback in-memory trait data
- SvelteKit-style frontend scaffold
- trait codex list/detail pages
- tooltip card base component
- PowerShell ingest scaffold for future wiki parsing
- roadmap and setup documents

This means the project is no longer at the idea stage. It is at the **foundation implementation stage**.

## Architecture Summary

The platform is split into five major layers:

1. source ingestion
2. canonical persistence
3. API read models
4. frontend presentation
5. editorial build system

These layers must remain separate.

### 1. Source Ingestion Layer
Purpose:
- fetch source pages
- capture raw HTML snapshots
- parse structured entities
- normalize fields into canonical JSON
- identify image candidates
- assign confidence and warnings

Current status:
- scaffolded in PowerShell
- still uses seeded parser behavior
- not yet performing true entity extraction

Planned implementation:
- one parser per entity family
- source hashing for change detection
- raw snapshot storage in R2 or local cache
- parse run records
- review queue integration

### 2. Canonical Persistence Layer
Purpose:
- store factual gameplay entities
- preserve source attribution
- preserve patch-aware data
- separate effects and requirements into structured rows

Current status:
- D1 schema baseline exists
- tables include sources, snapshots, images, entities, effects, requirements
- trait seed migration exists

Planned implementation:
- add tags
- add patch history table
- add parse/review tables
- later add editorial tables for empires and builds

### 3. API Read Model Layer
Purpose:
- expose frontend-friendly JSON
- hide raw table complexity
- support entity list/detail routes
- maintain stable contracts for web components

Current status:
- Worker API exposes:
  - `/api/health`
  - `/api/codex/traits`
  - `/api/codex/traits/:slug`
- API attempts D1 reads first
- API falls back to seeded data if needed

Planned implementation:
- add ethics and authorities endpoints
- add build and empire read models
- add search endpoint
- add patch endpoint
- add admin ingest/review endpoints

### 4. Frontend Presentation Layer
Purpose:
- render codex data
- render empire pages
- render build pages
- provide compare and builder surfaces
- apply theme tokens by play style and empire

Current status:
- home page scaffold exists
- traits list/detail pages exist
- tooltip card base exists
- theme tokens and app styling exist

Planned implementation:
- live route data loading from API
- entity list/detail shared components
- empire cards and build cards
- compare matrix
- builder screen
- command palette and search UI
- mobile-first enhancement of current seeded pages

### 5. Editorial Build Layer
Purpose:
- publish strategy guides and curated builds
- score builds
- attach synergy notes
- attach roleplay identity
- keep editorial judgments separate from factual entity rows

Current status:
- not yet implemented in persistence
- modeled in planning docs only

Planned implementation:
- empires
- builds
- build_entity_links
- build_scores
- build_notes
- playstyles
- patch-scoped build versions

## Current Repository Shape

```text
astral-ledger/
  apps/
    api/
    web/
  packages/
    contracts/
    db/
  tools/
    powershell/
  data/
    seed/
  docs/
  context/
```

This repository shape is considered stable.

## Current Data Strategy

### Primary Source
The Stellaris wiki is the current MVP factual source.

Why:
- structured enough to parse
- easier to attribute
- easier to iterate on
- lower complexity than raw game-file parsing

### Secondary Source
Patch notes should later enrich patch history and validation.

### Tertiary Source
Direct game-file parsing may later be added as:
- validation
- enrichment
- data completeness check

It is not on the critical MVP path.

## Current Runtime Strategy

### Frontend
- SvelteKit-style app scaffold
- CSS variable based theme system
- mobile-first layout
- codex-first UI

### API
- Cloudflare Worker runtime
- JSON responses
- D1 database binding
- future R2 image integration

### Database
- Cloudflare D1 first
- SQLite-shaped schema
- later Turso/libSQL migration possible if needed

### Object Storage
- R2 planned for:
  - source snapshots
  - cached icons/images
  - derivative thumbnails

### CLI / Ingest
- PowerShell module
- local execution first
- CI execution later
- deterministic parser output required

## Current Constraints

### Constraint 1 — Avoid Architecture Drift
Do not collapse:
- canonical entity records
- editorial build advice
- UI-specific display models

These are separate concerns.

### Constraint 2 — Avoid Overbuilding Early
Do not implement:
- simulation engine
- community layer
- accounts
- advanced collaboration
before the codex pipeline is proven.

### Constraint 3 — Respect Patch Volatility
Anything presented as factual must be:
- sourced
- patch-scoped where relevant
- easy to re-ingest

### Constraint 4 — UI Must Support Multiple Empire Styles
The UI is not a single-theme application.

It must support:
- trade/science
- militarist
- psionic
- machine
- hive
- megacorp luxury
and future theme families without component rewrites.

## Planned Future Architecture

## A. Canonical Entity Family Expansion
Each entity family gets:
- parser
- normalized JSON contract
- D1 persistence mapping
- list endpoint
- detail endpoint
- codex UI pages
- tooltip support

The recommended order remains:
1. traits
2. ethics
3. authorities
4. civics
5. origins
6. traditions
7. ascension perks
8. technologies

## B. Patch-Aware Storage Expansion
Future tables or fields should support:
- introduced patch
- changed patch
- removed patch
- patch diff summaries
- source lineage

This is required before patch explorer features become trustworthy.

## C. Editorial System Expansion
The future editorial system will contain:

### Empires
Roleplay-oriented identity containers with:
- name
- summary
- fantasy
- theme tokens
- suggested authority/origin
- linked build variants

### Builds
Mechanically focused build records with:
- patch version
- entity selections
- opening/mid/late game plan
- scores
- notes
- warnings
- DLC scope

### Playstyles
Shared classification layer:
- trade
- science
- tall
- wide
- rush
- diplomacy
- machine
- hive
- psionic
- challenge
- narrative

## D. Search Architecture
Search should eventually separate:
- codex results
- build results
- empire results

The system should not mix factual entities and editorial guides in one undifferentiated result stream.

## E. Review and Publish Workflow
Once real parsing is live, the architecture should include:
- parse runs
- parse issues
- review queue
- approval workflow
- snapshot publish action
- rollback-friendly source storage

## F. Image Pipeline
Planned image flow:
1. source image discovered
2. source metadata persisted
3. original asset cached
4. small derivative thumb produced
5. frontend receives stable image references

## Recommended Next Build Actions

### Immediate
1. create live data loading in web routes
2. add ethics migrations, queries, endpoints, and pages
3. add authorities migrations, queries, endpoints, and pages
4. upgrade trait parser from seeded output to actual parsing
5. add source snapshot persistence

### Near-Term
1. add patch history table
2. add tags table
3. add build/empires persistence
4. add compare page
5. add search route
6. add admin ingest/review pages

### Later
1. community submissions
2. accounts
3. moderation
4. Turso migration, only if operationally justified

## Definition of Good Architecture
The architecture is good if:
- one entity family can move from source to UI cleanly
- future families can be added without redesign
- factual and editorial records never blur together
- patch changes can be absorbed without rewrite
- theme expansion does not require component duplication
- ingestion failures can be inspected instead of silently ignored

## Final Direction
Astral Ledger should continue as a **codex-first, builder-second, community-later** platform.

That order gives the project:
- better correctness
- better maintainability
- lower parser risk
- cleaner product expansion


## Latest Progress Update
The project now supports live web route loading for traits and ethics, and ethics has been added as the second canonical entity family in the vertical-slice pipeline.


## Latest Progress Update
Route-level load conversion has been added for codex pages, and authorities has been added as the third canonical entity family in the vertical-slice pipeline.
