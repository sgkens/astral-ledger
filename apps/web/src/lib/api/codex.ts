import type { CodexDetail, CodexListItem } from "../../../../packages/contracts/src";

const API_BASE = "/api";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }
  return await response.json() as T;
}

export async function fetchTraits(): Promise<CodexListItem[]> {
  const data = await fetchJson<{ items: CodexListItem[] }>("/codex/traits");
  return data.items;
}

export async function fetchTrait(slug: string): Promise<CodexDetail> {
  return await fetchJson<CodexDetail>(`/codex/traits/${slug}`);
}

export async function fetchEthics(): Promise<CodexListItem[]> {
  const data = await fetchJson<{ items: CodexListItem[] }>("/codex/ethics");
  return data.items;
}

export async function fetchEthic(slug: string): Promise<CodexDetail> {
  return await fetchJson<CodexDetail>(`/codex/ethics/${slug}`);
}
