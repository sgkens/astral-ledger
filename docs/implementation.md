# Implementation Notes

## Current state
This baseline now includes:
- initial D1 schema
- trait, ethic, and authority seed migrations
- D1 read helpers for traits, ethics, and authorities
- Worker trait, ethic, and authority endpoints
- route-level `load` conversion for traits and ethics
- route-level `load` implementation for authorities
- seed fallback behavior

## Next step
Replace the seeded parser with real trait parsing from the wiki and add source snapshot persistence.
