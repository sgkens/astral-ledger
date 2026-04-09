import type { CodexDetail, CodexListItem } from "@astral-ledger/contracts";
import {
  fallbackTraitDetails,
  fallbackTraitsList,
  fallbackEthicDetails,
  fallbackEthicsList,
  fallbackAuthorityDetails,
  fallbackAuthoritiesList
} from "../../../packages/db/src/queries";
import {
  getTraitDetailFromD1,
  getTraitsListFromD1,
  getEthicDetailFromD1,
  getEthicsListFromD1,
  getAuthorityDetailFromD1,
  getAuthoritiesListFromD1
} from "../../../packages/db/src/d1";

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  APP_NAME: string;
  ADMIN_REQUIRE_ACCESS_HEADER?: string;
  ADMIN_API_KEY?: string;
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data, null, 2), { ...init, headers });
}

function unauthorized(message = "Unauthorized") {
  return json({ ok: false, error: message }, { status: 401 });
}

function isAdminAuthorized(request: Request, env: Env): boolean {
  const requireAccessHeader = (env.ADMIN_REQUIRE_ACCESS_HEADER ?? "true").toLowerCase() === "true";
  const accessJwt = request.headers.get("cf-access-jwt-assertion");
  const authHeader = request.headers.get("authorization");
  const xAdminKey = request.headers.get("x-admin-key");
  const expectedKey = env.ADMIN_API_KEY?.trim();

  const hasAccessHeader = !!accessJwt;
  const bearerOk =
    !!expectedKey &&
    !!authHeader &&
    authHeader.startsWith("Bearer ") &&
    authHeader.slice("Bearer ".length).trim() === expectedKey;
  const headerKeyOk = !!expectedKey && !!xAdminKey && xAdminKey.trim() === expectedKey;

  if (requireAccessHeader) {
    return hasAccessHeader || bearerOk || headerKeyOk;
  }

  if (expectedKey) {
    return bearerOk || headerKeyOk || hasAccessHeader;
  }

  return hasAccessHeader;
}

async function loadList<T extends CodexListItem>(db: D1Database | undefined, fromDb: () => Promise<T[]>, fallback: T[]): Promise<T[]> {
  if (!db) return fallback;
  try {
    const items = await fromDb();
    return items.length ? items : fallback;
  } catch {
    return fallback;
  }
}

async function loadDetail<T extends CodexDetail>(db: D1Database | undefined, fromDb: () => Promise<T | null>, fallback: T | null): Promise<T | null> {
  if (!db) return fallback;
  try {
    const detail = await fromDb();
    return detail ?? fallback;
  } catch {
    return fallback;
  }
}

async function adminParseRuns(db?: D1Database) {
  if (!db) return [];
  try {
    const result = await db.prepare(`
      SELECT id, run_kind, status, started_at, finished_at, summary
      FROM parse_runs
      ORDER BY id DESC
      LIMIT 50
    `).all();
    return result.results ?? [];
  } catch {
    return [];
  }
}

async function adminParseIssues(db?: D1Database) {
  if (!db) return [];
  try {
    const result = await db.prepare(`
      SELECT
        i.id,
        i.entity_type,
        i.page_url,
        i.severity,
        i.code,
        i.message,
        i.raw_context,
        i.created_at,
        CASE
          WHEN i.entity_type IS NOT NULL AND i.raw_context IS NOT NULL
          THEN '/codex/' || i.entity_type || 's/' || i.raw_context
          ELSE NULL
        END AS codex_href
      FROM parse_issues i
      ORDER BY i.id DESC
      LIMIT 100
    `).all();
    return result.results ?? [];
  } catch {
    return [];
  }
}

async function adminReviewQueue(db?: D1Database) {
  if (!db) return [];
  try {
    const result = await db.prepare(`
      SELECT
        q.id,
        q.entity_id,
        q.snapshot_id,
        q.issue_id,
        q.review_kind,
        q.status,
        q.created_at,
        q.resolved_at,
        e.slug AS entity_slug,
        e.entity_type AS entity_type,
        e.name AS entity_name,
        CASE
          WHEN e.id IS NOT NULL
          THEN '/codex/' || e.entity_type || 's/' || e.slug
          ELSE NULL
        END AS codex_href
      FROM review_queue q
      LEFT JOIN entities e ON e.id = q.entity_id
      ORDER BY q.id DESC
      LIMIT 100
    `).all();
    return result.results ?? [];
  } catch {
    return [];
  }
}

async function adminReviewActions(db?: D1Database) {
  if (!db) return [];
  try {
    const result = await db.prepare(`
      SELECT id, review_queue_id, parse_issue_id, action_kind, note, created_at
      FROM review_actions
      ORDER BY id DESC
      LIMIT 200
    `).all();
    return result.results ?? [];
  } catch {
    return [];
  }
}

