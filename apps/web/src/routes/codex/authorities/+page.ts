import type { CodexListItem } from "../../../../../packages/contracts/src";
import { fetchAuthorities } from "../../../lib/api/codex";

export async function load() {
  const items: CodexListItem[] = await fetchAuthorities();
  return { items };
}
