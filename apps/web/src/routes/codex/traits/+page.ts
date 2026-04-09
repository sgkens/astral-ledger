import type { CodexListItem } from "../../../../../packages/contracts/src";
import { fetchTraits } from "../../../lib/api/codex";

export async function load() {
  const items: CodexListItem[] = await fetchTraits();
  return { items };
}
