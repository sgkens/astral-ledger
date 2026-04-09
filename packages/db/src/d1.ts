import type { CodexDetail, CodexListItem, PatchHistoryEntry } from "@astral-ledger/contracts";

export interface D1Like {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T = Record<string, unknown>>(): Promise<T | null>;
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
    first<T = Record<string, unknown>>(): Promise<T | null>;
    all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  };
}

type EntityRow = {
  id: number;
  slug: string;
  name: string;
  summary: string | null;
  source_url: string | null;
  changed_in_patch: string | null;
};

type EffectRow = {
  effect_text: string;
};

type RequirementRow = {
  requirement_text: string;
  requirement_type: string | null;
};

export async function getTraitsListFromD1(db: D1Like): Promise<CodexListItem[]> {
  const result = await db.prepare(`
    SELECT id, slug, name, summary, source_url, changed_in_patch
    FROM entities
    WHERE entity_type = 'trait'
    ORDER BY name ASC
  `).all<EntityRow>();

  return result.results.map((row) => ({
    slug: row.slug,
    name: row.name,
    entityType: "trait",
    summary: row.summary ?? undefined,
    patchChangedIn: row.changed_in_patch ?? undefined,
    tags: []
  }));
}

export async function getTraitDetailFromD1(db: D1Like, slug: string): Promise<CodexDetail | null> {
  const entity = await db.prepare(`
    SELECT id, slug, name, summary, source_url, changed_in_patch
    FROM entities
    WHERE entity_type = 'trait' AND slug = ?
    LIMIT 1
  `).bind(slug).first<EntityRow>();

  if (!entity) return null;

  const effects = await db.prepare(`
    SELECT effect_text
    FROM entity_effects
    WHERE entity_id = ?
    ORDER BY display_order ASC, id ASC
  `).bind(entity.id).all<EffectRow>();

  const reqs = await db.prepare(`
    SELECT requirement_text, requirement_type
    FROM entity_requirements
    WHERE entity_id = ?
    ORDER BY display_order ASC, id ASC
  `).bind(entity.id).all<RequirementRow>();

  const requirements = reqs.results
    .filter((r) => !r.requirement_type || r.requirement_type == "requirement")
    .map((r) => r.requirement_text);

  const restrictions = reqs.results
    .filter((r) => r.requirement_type == "restriction")
    .map((r) => r.requirement_text);

  const patchHistory: PatchHistoryEntry[] = entity.changed_in_patch
    ? [{ patchVersion: entity.changed_in_patch, changeKind: "modified", changeSummary: "Loaded from D1." }]
    : [];

  return {
    name: entity.name,
    slug: entity.slug,
    entityType: "trait",
    summary: entity.summary ?? undefined,
    effects: effects.results.map((e) => e.effect_text),
    requirements,
    restrictions,
    patchHistory,
    source: {
      label: "Stellaris Wiki",
      url: entity.source_url ?? "https://stellaris.paradoxwikis.com/Traits"
    },
    tags: []
  };
}
