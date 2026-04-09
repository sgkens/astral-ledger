# Admin Auth

## Current implementation
Admin endpoints under `/api/admin/*` are protected with two layers:

1. Cloudflare Access JWT validation
2. role-aware permission checks

## JWT validation
The Worker now verifies the `Cf-Access-Jwt-Assertion` token using:
- the Access JWKs endpoint at `<team-domain>/cdn-cgi/access/certs`
- the configured Access application audience (`CF_ACCESS_AUD`)

This follows Cloudflare's documented validation pattern for Access-protected Workers.

## Role-aware permissions
After JWT validation, the Worker derives roles/groups from:
- `roles`
- `groups`
- optional custom claims such as:
  - `custom:roles`
  - `https://astral-ledger.dev/roles`
  - `https://astral-ledger.dev/groups`

Read access checks:
- `ADMIN_READ_ROLES`

Write access checks:
- `ADMIN_WRITE_ROLES`

## Environment variables
- `ADMIN_REQUIRE_ACCESS_HEADER`
- `ADMIN_API_KEY`
- `CF_ACCESS_TEAM_DOMAIN`
- `CF_ACCESS_AUD`
- `ADMIN_READ_ROLES`
- `ADMIN_WRITE_ROLES`

## Development fallback
`ADMIN_API_KEY` is still supported for local development and controlled fallback access.
In production, prefer Cloudflare Access and JWT validation.