async function createReviewAction(
  db: D1Database | undefined,
  targetType: "queue" | "issue",
  id: number,
  actionKind: "approve" | "reject" | "resolve",
  note?: string
) {
  if (!db) return { ok: false, error: "Database unavailable" };

  try {
    if (targetType === "queue") {
      const newStatus = actionKind === "approve" ? "approved" : actionKind === "reject" ? "rejected" : "resolved";
      await db.prepare(`
        UPDATE review_queue
        SET status = ?, resolved_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(newStatus, id).run();

      await db.prepare(`
        INSERT INTO review_actions (review_queue_id, parse_issue_id, action_kind, note)
        VALUES (?, NULL, ?, ?)
      `).bind(id, actionKind, note ?? null).run();

      return { ok: true, targetType, id, actionKind, status: newStatus, note: note ?? null };
    }

    if (targetType === "issue") {
      const suffix = note ? ` | ${note}` : "";
      await db.prepare(`
        UPDATE parse_issues
        SET message = message || ?
        WHERE id = ?
      `).bind(` [${actionKind}${suffix}]`, id).run();

      await db.prepare(`
        INSERT INTO review_actions (review_queue_id, parse_issue_id, action_kind, note)
        VALUES (NULL, ?, ?, ?)
      `).bind(id, actionKind, note ?? null).run();

      return { ok: true, targetType, id, actionKind, note: note ?? null };
    }

    return { ok: false, error: "Unsupported target type" };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown database error" };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");
    const isAdminRoute = path.startsWith("/api/admin/");

    if (isAdminRoute && !isAdminAuthorized(request, env)) {
      return unauthorized("Admin access denied");
    }

    if (path === "/api/health") {
      return json({ ok: true, service: env.APP_NAME || "Astral Ledger" });
    }

    if (request.method === "POST" && path === "/api/admin/review/action") {
      const body = await request.json() as {
        targetType: "queue" | "issue";
        id: number;
        actionKind: "approve" | "reject" | "resolve";
        note?: string;
      };

      const result = await createReviewAction(env.DB, body.targetType, body.id, body.actionKind, body.note);
      return json(result, { status: result.ok ? 200 : 400 });
    }

    if (path === "/api/codex/traits") {
      return json({
        entityType: "trait",
        items: await loadList(env.DB, () => getTraitsListFromD1(env.DB), fallbackTraitsList),
        generatedAt: new Date().toISOString()
      });
    }

    if (path === "/api/codex/ethics") {
      return json({
        entityType: "ethic",
        items: await loadList(env.DB, () => getEthicsListFromD1(env.DB), fallbackEthicsList),
        generatedAt: new Date().toISOString()
      });
    }

    if (path === "/api/codex/authorities") {
      return json({
        entityType: "authority",
        items: await loadList(env.DB, () => getAuthoritiesListFromD1(env.DB), fallbackAuthoritiesList),
        generatedAt: new Date().toISOString()
      });
    }

    if (path === "/api/admin/review/parse-runs") {
      return json({ items: await adminParseRuns(env.DB) });
    }

    if (path === "/api/admin/review/parse-issues") {
      return json({ items: await adminParseIssues(env.DB) });
    }

    if (path === "/api/admin/review/review-queue") {
      return json({ items: await adminReviewQueue(env.DB) });
    }

    if (path === "/api/admin/review/actions") {
      return json({ items: await adminReviewActions(env.DB) });
    }

    const traitMatch = path.match(/^\/api\/codex\/traits\/([a-z0-9-]+)$/);
    if (traitMatch) {
      const detail = await loadDetail(env.DB, () => getTraitDetailFromD1(env.DB, traitMatch[1]), fallbackTraitDetails[traitMatch[1]] ?? null);
      if (!detail) return json({ error: "Not found" }, { status: 404 });
      return json(detail);
    }

    const ethicMatch = path.match(/^\/api\/codex\/ethics\/([a-z0-9-]+)$/);
    if (ethicMatch) {
      const detail = await loadDetail(env.DB, () => getEthicDetailFromD1(env.DB, ethicMatch[1]), fallbackEthicDetails[ethicMatch[1]] ?? null);
      if (!detail) return json({ error: "Not found" }, { status: 404 });
      return json(detail);
    }

    const authorityMatch = path.match(/^\/api\/codex\/authorities\/([a-z0-9-]+)$/);
    if (authorityMatch) {
      const detail = await loadDetail(env.DB, () => getAuthorityDetailFromD1(env.DB, authorityMatch[1]), fallbackAuthorityDetails[authorityMatch[1]] ?? null);
      if (!detail) return json({ error: "Not found" }, { status: 404 });
      return json(detail);
    }

    return json({ error: "Not found" }, { status: 404 });
  }
};
