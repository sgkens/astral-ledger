export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data, null, 2), { ...init, headers });
}

const sampleTraits = [
  {
    slug: "intelligent",
    name: "Intelligent",
    entityType: "trait",
    summary: "This species excels at advanced reasoning and research.",
    imageThumb: "/images/traits/intelligent/thumb.webp",
    patchChangedIn: "4.3",
    tags: ["science", "research", "biological"]
  }
];

const sampleTraitDetails: Record<string, unknown> = {
  intelligent: {
    name: "Intelligent",
    slug: "intelligent",
    entityType: "trait",
    summary: "This species excels at advanced reasoning and research.",
    effects: ["+10% Research from Jobs"],
    requirements: [],
    restrictions: [],
    patchHistory: [
      {
        patchVersion: "4.3",
        changeKind: "modified",
        changeSummary: "Starter sample record for vertical slice development."
      }
    ],
    source: {
      label: "Stellaris Wiki",
      url: "https://stellaris.paradoxwikis.com/Traits"
    },
    image: {
      thumb: "/images/traits/intelligent/thumb.webp",
      original: "/images/traits/intelligent/original.png"
    },
    tags: ["science", "research", "biological"]
  }
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");

    if (path === "/api/health") {
      return json({ ok: true, service: "astral-ledger-api" });
    }

    if (path === "/api/codex/traits") {
      return json({
        entityType: "trait",
        items: sampleTraits,
        generatedAt: new Date().toISOString()
      });
    }

    const traitMatch = path.match(/^\/api\/codex\/traits\/([a-z0-9-]+)$/);
    if (traitMatch) {
      const slug = traitMatch[1];
      const detail = sampleTraitDetails[slug];
      if (!detail) {
        return json({ error: "Not found" }, { status: 404 });
      }
      return json(detail);
    }

    return json({ error: "Not found" }, { status: 404 });
  }
};
