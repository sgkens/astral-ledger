import type { CodexDetail, CodexListItem, PatchHistoryEntry, EntityType } from "@astral-ledger/contracts";

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

export async function getEntityListFromD1(db: D1Like, entityType: EntityType): Promise<CodexListItem[]> {
  const result = await db.prepare(`
    SELECT id, slug, name, summary, source_url, changed_in_patch
    FROM entities
    WHERE entity_type = ?
    ORDER BY name ASC
  `).bind(entityType).all<EntityRow>();

  return result.results.map((row) => ({
    slug: row.slug,
    name: row.name,
    entityType,
    summary: row.summary ?? undefined,
    patchChangedIn: row.changed_in_patch ?? undefined,
    tags: []
  }));
}

export async function getEntityDetailFromD1(db: D1Like, entityType: EntityType, slug: string): Promise<CodexDetail | null> {
  const entity = await db.prepare(`
    SELECT id, slug, name, summary, source_url, changed_in_patch
    FROM entities
    WHERE entity_type = ? AND slug = ?
    LIMIT 1
  `).bind(entityType, slug).first<EntityRow>();

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
    .filter((r) => !r.requirement_type || r.requirement_type === "requirement")
    .map((r) => r.requirement_text);

  const restrictions = reqs.results
    .filter((r) => r.requirement_type === "restriction")
    .map((r) => r.requirement_text);

  const patchHistory: PatchHistoryEntry[] = entity.changed_in_patch
    ? [{ patchVersion: entity.changed_in_patch, changeKind: "modified", changeSummary: "Loaded from D1." }]
    : [];

  return {
    name: entity.name,
    slug: entity.slug,
    entityType,
    summary: entity.summary ?? undefined,
    effects: effects.results.map((e) => e.effect_text),
    requirements,
    restrictions,
    patchHistory,
    source: {
      label: "Stellaris Wiki",
      url: entity.source_url ?? "https://stellaris.paradoxwikis.com/Stellaris_Wiki"
    },
    tags: []
  };
}

export const getTraitsListFromD1 = (db: D1Like) => getEntityListFromD1(db, "trait");
export const getTraitDetailFromD1 = (db: D1Like, slug: string) => getEntityDetailFromD1(db, "trait", slug);
export const getEthicsListFromD1 = (db: D1Like) => getEntityListFromD1(db, "ethic");
export const getEthicDetailFromD1 = (db: D1Like, slug: string) => getEntityDetailFromD1(db, "ethic", slug);
export const getAuthoritiesListFromD1 = (db: D1Like) => getEntityListFromD1(db, "authority");
export const getAuthorityDetailFromD1 = (db: D1Like, slug: string) => getEntityDetailFromD1(db, "authority", slug);
