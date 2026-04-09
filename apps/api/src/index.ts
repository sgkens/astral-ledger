import type { CodexDetail, CodexListItem } from "@astral-ledger/contracts";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
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
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
  ADMIN_READ_ROLES?: string;
  ADMIN_WRITE_ROLES?: string;
}

type AdminPermission = "read" | "write";

type AccessIdentity = {
  ok: boolean;
  reason?: string;
  email?: string;
  subject?: string;
  roles: string[];
  groups: string[];
  source: "access_jwt" | "admin_api_key" | "none";
  payload?: JWTPayload;
};

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data, null, 2), { ...init, headers });
}

function unauthorized(message = "Unauthorized") {
  return json({ ok: false, error: message }, { status: 401 });
}

function forbidden(message = "Forbidden") {
  return json({ ok: false, error: message }, { status: 403 });
}

function parseCsv(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function stringArrayFromUnknown(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function extractRolesAndGroups(payload: JWTPayload): { roles: string[]; groups: string[] } {
  const directRoles = stringArrayFromUnknown(payload.roles);
  const directGroups = stringArrayFromUnknown(payload.groups);

  const customRoleCandidates = [
    (payload as Record<string, unknown>)["custom:roles"],
    (payload as Record<string, unknown>)["https://astral-ledger.dev/roles"],
    (payload as Record<string, unknown>)["https://astral-ledger.dev/groups"]
  ].flatMap(stringArrayFromUnknown);

  const roles = Array.from(new Set([...directRoles, ...customRoleCandidates])).map((v) => v.toLowerCase());
  const groups = Array.from(new Set([...directGroups])).map((v) => v.toLowerCase());

  return { roles, groups };
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(teamDomain: string) {
  const trimmed = teamDomain.replace(/\/$/, "");
  const jwksUrl = new URL(`${trimmed}/cdn-cgi/access/certs`);
  const key = jwksUrl.toString();
  const existing = jwksCache.get(key);
  if (existing) return existing;
  const jwks = createRemoteJWKSet(jwksUrl);
  jwksCache.set(key, jwks);
  return jwks;
}

async function validateAccessJwt(request: Request, env: Env): Promise<AccessIdentity> {
  const jwt = request.headers.get("cf-access-jwt-assertion");
  if (!jwt) {
    return { ok: false, reason: "Missing Cf-Access-Jwt-Assertion header", roles: [], groups: [], source: "none" };
  }

  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN?.trim();
  const aud = env.CF_ACCESS_AUD?.trim();

  if (!teamDomain || !aud) {
    return { ok: false, reason: "Cloudflare Access JWT config is incomplete", roles: [], groups: [], source: "none" };
  }

  try {
    const jwks = getJwks(teamDomain);
    const { payload } = await jwtVerify(jwt, jwks, {
      audience: aud
    });

    const { roles, groups } = extractRolesAndGroups(payload);

    return {
      ok: true,
      email: typeof payload.email === "string" ? payload.email : undefined,
      subject: typeof payload.sub === "string" ? payload.sub : undefined,
      roles,
      groups,
      source: "access_jwt",
      payload
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "JWT validation failed",
      roles: [],
      groups: [],
      source: "none"
    };
  }
}

async function getAdminIdentity(request: Request, env: Env): Promise<AccessIdentity> {
  const expectedKey = env.ADMIN_API_KEY?.trim();
  const authHeader = request.headers.get("authorization");
  const xAdminKey = request.headers.get("x-admin-key");

  const bearerOk =
    !!expectedKey &&
    !!authHeader &&
    authHeader.startsWith("Bearer ") &&
    authHeader.slice("Bearer ".length).trim() === expectedKey;
  const headerKeyOk = !!expectedKey && !!xAdminKey && xAdminKey.trim() === expectedKey;

  if (bearerOk || headerKeyOk) {
    return {
      ok: true,
      email: "local-admin-key",
      subject: "local-admin-key",
      roles: ["admin"],
      groups: ["admin"],
      source: "admin_api_key"
    };
  }

  return await validateAccessJwt(request, env);
}

function hasPermission(identity: AccessIdentity, env: Env, permission: AdminPermission): boolean {
  if (!identity.ok) return false;
  if (identity.source === "admin_api_key") return true;

  const required = permission === "read"
    ? parseCsv(env.ADMIN_READ_ROLES ?? "admin,reviewer")
    : parseCsv(env.ADMIN_WRITE_ROLES ?? "admin");

  const principals = new Set([
    ...identity.roles.map((v) => v.toLowerCase()),
    ...identity.groups.map((v) => v.toLowerCase())
  ]);

  return required.some((role) => principals.has(role.toLowerCase()));
}

async function requireAdmin(request: Request, env: Env, permission: AdminPermission): Promise<Response | null> {
  const requireAccessHeader = (env.ADMIN_REQUIRE_ACCESS_HEADER ?? "true").toLowerCase() === "true";
  const identity = await getAdminIdentity(request, env);

  if (!identity.ok) {
    return unauthorized(requireAccessHeader ? (identity.reason ?? "Admin access denied") : "Admin access denied");
  }

  if (!hasPermission(identity, env, permission)) {
    return forbidden(`Missing required admin ${permission} permission`);
  }

  return null;
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
    const requiredPermission: AdminPermission =
      request.method === "GET" ? "read" : "write";

    if (isAdminRoute) {
      const failure = await requireAdmin(request, env, requiredPermission);
      if (failure) return failure;
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
