import type { CodexDetail, CodexListItem } from "@astral-ledger/contracts";
import { fallbackTraitDetails, fallbackTraitsList } from "../../../packages/db/src/queries";
import { getTraitDetailFromD1, getTraitsListFromD1 } from "../../../packages/db/src/d1";

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

async function loadTraitsList(db?: D1Database): Promise<CodexListItem[]> {
  if (!db) return fallbackTraitsList;
  try {
    const items = await getTraitsListFromD1(db);
    return items.length ? items : fallbackTraitsList;
  } catch {
    return fallbackTraitsList;
  }
}

async function loadTraitDetail(db: D1Database | undefined, slug: string): Promise<CodexDetail | null> {
  if (!db) return fallbackTraitDetails[slug] ?? null;
  try {
    const detail = await getTraitDetailFromD1(db, slug);
    return detail ?? fallbackTraitDetails[slug] ?? null;
  } catch {
    return fallbackTraitDetails[slug] ?? null;
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
        items: await loadTraitsList(env.DB),
        generatedAt: new Date().toISOString()
      });
    }

    const traitMatch = path.match(/^\/api\/codex\/traits\/([a-z0-9-]+)$/);
    if (traitMatch) {
      const detail = await loadTraitDetail(env.DB, traitMatch[1]);
      if (!detail) return json({ error: "Not found" }, { status: 404 });
      return json(detail);
    }

    return json({ error: "Not found" }, { status: 404 });
  }
};
