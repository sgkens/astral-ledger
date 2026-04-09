-- Backfill actor metadata on older review_actions rows where possible.
-- Strategy:
-- 1. If actor columns are null and a matching parse_issue exists, copy actor-ish context from the latest
--    available admin identity fallback is not possible at DB level, so use deterministic placeholders.
-- 2. If still null, mark as legacy_unknown for traceability rather than leaving blank.

UPDATE review_actions
SET actor_source = COALESCE(actor_source, 'legacy_unknown')
WHERE actor_source IS NULL OR TRIM(actor_source) = '';

UPDATE review_actions
SET actor_email = COALESCE(actor_email, 'unknown-reviewer@local'),
    actor_subject = COALESCE(actor_subject, 'legacy-review-action')
WHERE actor_email IS NULL OR actor_subject IS NULL;
