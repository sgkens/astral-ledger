# Admin Auth

## Current baseline
Admin endpoints under `/api/admin/*` are protected.

The current implementation allows access if either:
- the request includes `Cf-Access-Jwt-Assertion`, intended for Cloudflare Access-protected deployments
- the request includes a valid configured admin key in `Authorization: Bearer ...` or `x-admin-key`

## Environment variables
- `ADMIN_REQUIRE_ACCESS_HEADER`
- `ADMIN_API_KEY`

## Recommended production setup
1. Put the admin surface behind Cloudflare Access
2. Require the `Cf-Access-Jwt-Assertion` header
3. Upgrade the Worker to validate the JWT against your Access team certs and expected audience
4. Keep `ADMIN_API_KEY` for local development only

## Why this matters
Cloudflare's documentation recommends validating the `Cf-Access-Jwt-Assertion` header for Access-protected applications and Workers.
