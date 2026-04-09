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
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data, null, 2), { ...init, headers });
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");

    if (path === "/api/health") {
      return json({ ok: true, service: env.APP_NAME || "Astral Ledger" });
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
