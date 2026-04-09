import type { CodexDetail, CodexListItem } from "../../../../packages/contracts/src";

const API_BASE = "/api";

export async function fetchTraits(): Promise<CodexListItem[]> {
  const response = await fetch(`${API_BASE}/codex/traits`);
  if (!response.ok) throw new Error(`Failed to fetch traits: ${response.status}`);
  const data = await response.json() as { items: CodexListItem[] };
  return data.items;
}

export async function fetchTrait(slug: string): Promise<CodexDetail> {
  const response = await fetch(`${API_BASE}/codex/traits/${slug}`);
  if (!response.ok) throw new Error(`Failed to fetch trait ${slug}: ${response.status}`);
  return await response.json() as CodexDetail;
}
