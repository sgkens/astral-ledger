import type { CodexDetail, CodexListItem } from "@astral-ledger/contracts";
import { getTraitDetail, getTraitsList } from "../../../packages/db/src/queries";

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");

    if (path === "/api/health") {
      return json({ ok: true, service: env.APP_NAME || "astral-ledger-api" });
    }

    if (path === "/api/codex/traits") {
      const items: CodexListItem[] = await getTraitsList();
      return json({
        entityType: "trait",
        items,
        generatedAt: new Date().toISOString()
      });
    }

    const traitMatch = path.match(/^\/api\/codex\/traits\/([a-z0-9-]+)$/);
    if (traitMatch) {
      const slug = traitMatch[1];
      const detail: CodexDetail | null = await getTraitDetail(slug);
      if (!detail) {
        return json({ error: "Not found" }, { status: 404 });
      }
      return json(detail);
    }

    return json({ error: "Not found" }, { status: 404 });
  }
};
