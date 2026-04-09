export type EntityType =
  | "trait"
  | "civic"
  | "origin"
  | "ethic"
  | "authority"
  | "tradition"
  | "ascension_perk";

export interface SourceRef {
  label: string;
  url: string;
}

export interface ImageRef {
  thumb?: string;
  original?: string;
}

export interface PatchHistoryEntry {
  patchVersion: string;
  changeKind: "introduced" | "modified" | "deprecated" | "removed";
  changeSummary?: string;
}

export interface CodexListItem {
  slug: string;
  name: string;
  entityType: EntityType;
  summary?: string;
  imageThumb?: string;
  patchChangedIn?: string;
  tags?: string[];
}

export interface CodexDetail {
  name: string;
  slug: string;
  entityType: EntityType;
  summary?: string;
  effects: string[];
  requirements: string[];
  restrictions: string[];
  patchHistory: PatchHistoryEntry[];
  source: SourceRef;
  image?: ImageRef;
  tags?: string[];
}
