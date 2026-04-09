import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

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
  displayName?: string;
  avatarUrl?: string;
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
  return (value ?? "").split(",").map(v => v.trim()).filter(Boolean);
}

function stringArrayFromUnknown(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function stringFromClaims(payload: JWTPayload, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = (payload as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function extractRolesAndGroups(payload: JWTPayload): { roles: string[]; groups: string[] } {
  const directRoles = stringArrayFromUnknown(payload.roles);
  const directGroups = stringArrayFromUnknown(payload.groups);
  const customRoleCandidates = [
    (payload as Record<string, unknown>)["custom:roles"],
    (payload as Record<string, unknown>)["https://astral-ledger.dev/roles"],
    (payload as Record<string, unknown>)["https://astral-ledger.dev/groups"]
  ].flatMap(stringArrayFromUnknown);

  return {
    roles: Array.from(new Set([...directRoles, ...customRoleCandidates])).map(v => v.toLowerCase()),
    groups: Array.from(new Set([...directGroups])).map(v => v.toLowerCase())
  };
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(teamDomain: string) {
  const trimmed = teamDomain.replace(/\/$/, "");
  const url = new URL(`${trimmed}/cdn-cgi/access/certs`);
  const key = url.toString();
  if (jwksCache.has(key)) return jwksCache.get(key)!;
  const jwks = createRemoteJWKSet(url);
  jwksCache.set(key, jwks);
  return jwks;
}

async function validateAccessJwt(request: Request, env: Env): Promise<AccessIdentity> {
  const jwt = request.headers.get("cf-access-jwt-assertion");
  if (!jwt) return { ok: false, reason: "Missing Cf-Access-Jwt-Assertion header", roles: [], groups: [], source: "none" };

  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN?.trim();
  const aud = env.CF_ACCESS_AUD?.trim();
  if (!teamDomain || !aud) {
    return { ok: false, reason: "Cloudflare Access JWT config is incomplete", roles: [], groups: [], source: "none" };
  }

  try {
    const jwks = getJwks(teamDomain);
    const { payload } = await jwtVerify(jwt, jwks, { audience: aud });
    const { roles, groups } = extractRolesAndGroups(payload);

    const email = typeof payload.email === "string" ? payload.email : undefined;
    const subject = typeof payload.sub === "string" ? payload.sub : undefined;
    const displayName =
      stringFromClaims(payload, ["name", "given_name", "nickname", "preferred_username", "custom:name"]) ??
      email ??
      subject;
    const avatarUrl = stringFromClaims(payload, ["picture", "avatar", "custom:avatar", "https://astral-ledger.dev/avatar"]);

    return {
      ok: true,
      email,
      subject,
      displayName,
      avatarUrl,
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
  const bearerOk = !!expectedKey && !!authHeader && authHeader.startsWith("Bearer ") && authHeader.slice(7).trim() === expectedKey;
  const headerKeyOk = !!expectedKey && !!xAdminKey && xAdminKey.trim() === expectedKey;

  if (bearerOk || headerKeyOk) {
    return {
      ok: true,
      email: "local-admin-key",
      subject: "local-admin-key",
      displayName: "Local Admin Key",
      avatarUrl: undefined,
      roles: ["admin"],
      groups: ["admin"],
      source: "admin_api_key"
    };
  }

  return await validateAccessJwt(request, env);
}

function requiredRoles(env: Env, permission: AdminPermission): string[] {
  return permission === "read" ? parseCsv(env.ADMIN_READ_ROLES ?? "admin,reviewer") : parseCsv(env.ADMIN_WRITE_ROLES ?? "admin");
}

function principalsFromIdentity(identity: AccessIdentity): string[] {
  return Array.from(new Set([...identity.roles.map(v => v.toLowerCase()), ...identity.groups.map(v => v.toLowerCase())]));
}

function hasPermission(identity: AccessIdentity, env: Env, permission: AdminPermission): boolean {
  if (!identity.ok) return false;
  if (identity.source === "admin_api_key") return true;
  const required = requiredRoles(env, permission);
  const principals = new Set(principalsFromIdentity(identity));
  return required.some(role => principals.has(role.toLowerCase()));
}

function permissionReason(identity: AccessIdentity, env: Env, permission: AdminPermission): string {
  if (!identity.ok) return identity.reason ?? "Identity validation failed";
  if (identity.source === "admin_api_key") return "Allowed via ADMIN_API_KEY development fallback";
  const required = requiredRoles(env, permission);
  const principals = principalsFromIdentity(identity);
  if (hasPermission(identity, env, permission)) return `Allowed because matched required ${permission} role/group: ${required.join(", ")}`;
  if (!principals.length) return `Blocked because no roles/groups were present. Required ${permission} roles: ${required.join(", ")}`;
  return `Blocked because current roles/groups [${principals.join(", ")}] did not match required ${permission} roles [${required.join(", ")}]`;
}

async function requireAdmin(request: Request, env: Env, permission: AdminPermission): Promise<Response | null> {
  const identity = await getAdminIdentity(request, env);
  if (!identity.ok) return unauthorized(identity.reason ?? "Admin access denied");
  if (!hasPermission(identity, env, permission)) return forbidden(permissionReason(identity, env, permission));
  return null;
}

function adminIdentityPayload(identity: AccessIdentity, env: Env) {
  return {
    ok: identity.ok,
    email: identity.email ?? null,
    subject: identity.subject ?? null,
    displayName: identity.displayName ?? null,
    avatarUrl: identity.avatarUrl ?? null,
    source: identity.source,
    roles: identity.roles,
    groups: identity.groups,
    permissions: {
      read: { allowed: hasPermission(identity, env, "read"), requiredRoles: requiredRoles(env, "read"), reason: permissionReason(identity, env, "read") },
      write: { allowed: hasPermission(identity, env, "write"), requiredRoles: requiredRoles(env, "write"), reason: permissionReason(identity, env, "write") }
    }
  };
}

async function adminReviewActions(db?: D1Database) {
  if (!db) return [];
  try {
    const result = await db.prepare(`
      SELECT
        id,
        review_queue_id,
        parse_issue_id,
        action_kind,
        note,
        actor_email,
        actor_subject,
        actor_source,
        created_at
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
  note: string | undefined,
  actor: AccessIdentity
) {
  if (!db) return { ok: false, error: "Database unavailable" };

  const actorEmail = actor.email ?? null;
  const actorSubject = actor.subject ?? null;
  const actorSource = actor.source;
  const actorDisplayName = actor.displayName ?? actor.email ?? actor.subject ?? "Unknown reviewer";

  try {
    await db.prepare(`
      INSERT INTO review_actions (
        review_queue_id, parse_issue_id, action_kind, note, actor_email, actor_subject, actor_source
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      targetType === "queue" ? id : null,
      targetType === "issue" ? id : null,
      actionKind,
      note ?? null,
      actorEmail,
      actorSubject,
      actorSource
    ).run();

    return {
      ok: true,
      targetType,
      id,
      actionKind,
      note: note ?? null,
      actor_email: actorEmail,
      actor_subject: actorSubject,
      actor_source: actorSource,
      actor_display_name: actorDisplayName
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown database error" };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");
    const isAdminRoute = path.startsWith("/api/admin/");
    const requiredPermission: AdminPermission = request.method === "GET" ? "read" : "write";

    if (isAdminRoute) {
      const failure = await requireAdmin(request, env, requiredPermission);
      if (failure) return failure;
    }

    if (path === "/api/health") {
      return json({ ok: true, service: env.APP_NAME || "Astral Ledger" });
    }

    if (path === "/api/admin/identity") {
      const identity = await getAdminIdentity(request, env);
      if (!identity.ok) return unauthorized(identity.reason ?? "Admin access denied");
      return json(adminIdentityPayload(identity, env));
    }

    if (path === "/api/admin/review/actions") {
      return json({ items: await adminReviewActions(env.DB) });
    }

    if (request.method === "POST" && path === "/api/admin/review/action") {
      const identity = await getAdminIdentity(request, env);
      if (!identity.ok) return unauthorized(identity.reason ?? "Admin access denied");

      const body = await request.json() as { targetType: "queue" | "issue"; id: number; actionKind: "approve" | "reject" | "resolve"; note?: string; };
      const result = await createReviewAction(env.DB, body.targetType, body.id, body.actionKind, body.note, identity);
      return json(result, { status: result.ok ? 200 : 400 });
    }

    if (path === "/api/admin/review/parse-runs") return json({ items: [] });
    if (path === "/api/admin/review/parse-issues") {
      return json({ items: [{ id: 1, entity_type: "trait", page_url: "https://stellaris.paradoxwikis.com/Traits", severity: "warning", code: "low_confidence_parse", message: "Example parse issue", raw_context: "intelligent", created_at: new Date().toISOString(), codex_href: "/codex/traits/intelligent" }] });
    }
    if (path === "/api/admin/review/review-queue") {
      return json({ items: [{ id: 1, entity_id: 1, snapshot_id: 1, issue_id: 1, review_kind: "parse_diff", status: "open", created_at: new Date().toISOString(), resolved_at: null, entity_slug: "intelligent", entity_type: "trait", entity_name: "Intelligent", codex_href: "/codex/traits/intelligent" }] });
    }

    return json({ error: "Not found" }, { status: 404 });
  }
};
